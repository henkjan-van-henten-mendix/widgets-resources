import { Platform }                             from "react-native";
import { background, brand, contrast, spacing } from "../variables";
import { TextBox, TextBoxVertical }             from "./textbox";
import { CheckBoxType }                         from "../../types/widgets";
/*

DISCLAIMER:
Do not change this file because it is core styling.
Customizing core files will make updating Atlas much more difficult in the future.
To customize any core styling, copy the part you want to customize to styles/native/app/ so the core styling is overwritten.

==========================================================================
    CheckBox

    Default Class For Mendix CheckBox Widget
========================================================================== */
export const CheckBox: CheckBoxType = {
    container: {
        // All ViewStyle properties are allowed
        ...TextBox.container,
        paddingVertical: spacing.smallest,
        justifyContent: "center",
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
    input: {
        // thumbColorOn, thumbColorOff, trackColorOn, trackColorOff and all TextStyle properties are allowed
        backgroundColor: "transparent",
        marginRight: Platform.select({android: -3}),
        thumbColorOn: background.primary,
        trackColorOn: brand.primary,
        thumbColorOff: contrast.low,
        trackColorOff: contrast.lower,
    },
    inputDisabled: {
        // thumbColorOn, thumbColorOff, trackColorOn, trackColorOff and all TextStyle properties are allowed
        thumbColorOn: "#F8F8F8",
        trackColorOn: "#9DA1A8",
        thumbColorOff: "#F8F8F8",
        trackColorOff: "#CED0D3",
    },
    inputError: {
        // thumbColorOn, thumbColorOff, trackColorOn, trackColorOff and all TextStyle properties are allowed
        ...TextBox.inputError,
        thumbColorOn: background.primary,
        trackColorOn: brand.danger,
        thumbColorOff: contrast.low,
        trackColorOff: brand.danger,
    },
    validationMessage: {
        // All TextStyle properties are allowed
        ...TextBox.validationMessage,
        alignSelf: "stretch",
    },
};
export const CheckBoxVertical: CheckBoxType = {
    container: TextBoxVertical.container,
    label: {
        ...TextBoxVertical.label,
    },
    input: {
        ...CheckBox.input,
        alignSelf: "flex-start",
    },
    inputDisabled: CheckBox.inputDisabled,
    inputError: {
        ...TextBoxVertical.inputError,
        thumbColorOn: background.primary,
        trackColorOn: brand.danger,
        thumbColorOff: contrast.low,
        trackColorOff: brand.danger,
    },
    validationMessage: {
        ...TextBoxVertical.validationMessage,
        alignSelf: "stretch",
    },
};
