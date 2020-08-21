import { background, font, input }  from "../variables";
import { TextBox, TextBoxVertical } from "./textbox";
import { DatePickerType }           from "../../types/widgets";
/*

DISCLAIMER:
Do not change this file because it is core styling.
Customizing core files will make updating Atlas much more difficult in the future.
To customize any core styling, copy the part you want to customize to styles/native/app/ so the core styling is overwritten.

==========================================================================
    Date Picker

    Default Class For Mendix Date Picker Widget
========================================================================== */
// Font color of native iOS datepicker can not be changed.
// To fix this we change the background color of the picker if OS theme is dark and app theme is light (And the other way around).
// const isOSDarkMode = NativeModules && NativeModules.RNDarkMode && NativeModules.RNDarkMode.initialMode && NativeModules.RNDarkMode.initialMode === "dark";
// const pickerBackgroundColor = !darkMode && isOSDarkMode ?
//                               "rgba(0, 0, 0, 1)" :
//                               darkMode && !isOSDarkMode ? "rgba(255, 255, 255, 1)" : input.input.backgroundColor;
//
export const DatePicker: DatePickerType = {
    container: {
        // All ViewStyle properties are allowed
        ...TextBox.container,
    },
    containerDisabled: {
        // All ViewStyle properties are allowed
      ...TextBox.containerDisabled
    },
    label: {
        // numberOfLines and all TextStyle properties are allowed
        ...TextBox.label,
    },
    labelDisabled: {
        // All TextStyle properties are allowed
      ...TextBox.labelDisabled
    },
    pickerIOS: {
        // All ViewStyle properties & "color" (type: string) are allowed
        backgroundColor: background.primary,
        color: font.colorTitle,
    },
    pickerBackdropIOS: {
        // All ViewStyle properties are allowed
    },
    pickerTopIOS: {
        // All ViewStyle properties are allowed
        backgroundColor: background.primary,
    },
    value: {
        // All TextStyle properties are allowed
        color: input.input.color,
        borderColor: input.input.borderColor,
        backgroundColor: input.input.backgroundColor,

        fontSize: input.input.fontSize,
        lineHeight: input.input.lineHeight,
        fontFamily: font.family,
        borderWidth: input.input.borderWidth,
        borderRadius: input.input.borderRadius,

        textAlignVertical: "center",
        minWidth: input.input.minWidth,
        minHeight: input.input.minHeight,
        paddingHorizontal: input.input.paddingHorizontal,
        paddingVertical: input.input.paddingVertical,
    },
    valueDisabled: {
        // All TextStyle properties are allowed
        backgroundColor: input.inputDisabled.backgroundColor,
        color: TextBox.inputDisabled?.color
    },
    placeholder: {
        // All TextStyle properties are allowed
        color: input.input.placeholderTextColor,
    },
    placeholderDisabled: {
        // All TextStyle properties are allowed
        color: TextBox.inputDisabled?.color
    },
    validationMessage: {
        // All TextStyle properties are allowed
        ...TextBox.validationMessage,
    },
};
export const DatePickerVertical: DatePickerType = {
    container: TextBoxVertical.container,
    label: TextBoxVertical.label,
    value: DatePicker.value,
    placeholder: DatePicker.placeholder,
    validationMessage: TextBoxVertical.validationMessage,
};
