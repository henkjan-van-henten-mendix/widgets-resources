import { Filters, IdType, SortingRule } from "react-table";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { EditableValue, ValueStatus } from "mendix";
import deepEqual from "deep-equal";

declare type Option<T> = T | undefined;

interface Settings {
    columnOrder: Array<IdType<object>>;
    hiddenColumns: Array<IdType<object>>;
    sortBy: Array<SortingRule<object>>;
    filters: Filters<object>;
}

interface PersistedSettings {
    column: string;
    sort: boolean;
    sortMethod: "asc" | "desc";
    filter: string;
    hidden: boolean;
    order: number;
}

export function createSettings(
    { columnOrder, hiddenColumns, sortBy, filters }: Settings,
    columns: Array<{ header: string; id: string }>
): PersistedSettings[] {
    return columns.map(column => ({
        column: column.header,
        sort: !!sortBy.find(s => s.id === column.id),
        sortMethod: sortBy.find(s => s.id === column.id)?.desc ? "desc" : "asc",
        filter: filters.find(f => f.id === column.id)?.value ?? "",
        hidden: !!hiddenColumns.find(h => h === column.id),
        order: columnOrder.findIndex(o => o === column.id)
    }));
}

export function useSettings(
    settings: Option<EditableValue<string>>,
    columns: Array<{ header: string; id: string; hidable: string }>
): [
    Array<IdType<object>>,
    Dispatch<SetStateAction<Array<IdType<object>>>>,
    Array<IdType<object>>,
    Dispatch<SetStateAction<Array<IdType<object>>>>,
    Array<SortingRule<object>>,
    Dispatch<SetStateAction<Array<SortingRule<object>>>>,
    Filters<object>,
    Dispatch<SetStateAction<Filters<object>>>
] {
    let newSettings: Settings = { columnOrder: [], hiddenColumns: [], sortBy: [], filters: [] };
    const [columnOrder, setColumnOrder] = useState<Array<IdType<object>>>(newSettings.columnOrder);
    const [hiddenColumns, setHiddenColumns] = useState<Array<IdType<object>>>(
        (newSettings.hiddenColumns.length > 0
            ? newSettings.hiddenColumns
            : (columns
                  .map((c, i) => (c.hidable === "hidden" ? i.toString() : undefined))
                  .filter(Boolean) as string[])) ?? []
    );
    const [sortBy, setSortBy] = useState<Array<SortingRule<object>>>(newSettings.sortBy);
    const [filters, setFilters] = useState<Filters<object>>(newSettings.filters);

    const extractSettings = useCallback(
        (settings: PersistedSettings[]): Settings => {
            return {
                columnOrder: settings
                    .sort((a, b) => a.order - b.order)
                    .map(s => columns.find(c => c.header === s.column)?.id || ""),
                hiddenColumns: settings
                    .filter(s => s.hidden)
                    .map(s => columns.find(c => c.header === s.column)?.id || ""),
                sortBy: settings
                    .filter(s => s.sort)
                    .map(s => ({
                        id: columns.find(c => c.header === s.column)?.id || "",
                        desc: s.sortMethod === "desc"
                    })),
                filters: settings
                    .filter(s => s.filter)
                    .map(s => ({ id: columns.find(c => c.header === s.column)?.id || "", value: s.filter }))
            };
        },
        [settings, columns]
    );

    useEffect(() => {
        if (settings && settings.status === ValueStatus.Available && settings.value) {
            newSettings = extractSettings(JSON.parse(settings.value) as PersistedSettings[]);
            setColumnOrder(newSettings.columnOrder);
            setHiddenColumns(newSettings.hiddenColumns);
            setSortBy(newSettings.sortBy);
            setFilters(newSettings.filters);
        }
    }, [settings]);

    useEffect(() => {
        if (settings && settings.status === ValueStatus.Available) {
            const newSettings = JSON.stringify(
                createSettings(
                    {
                        columnOrder,
                        hiddenColumns,
                        sortBy,
                        filters
                    },
                    columns
                ) ?? []
            );
            if (!deepEqual(settings.value, newSettings, { strict: true })) {
                settings.setValue(newSettings);
            }
        }
    }, [columnOrder, hiddenColumns, sortBy, filters]);

    return [columnOrder, setColumnOrder, hiddenColumns, setHiddenColumns, sortBy, setSortBy, filters, setFilters];
}
