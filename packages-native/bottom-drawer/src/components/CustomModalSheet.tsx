import { createElement, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import BottomSheet from "reanimated-bottom-sheet";
import { Dimensions, LayoutChangeEvent, Text, View } from "react-native";
import { EditableValue, ValueStatus } from "mendix";
import { BottomDrawerStyle } from "../ui/Styles";

interface CustomModalSheetProps {
    triggerAttribute?: EditableValue<boolean>;
    content?: ReactNode;
    styles: BottomDrawerStyle;
}

export const CustomModalSheet = (props: CustomModalSheetProps): ReactElement => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [heightContent, setHeightContent] = useState(0);
    const maxHeight = Dimensions.get("window").height - 100;

    useEffect(() => {
        if (
            props.triggerAttribute &&
            props.triggerAttribute.status === ValueStatus.Available &&
            bottomSheetRef.current &&
            heightContent > 0
        ) {
            if (props.triggerAttribute.value) {
                console.warn("Snapping to first value");
                bottomSheetRef.current.snapTo(0);
            } else {
                console.warn("Snapping to last value");
                bottomSheetRef.current.snapTo(1);
            }
        }
    }, [props.triggerAttribute, bottomSheetRef.current, heightContent]);

    const onLayoutHandlerContent = (event: LayoutChangeEvent): void => {
        const height = event.nativeEvent.layout.height;
        if (height > 0) {
            if (height <= maxHeight) {
                setHeightContent(height);
                console.warn(`Content height ${height}`);
            } else {
                setHeightContent(maxHeight);
                console.warn(`Content height is max height ${maxHeight}`);
            }
        }
    };

    return (
        <View style={props.styles.container}>
            <BottomSheet
                ref={bottomSheetRef}
                snapPoints={[heightContent, 0]}
                renderHeader={() => <Text>Test</Text>}
                renderContent={() => <View onLayout={onLayoutHandlerContent}>{props.content}</View>}
            />
        </View>
    );
};
