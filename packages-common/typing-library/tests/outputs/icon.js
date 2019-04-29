var iconWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Team
 */
import { CSSProperties } from "react";
import { pages } from "mendixmodelsdk";
import { DynamicValue, WebIcon } from "@mendix/pluggable-widgets-api/properties";

interface CommonProps {
    id: string;
    class: string;
    style?: CSSProperties;
    tabIndex: number;
}

export interface IconsType {
    firstIcon: DynamicValue<WebIcon>;
    secondIcon: DynamicValue<WebIcon>;
}

export interface IconsPreviewType {
    firstIcon: WebIcon;
    secondIcon: WebIcon;
}

export interface IconsVisibilityType {
    firstIcon: boolean;
    secondIcon: boolean;
}

export interface MyWidgetContainerProps extends CommonProps {
    icons: IconsType[];
}

export interface MyWidgetPreviewProps extends CommonProps {
    icons: IconsPreviewType[];
}

export interface VisibilityMap {
    icons: IconsVisibilityType[] | boolean;
}
`;

var iconNativeOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Team
 */
import { DynamicValue, NativeIcon } from "@mendix/pluggable-widgets-api/properties";

interface CommonProps<Style> {
    style: Style[];
}

export interface IconsType {
    firstIcon: DynamicValue<NativeIcon>;
    secondIcon: DynamicValue<NativeIcon>;
}

export interface MyWidgetProps<Style> extends CommonProps<Style> {
    icons: IconsType[];
}
`

module.exports = {iconWebOutput, iconNativeOutput};
