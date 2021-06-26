import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    GestureResponderEvent,
    TextInput,
    Text,
    TouchableOpacity,
    ScrollView,
    Switch
} from 'react-native';
import { Navigation, NavigationFunctionComponent } from 'react-native-navigation';
import { GestureEvent, HandlerStateChangeEvent, PinchGestureHandler, PinchGestureHandlerEventPayload, State } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import RNPrint from 'react-native-print';
import RenderHTML from 'react-native-render-html';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const window = Dimensions.get("window");
const previewMargin = 32; // margin per side
const letterPaperAspectRatio = 1.2941; // 1:1.2941

interface Props {
    /** react-native-navigation component id. */
    componentId: string;
    /** Base64 representation of the QR code. */
    base64: string;
}

const PrintPreviewScreen: NavigationFunctionComponent<Props> = (props: Props) => {

    const [qrX, setQRX] = useState<string>('0');
    const [qrY, setQRY] = useState<string>('0');
    const [qrWidth, setQRWidth] = useState<string>('50');
    const [qrHeight, setQRHeight] = useState<string>('50');
    const [oldQRWidth, setOldQRWidth] = useState<number>(Number(qrWidth));
    const [oldQRHeight, setOldQRHeight] = useState<number>(Number(qrHeight));

    const [touchX, setTouchX] = useState<number>(0);
    const [touchY, setTouchY] = useState<number>(0);
    const [oldTouchX, setOldTouchX] = useState<number>(0);
    const [oldTouchY, setOldTouchY] = useState<number>(0);

    const [disableScroll, setDisableScroll] = useState<boolean>(false);

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
        const leftPercent = ((Number(qrX) || 0) / previewWidth) * 100; // percent
        const topPercent = ((Number(qrY) || 0) / previewHeight) * 100; // percent

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
        const leftPercent = ((Number(qrX) || 0) / previewWidth) * 100;
        const topPercent = ((Number(qrY) || 0) / previewHeight) * 100;
        const qrWidthPercent = ((Number(qrWidth) || 0) / previewWidth) * 100;
        const qrHeightPercent = ((Number(qrHeight) || 0) / previewHeight) * 100;

        return `
            <html style='margin: 0px; padding: 0px;'>
            <body style='margin: 0px; padding: 0px;'>
                <img style='position: absolute; left: ${leftPercent}%; top: ${topPercent}%; width: ${qrWidthPercent}%; height: ${qrHeightPercent}%;' src='data:image/png;base64, ${props.base64}'/>
            </body>
            </html>
        `;
    }

    const handleTouchPadStart = (e: GestureResponderEvent) => {
        if (!disableScroll) return;
        if (e.nativeEvent.touches.length > 1) return;

        // Save the initial touch positions.
        // Reset oldTouch to prevent a large delta jump between touches.
        setTouchX(e.nativeEvent.locationX);
        setTouchY(e.nativeEvent.locationY);
        setOldTouchX(e.nativeEvent.locationX);
        setOldTouchY(e.nativeEvent.locationY);
    }

    const handleTouchPadMove = (e: GestureResponderEvent) => {
        if (!disableScroll) return;
        if (e.nativeEvent.touches.length > 1) return;

        // Save the current touch position.
        // touchX/Y contains the old value until next render.
        setTouchX(e.nativeEvent.locationX);
        setTouchY(e.nativeEvent.locationY);

        // Compute touch position delta.
        const deltaX = touchX - oldTouchX;
        const deltaY = touchY - oldTouchY;

        // Move the QR code based on the delta.
        setQRX(limitPrecision(`${Number(qrX) + deltaX}`));
        setQRY(limitPrecision(`${Number(qrY) + deltaY}`));

        // Update old touch position for delta calculation.
        setOldTouchX(touchX);
        setOldTouchY(touchY);
    }

    /** Initialize data needed for resizing QR. */
    const handleTouchPadStateChange = (e: HandlerStateChangeEvent<PinchGestureHandlerEventPayload>) => {
        if (!disableScroll) return;
        if (e.nativeEvent.numberOfPointers > 2) return;

        if (e.nativeEvent.state === State.BEGAN)
        {
            // Cache the initial QR size to reference when scaling.
            setOldQRWidth((Number(qrWidth) || 0));
            setOldQRHeight((Number(qrHeight) || 0));
        }
    }

    /** Resize QR. */
    const handleTouchPadPinch = (e: GestureEvent<PinchGestureHandlerEventPayload>) => {
        if (!disableScroll) return;
        if (e.nativeEvent.velocity === 0) return;
        if (e.nativeEvent.numberOfPointers > 2) return;

        if (e.nativeEvent.state == State.ACTIVE)
        {
            const minimumQRSize = 10;
            // Compute new QR size based on the cached size.
            const newWidth = oldQRWidth * e.nativeEvent.scale;
            const newHeight = oldQRHeight * e.nativeEvent.scale;

            // Restrict the QR to a minimum and maximum size(based on screen size).
            setQRWidth(limitPrecision(`${Math.max(minimumQRSize, Math.min(newWidth, Math.min(window.width, window.height)))}`));
            setQRHeight(limitPrecision(`${Math.max(minimumQRSize, Math.min(newHeight, Math.min(window.width, window.height)))}`));
        }
    }

    /** Return to the previous screen. */
    const handleCancelBtn = async () => {
        await Navigation.pop(props.componentId);
    }

    /** Treat text as a number and limit it to 2 decimal places. */
    const limitPrecision = (text: string): string => {
        if (text.length > 0) {
            return (Number.parseFloat(text) || 0).toFixed(2);
        }
        return text;
    }

    return (
        <View style={styles.root}>
            <LinearGradient style={styles.gradient} colors={['#FFFFFF','#F2F1F6']}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} scrollEnabled={!disableScroll}>
                    <View style={styles.previewContainer}>
                        <View style={styles.pagePreview} pointerEvents={'none'}>
                            <RenderHTML source={{ html: generatePreviewHTML() }}/>
                        </View>
                        <PinchGestureHandler onGestureEvent={handleTouchPadPinch} onHandlerStateChange={handleTouchPadStateChange}>
                            <View style={styles.touchPad} onTouchStart={handleTouchPadStart} onTouchMove={handleTouchPadMove}/>
                        </PinchGestureHandler>
                    </View>
                    <View style={styles.inputContainer}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Layout Settings</Text>
                        </View>

                        <View style={styles.labeledInput}>
                            <Text style={styles.label}>Enable Interactive Preview</Text>
                            <Switch style={styles.switch}  thumbColor={disableScroll ? '#5AF0AB' : '#ffffff'} trackColor={{false: '#adadad', true: '#A6F6D1'}} value={disableScroll} onValueChange={setDisableScroll}/>
                        </View>

                        <Text style={styles.subHeader}>POSITION</Text>
                        <View style={styles.inputGroup}>
                            <View style={styles.labeledInput}>
                                <Text style={styles.label}>X</Text>
                                <TextInput style={styles.textInput} keyboardType='decimal-pad' value={`${qrX}`} onChangeText={(text) => setQRX(text)} />
                            </View>
                            <View style={styles.filler}/>
                            <View style={styles.labeledInput}>
                                <Text style={styles.label}>Y</Text>
                                <TextInput style={styles.textInput}  keyboardType='decimal-pad' value={`${qrY}`} onChangeText={(text) => setQRY(text)} />
                            </View>
                        </View>
                        
                        <Text style={styles.subHeader}>SIZE</Text>
                        <View style={styles.inputGroup}>
                            <View style={styles.labeledInput}>
                                <Text style={styles.label}>Width</Text>
                                <TextInput style={styles.textInput}  keyboardType='decimal-pad' value={`${qrWidth}`} onChangeText={(text) => setQRWidth(text)} />
                            </View>
                            <View style={styles.filler}/>
                            <View style={styles.labeledInput}>
                                <Text style={styles.label}>Height</Text>
                                <TextInput style={styles.textInput}  keyboardType='decimal-pad' value={`${qrHeight}`} onChangeText={(text) => setQRHeight(text)} />
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.bottomBarBackground}/>
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.bottomBarSideButton} onPress={handleCancelBtn}>
                        <FontAwesome5 name={'arrow-left'} size={36} color={'gray'}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.bottomBarPrimaryBtn} onPress={handlePrint}>
                        <FontAwesome5 name={'print'} size={38} color={'#FFF'}/>
                    </TouchableOpacity>
                    
                    <View style={styles.bottomBarSideButton}></View>
                </View>
            </LinearGradient>
        </View>
    )
}

const previewWidth = window.width - (previewMargin * 2);
const previewHeight = previewWidth * letterPaperAspectRatio;

const styles = StyleSheet.create({
    root: {
        backgroundColor: '#FFF',
        flex: 1
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    previewContainer: {
        flex: 1,
        flexGrow: 0,
        margin: previewMargin,
        marginBottom: previewMargin / 4
    },
    pagePreview: {
        width: previewWidth,
        height: previewHeight,
        backgroundColor: '#FFF',
        position: 'absolute',

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    touchPad: {
        width: previewWidth,
        height: previewHeight,
    },
    inputContainer: {
        flex: 1,
        paddingBottom: 32+64, // Half height of primary bottom button + extra space for scrolling
        paddingHorizontal: 32
    },
    header: {
        flexDirection: 'row',
    },
    headerTitle: {
        fontSize: 28,
        color: '#000',
    },
    labeledInput: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontSize: 18,
        alignSelf: 'center',
        marginRight: 16
    },
    filler: {
        paddingHorizontal: 16
    },
    switch: {
        marginHorizontal: 16,
        flex: 1
    },
    subHeader: {
        color: 'gray',
        fontSize: 18,
        fontWeight: 'bold',
        paddingVertical: 8
    },
    inputGroup: {
        flexDirection: 'row',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 16,
        color: '#000',
        fontSize: 16,
        paddingHorizontal: 16,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    bottomBarBackground: {
        flex: 0,
        flexBasis: 96,
        backgroundColor: '#FFF'
    },
    bottomBar: {
        position: 'absolute',
        height: 128,
        bottom: 0,
        right: 0,
        left: 0,
        paddingHorizontal: 32,
        paddingTop: 128 - 96 + 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    bottomBarSideButton: {
        width: 48,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomBarPrimaryBtn: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5AF0AB',
        position: 'relative',
        bottom: 16+32,
        borderRadius: 16
    }
});

PrintPreviewScreen.options = {
    topBar: {
        visible: false
    },
};

export default PrintPreviewScreen;
export type { Props };
export const ComponentId = 'PrintPreviewScreen';