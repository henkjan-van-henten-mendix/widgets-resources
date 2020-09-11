import { createElement, ReactElement, useMemo } from "react";
import { Text, View } from "react-native";

import { LineChartStyle } from "../ui/Styles";

export interface LegendProps {
    series: Array<LegendSeries>;
    style: LineChartStyle;
}

export interface LegendSeries {
    name: string;
    stylePropertyName: string;
}

export function Legend(props: LegendProps): ReactElement | null {
    const { series, style } = props;

    const legendElements = useMemo(
        () =>
            series.map((series, index) => (
                <View>
                    <View style={{ backgroundColor: style.series[series.stylePropertyName].line.data.stroke }} />
                    <Text>{series.name}</Text>
                </View>
            )),
        [series]
    );

    return <View>{legendElements}</View>;
}
