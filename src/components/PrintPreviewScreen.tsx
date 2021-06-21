import React, { useState } from 'react';
import {
    View,
    Button,
    StyleSheet,
    Dimensions,
    GestureResponderEvent,
    TextInput,
    Text,
} from 'react-native';
import { GestureEvent, HandlerStateChangeEvent, PinchGestureHandler, PinchGestureHandlerEventPayload, State } from 'react-native-gesture-handler';
import { NavigationFunctionComponent } from 'react-native-navigation';
import RNPrint from 'react-native-print';
import RenderHTML from 'react-native-render-html';

const window = Dimensions.get("window"); // TODO: Do not cache dimensions to support resizing screen.
const previewMargin = 16; // margin per side
const letterPaperAspectRatio = 1.2941; // 1:1.2941

interface Props {
    /** react-native-navigation component id. */
    componentId: string;
    /** Base64 representation of the QR code. */
    base64: string;
}

const PrintPreviewScreen: NavigationFunctionComponent<Props> = (props: Props) => {

    const [qrX, setQRX] = useState(0);
    const [qrY, setQRY] = useState(0);
    const [qrWidth, setQRWidth] = useState(50);
    const [qrHeight, setQRHeight] = useState(50);
    const [oldQRWidth, setOldQRWidth] = useState(qrWidth);
    const [oldQRHeight, setOldQRHeight] = useState(qrHeight);

    const [touchX, setTouchX] = useState(0);
    const [touchY, setTouchY] = useState(0);
    const [oldTouchX, setOldTouchX] = useState(0);
    const [oldTouchY, setOldTouchY] = useState(0);

    /** Send a print-ready QR code document to the native print service. */
    const handlePrint = async () => {
        await RNPrint.print({
            html: generatePrintableHTML(),
        });
    }

    /** Generate a preview HTML document of the QR code. */
    const generatePreviewHTML = (): string => {
        const previewWidth = window.width - (previewMargin * 2); // dp
        const previewHeight = previewWidth * letterPaperAspectRatio; // dp
        const leftPercent = (qrX / previewWidth) * 100; // percent
        const topPercent = (qrY / previewHeight) * 100; // percent

        return `
            <html style='margin: 0dp; padding: 0dp; height: ${previewWidth}dp'>
            <body style='margin: 0dp; padding: 0dp; height: ${previewHeight}dp'>
                <img style='position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${qrWidth}dp; height: ${qrHeight}dp;' src='data:image/png;base64, ${props.base64}'/>
            </body>
            </html>
        `;
    }

    /** Generate a print-ready HTML document of the QR code. */
    const generatePrintableHTML = (): string => {
        const previewWidth = window.width - (previewMargin * 2); // dp
        const previewHeight = previewWidth * letterPaperAspectRatio; // dp
        const leftPercent = (qrX / previewWidth) * 100;
        const topPercent = (qrY / previewHeight) * 100;
        const qrWidthPercent = (qrWidth / previewWidth) * 100;
        const qrHeightPercent = (qrHeight / previewHeight) * 100;

        return `
            <html style='margin: 0px; padding: 0px;'>
            <body style='margin: 0px; padding: 0px;'>
                <img style='position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${qrWidthPercent}%; height: ${qrHeightPercent}%;' src='data:image/png;base64, ${props.base64}'/>
            </body>
            </html>
        `;
    }

    const handleTouchStart = (e: GestureResponderEvent) => {
        if (e.nativeEvent.touches.length > 1) return;

        // Save the initial touch positions.
        // Reset oldTouch to prevent a large delta jump between touches.
        setTouchX(e.nativeEvent.locationX);
        setTouchY(e.nativeEvent.locationY);
        setOldTouchX(e.nativeEvent.locationX);
        setOldTouchY(e.nativeEvent.locationY);
    }

    const handleMove = (e: GestureResponderEvent) => {
        if (e.nativeEvent.touches.length > 1) return;

        // Save the current touch position.
        // touchX/Y contains the old value until next render.
        setTouchX(e.nativeEvent.locationX);
        setTouchY(e.nativeEvent.locationY);

        // Compute touch position delta.
        const deltaX = touchX - oldTouchX;
        const deltaY = touchY - oldTouchY;

        // Move the QR code based on the delta.
        setQRX(qrX + deltaX);
        setQRY(qrY + deltaY);

        // Update old touch position for delta calculation.
        setOldTouchX(touchX);
        setOldTouchY(touchY);
    }

    /** Initialize data needed for resizing QR. */
    const handlePinchStateChange = (e: HandlerStateChangeEvent<PinchGestureHandlerEventPayload>) => {
        if (e.nativeEvent.numberOfPointers > 2) return;

        if (e.nativeEvent.state === State.BEGAN)
        {
            // Cache the initial QR size to reference when scaling.
            setOldQRWidth(qrWidth);
            setOldQRHeight(qrHeight);
        }
    }

    /** Resize QR. */
    const handlePinch = (e: GestureEvent<PinchGestureHandlerEventPayload>) => {
        if (e.nativeEvent.velocity === 0) return;
        if (e.nativeEvent.numberOfPointers > 2) return;

        if (e.nativeEvent.state == State.ACTIVE)
        {
            const minimumQRSize = 10;
            // Compute new QR size based on the cached size.
            const newWidth = oldQRWidth * e.nativeEvent.scale;
            const newHeight = oldQRHeight * e.nativeEvent.scale;

            // Restrict the QR to a minimum and maximum size(based on screen size).
            setQRWidth(Math.max(minimumQRSize, Math.min(newWidth, Math.min(window.width, window.height))));
            setQRHeight(Math.max(minimumQRSize, Math.min(newHeight, Math.min(window.width, window.height))));
        }
    }

    return (
        <View>
            <Button title='Print' onPress={handlePrint}/>
            <View style={styles.labeledInputGroup}>
                <Text>X</Text>
                <TextInput keyboardType='decimal-pad' value={`${qrX}`} onChangeText={(text) => setQRX(Number.parseFloat(text) || 0)} />
            </View>
            <View style={styles.labeledInputGroup}>
                <Text>Y</Text>
                <TextInput keyboardType='decimal-pad' value={`${qrY}`} onChangeText={(text) => setQRY(Number.parseFloat(text) || 0)} />
            </View>
            <View style={styles.labeledInputGroup}>
                <Text>Width</Text>
                <TextInput keyboardType='decimal-pad' value={`${qrWidth}`} onChangeText={(text) => setQRWidth(Number.parseFloat(text) || 0)} />
            </View>
            <View style={styles.labeledInputGroup}>
                <Text>Height</Text>
                <TextInput keyboardType='decimal-pad' value={`${qrHeight}`} onChangeText={(text) => setQRHeight(Number.parseFloat(text) || 0)} />
            </View>
            
            <TextInput keyboardType='decimal-pad' onChangeText={(text) => setQRX(Number.parseFloat(text))} />
            <View style={styles.preview} pointerEvents={'none'}>
                <RenderHTML source={{
                    html: generatePreviewHTML()
                }}/>
            </View>
            <PinchGestureHandler onGestureEvent={handlePinch} onHandlerStateChange={handlePinchStateChange}>
                <View style={styles.touchpad} onTouchStart={handleTouchStart} onTouchMove={handleMove}/>
            </PinchGestureHandler>
        </View>
    )
}

const previewWidth = window.width - (previewMargin * 2);
const previewHeight = previewWidth * letterPaperAspectRatio;
const previewTopMargin = 224;

const styles = StyleSheet.create({
    labeledInputGroup: {
        marginHorizontal: 16,
        flexDirection: 'row'
    },
    preview: {
        position: 'absolute',
        top: previewTopMargin,
        width: previewWidth,
        height: previewHeight,
        margin: previewMargin,
        backgroundColor: 'white',
    },
    touchpad: {
        position: 'absolute',
        top: previewTopMargin,
        width: previewWidth,
        height: previewHeight,
        margin: previewMargin,
        backgroundColor: 'transparent'
    }
});

PrintPreviewScreen.options = {
    topBar: {
        title: {
            text: 'Print Preview'
        },
    },
};

export default PrintPreviewScreen;
export type { Props };
export const ComponentId = 'PrintPreviewScreen';