import {
    createElement,
    CSSProperties,
    Dispatch,
    ReactElement,
    ReactNode,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import { ColumnSelector } from "./ColumnSelector";
import { Pagination } from "./Pagination";
import { Header } from "./Header";
import { InfiniteBody } from "./InfiniteBody";
import { EditableValue, ValueStatus } from "mendix";
import {
    ColumnInterface,
    ColumnWithStrictAccessor,
    Filters,
    FilterValue,
    IdType,
    Row,
    SortingRule,
    useColumnOrder,
    useFilters,
    useFlexLayout,
    usePagination,
    useResizeColumns,
    useSortBy,
    useTable
} from "react-table";
import { ColumnsPreviewType, ColumnsType, FilterMethodEnum } from "../../typings/DatagridProps";
import deepEqual from "deep-equal";

export type TableColumn = Omit<ColumnsType | ColumnsPreviewType, "content" | "attribute">;

export interface TableProps<T> {
    className: string;
    data: T[];
    columns: TableColumn[];
    headerWidgets?: ReactNode;
    footerWidgets?: ReactNode;
    columnsFilterable: boolean;
    columnsSortable: boolean;
    columnsResizable: boolean;
    columnsDraggable: boolean;
    columnsHidable: boolean;
    numberOfItems?: number;
    paging: boolean;
    page: number;
    pageSize: number;
    pagingPosition: string;
    setPage?: (computePage: (prevPage: number) => number) => void;
    styles?: CSSProperties;
    hasMoreItems: boolean;
    cellRenderer: (renderWrapper: (children: ReactNode) => ReactElement, value: T, columnIndex: number) => ReactElement;
    valueForFilter: (value: T, columnIndex: number) => string | undefined;
    valueForSort: (value: T, columnIndex: number) => string | BigJs.Big | boolean | Date | undefined;
    filterRenderer: (renderWrapper: (children: ReactNode) => ReactElement, columnIndex: number) => ReactElement;
    filterMethod: FilterMethodEnum;
    settings?: EditableValue<string>;
}

export function Table<T>(props: TableProps<T>): ReactElement {
    const isSortingOrFiltering = props.columnsFilterable || props.columnsSortable;
    const isInfinite = !props.paging && !isSortingOrFiltering;
    const [dragOver, setDragOver] = useState("");
    const [columnSelectorWidth, setColumnSelectorWidth] = useState(0);
    const filteredColumns = props.columns.map((c, index) => ({
        header: typeof c.header === "object" ? c.header.value : c.header,
        id: index.toString(),
        hidable: c.hidable
    })) as Array<{ header: string; id: string; hidable: string }>;
    const [
        columnOrder,
        setColumnOrder,
        hiddenColumns,
        setHiddenColumns,
        sortBy,
        setSortBy,
        filters,
        setFilters
    ] = useSettings(props.settings, filteredColumns);
    const [paginationIndex, setPaginationIndex] = useState<number>(0);

    console.warn("Order: ", columnOrder);
    console.warn("Hidden: ", hiddenColumns);
    console.warn("Sort: ", sortBy);
    console.warn("Filters: ", filters);

    useEffect(() => {
        if (props.settings && props.settings.status === ValueStatus.Available) {
            const newSettings = JSON.stringify(
                createSettings(
                    {
                        columnOrder,
                        hiddenColumns,
                        sortBy,
                        filters
                    },
                    filteredColumns
                ) ?? []
            );
            if (!deepEqual(props.settings.value, newSettings, { strict: true })) {
                props.settings.setValue(newSettings);
            }
        }
    }, [columnOrder, hiddenColumns, sortBy, filters]);

    const filterTypes = useMemo(
        () => ({
            text: (rows: Array<Row<object>>, id: IdType<object>, filterValue: FilterValue) => {
                return rows.filter(row => {
                    const value = props.valueForFilter(row.values[id], Number(id));
                    if (!filterValue) {
                        return true;
                    }

                    if (!value) {
                        return false;
                    }

                    switch (props.filterMethod) {
                        case "contains":
                            return value.toLowerCase().includes(String(filterValue).toLowerCase());
                        case "endsWith":
                            return value.toLowerCase().endsWith(String(filterValue).toLowerCase());
                        case "startsWith":
                            return value.toLowerCase().startsWith(String(filterValue).toLowerCase());
                        default:
                            return false;
                    }
                });
            }
        }),
        [props.columns, props.filterMethod, props.valueForFilter]
    );
    const tableColumns: Array<ColumnWithStrictAccessor<{ item: T }>> = useMemo(
        () =>
            props.columns.map((column, index) => ({
                id: index.toString(),
                accessor: "item",
                Header: typeof column.header === "object" ? column.header.value : column.header,
                filter: "text",
                hidden: column.hidable === "hidden",
                canHide: column.hidable !== "no",
                canDrag: column.draggable,
                customFilter:
                    column.filterable === "custom"
                        ? props.filterRenderer((children: ReactNode) => <div className="filter">{children}</div>, index)
                        : null,
                disableSortBy: !column.sortable,
                disableResizing: !column.resizable,
                disableFilters: column.filterable === "no",
                sortType: (rowA: Row<{ item: T }>, rowB: Row<{ item: T }>, columnId: IdType<object>): number => {
                    const valueA = props.valueForSort(rowA.values[columnId], Number(columnId)) || "";
                    const valueB = props.valueForSort(rowB.values[columnId], Number(columnId)) || "";
                    // Values should always be sorted in ASC mode https://github.com/tannerlinsley/react-table/pull/2504
                    if (typeof valueA === "string" && typeof valueB === "string") {
                        return valueA.localeCompare(valueB);
                    } else if (typeof valueA === "boolean" && typeof valueB === "boolean") {
                        // True first
                        return valueA === valueB ? 0 : valueA ? -1 : 1;
                    } else if (valueA instanceof Date && valueB instanceof Date) {
                        return (valueA as Date).getTime() - (valueB as Date).getTime();
                    }
                    return Number(valueA) - Number(valueB);
                },
                Cell: ({ cell, value }) =>
                    props.cellRenderer(
                        (children: ReactNode) => (
                            <div
                                {...cell.getCellProps()}
                                {...(!props.columnsResizable ? { style: { flex: "1 1 0px" } } : {})}
                                className="td"
                            >
                                {children}
                            </div>
                        ),
                        value,
                        index
                    )
            })),
        [props.columns]
    );

    const defaultColumn: ColumnInterface<{ item: T }> = useMemo(
        () => ({
            Filter: ({ column: { filterValue, setFilter, id } }): ReactElement => (
                <div className="filter">
                    <input
                        className="form-control"
                        value={filterValue || ""}
                        onChange={e => {
                            const value = e.target.value || undefined; // Set undefined to remove the filter entirely
                            setFilter(value);
                            setFilters(prev => {
                                if (value) {
                                    const previousFilter = prev.find(c => c.id === id);
                                    if (previousFilter) {
                                        previousFilter.value = value;
                                    } else {
                                        prev.push({ id, value });
                                    }
                                } else {
                                    prev.splice(
                                        prev.findIndex(c => c.id === id),
                                        1
                                    );
                                }
                                return [...prev];
                            });
                        }}
                    />
                </div>
            ),
            ...(props.columnsResizable
                ? {
                      width: 150, // width is used for both the flex-basis and flex-grow
                      maxWidth: 200, // maxWidth is only used as a limit for resizing
                      minWidth: 15 // minWidth is only used as a limit for resizing
                  }
                : {})
        }),
        [props.columns]
    );

    const {
        getTableProps,
        headerGroups,
        rows,
        page: rowsPagination,
        prepareRow,
        getTableBodyProps,
        allColumns,
        setColumnOrder: setOrder,
        visibleColumns,
        state: { pageIndex },
        gotoPage,
        previousPage,
        nextPage,
        canPreviousPage,
        canNextPage
    } = useTable<{ item: T }>(
        {
            columns: tableColumns,
            data: useMemo(() => props.data.map(item => ({ item })), [props.data]),
            defaultColumn,
            filterTypes,
            disableResizing: !props.columnsResizable,
            disableSortBy: !props.columnsSortable,
            disableFilters: !props.columnsFilterable,
            initialState: {
                pageSize: props.pageSize,
                columnOrder,
                hiddenColumns,
                pageIndex: paginationIndex,
                sortBy,
                filters
            },
            disableMultiSort: true,
            autoResetSortBy: false
        },
        useFilters,
        useSortBy,
        usePagination,
        useColumnOrder,
        useFlexLayout,
        useResizeColumns
    );

    const pagination = props.paging ? (
        !isInfinite && !isSortingOrFiltering ? (
            <Pagination
                canNextPage={props.hasMoreItems}
                canPreviousPage={props.page !== 0}
                gotoPage={(page: number) => props.setPage && props.setPage(() => page)}
                nextPage={() => props.setPage && props.setPage(prev => prev + 1)}
                numberOfItems={props.numberOfItems}
                page={props.page}
                pageSize={props.pageSize}
                previousPage={() => props.setPage && props.setPage(prev => prev - 1)}
            />
        ) : (
            <Pagination
                canNextPage={canNextPage}
                canPreviousPage={canPreviousPage}
                gotoPage={gotoPage}
                nextPage={nextPage}
                numberOfItems={rows.length}
                page={pageIndex}
                pageSize={props.pageSize}
                previousPage={previousPage}
                setPaginationIndex={setPaginationIndex}
            />
        )
    ) : null;

    return (
        <div className={props.className} style={props.styles}>
            <div {...getTableProps()} className="table">
                <div role="rowgroup" className="thead">
                    {props.headerWidgets}
                    {props.pagingPosition === "top" && pagination}
                    {headerGroups.map((headerGroup, index: number) => (
                        <div {...headerGroup.getHeaderGroupProps({})} key={`headers_row_${index}`} className="tr">
                            {headerGroup.headers.map((column, index) => (
                                <Header
                                    column={column}
                                    key={`headers_column_${index}`}
                                    draggable={props.columnsDraggable}
                                    dragOver={dragOver}
                                    filterable={props.columnsFilterable}
                                    resizable={props.columnsResizable}
                                    setColumnOrder={(newOrder: Array<IdType<object>>) => {
                                        setOrder(newOrder);
                                        setColumnOrder(newOrder);
                                    }}
                                    setDragOver={setDragOver}
                                    setSortBy={setSortBy}
                                    sortable={props.columnsSortable}
                                    visibleColumns={visibleColumns}
                                />
                            ))}
                            {props.columnsHidable && (
                                <ColumnSelector
                                    allColumns={allColumns}
                                    width={columnSelectorWidth}
                                    setWidth={setColumnSelectorWidth}
                                    setHiddenColumns={setHiddenColumns}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <InfiniteBody
                    isInfinite={isInfinite}
                    hasMoreItems={props.hasMoreItems}
                    setPage={props.setPage}
                    {...getTableBodyProps()}
                >
                    {(isSortingOrFiltering && props.paging ? rowsPagination : rows).map((row, index) => {
                        prepareRow(row);
                        return (
                            <div {...row.getRowProps()} key={`row_${index}`} className="tr">
                                {row.cells.map(cell => cell.render("Cell"))}
                                {props.columnsHidable && (
                                    <div className="td column-selector" style={{ width: columnSelectorWidth }} />
                                )}
                            </div>
                        );
                    })}
                </InfiniteBody>
                <div className="tfoot">
                    {props.pagingPosition === "bottom" && pagination}
                    {props.footerWidgets}
                </div>
            </div>
        </div>
    );
}

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

function createSettings(
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

declare type Option<T> = T | undefined;

function useSettings(
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
        [settings]
    );

    useEffect(() => {
        if (settings && settings.status === ValueStatus.Available && settings.value) {
            newSettings = extractSettings(JSON.parse(settings.value) as PersistedSettings[]);
            setColumnOrder(newSettings.columnOrder);
            setHiddenColumns(newSettings.hiddenColumns);
            setSortBy(newSettings.sortBy);
            setFilters(newSettings.filters);
            console.warn("New settings", newSettings);
        }
    }, [settings]);

    console.warn("I Order: ", columnOrder);
    console.warn("I Hidden: ", hiddenColumns);
    console.warn("I Sort: ", sortBy);
    console.warn("I Filters: ", filters);

    return [columnOrder, setColumnOrder, hiddenColumns, setHiddenColumns, sortBy, setSortBy, filters, setFilters];
}
