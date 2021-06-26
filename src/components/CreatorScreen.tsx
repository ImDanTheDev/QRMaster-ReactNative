import React, { useEffect, useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
    LayoutChangeEvent,
    ScrollView,
} from 'react-native';
import { Navigation, NavigationFunctionComponent } from 'react-native-navigation';
import QRCode from 'react-native-qrcode-svg';
import uuid from 'react-native-uuid';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import IQRCodeData from '../IQRCodeData';
import { ComponentId as PrintPreviewId, Props as PrintPreviewProps} from './PrintPreviewScreen';

interface Props {
    /** react-native-navigation component id. */
    componentId: string;
    /** Callback that contains the QR code text. */
    onSaveQRCode: (qrData: IQRCodeData) => Promise<void>;
    /** Callback to delete this QR code. */
    onDelete: (qrData: IQRCodeData) => void;
    /** Existing QR to edit. */
    qrData?: IQRCodeData
}

const CreatorScreen: NavigationFunctionComponent<Props> = (props: Props) => {
    
    const [qrText, setQRText] = useState<string>(props.qrData?.text || '');
    const [qrName, setQRName] = useState<string>(props.qrData?.name || '');
    const [previewSize, setPreviewSize] = useState<number>(100);
    const [svg, setSVG] = useState<any>(undefined);
    const [qrBase64, setQRBase64] = useState<string>('');

    // Runs when the generated QR code SVG changes.
    useEffect(() => {
        if (!svg) return;

        // Get the base64 representation of the SVG.
        svg.toDataURL(setQRBase64);
    }, [svg]);

    /** Calls the onSaveQRCode callback and show the dashboard. */
    const handleSaveBtn = async () => {
        await props.onSaveQRCode({
            id: props.qrData?.id || (uuid.v4() as string), // Generate a uuid if this is a new qr code.
            text: qrText,
            name: qrName,
            groupId: props.qrData?.groupId || 'default' // Set a default group if this is a new qr code.
        });
        await Navigation.popToRoot(props.componentId);
    }

    /** Shows the dashboard without saving. */
    const handleCancelBtn = async () => {
        await Navigation.popToRoot(props.componentId);
    }

    /** Calculate the maximum size of the page preview. */
    const handleLayout = (e: LayoutChangeEvent) => {
        // Find the smallest screen dimension and account for margin.
        setPreviewSize(Math.min(e.nativeEvent.layout.height, e.nativeEvent.layout.width) - 32);
    }

    /** Show the print preview screen. */
    const handlePrintBtn = async () => {
        await Navigation.push<PrintPreviewProps>(props.componentId, {
            component: {
                name: PrintPreviewId,
                passProps: {
                    componentId: PrintPreviewId,
                    base64: qrBase64
                }
            }
        });
    }

    /** Render a preview of the QR code if possible. */
    const renderPreview = () => {
        if (qrText.length <= 0) return;

        return (
            <View onLayout={handleLayout} style={styles.previewPanel}>
                <QRCode size={previewSize} value={qrText} getRef={setSVG}/>
            </View>
        )
    }

    /** Calls the onDelete callback and shows the dashboard. */
    const handleDeleteBtn = async () => {
        if (props.qrData) {
            props.onDelete(props.qrData);
        }
        await Navigation.popToRoot(props.componentId);
    }

    return (
        <View style={styles.creator}>
            <LinearGradient style={styles.background} colors={['#FFFFFF','#F2F1F6']} >
                <ScrollView style={styles.content} contentContainerStyle={{flexGrow: 1}}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create QR Code</Text>
                        {props.qrData ? (
                            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteBtn}>
                                <FontAwesome5 name={'trash'} size={28} color={'#ff6666'}/>
                            </TouchableOpacity>
                        ) : (<></>)}
                    </View>
                    <View style={styles.subHeader}>
                        <Text style={styles.subHeaderTitle}>QR TEXT</Text>
                    </View>
                    <TextInput style={styles.textInput} value={qrText} placeholderTextColor={'gray'} placeholder='Enter text to encode...' onChangeText={setQRText}/>
                    <View style={styles.subHeader}>
                        <Text style={styles.subHeaderTitle}>QR NAME</Text>
                    </View>
                    <TextInput style={styles.textInput} value={qrName} placeholderTextColor={'gray'} placeholder='Enter a searchable name...' onChangeText={setQRName}/>
                    <View style={styles.subHeader}>
                        <Text style={styles.subHeaderTitle}>QR CODE</Text>
                    </View>
                    {renderPreview()}
                </ScrollView>
                <View style={styles.bottomBarBackground}>
                </View>
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.bottomBarBtn} onPress={handleCancelBtn}>
                        <FontAwesome5 name={'arrow-left'} size={36} color={'gray'}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomBarPrimaryBtn} onPress={handlePrintBtn}>
                        <FontAwesome5 name={'print'} size={38} color={'#FFF'}/>
                    </TouchableOpacity>
                    {((props.qrData && ((qrName !== props.qrData?.name || qrText !== props.qrData?.text) && qrText.length > 0)) || (!props.qrData && qrText.length > 0)) ? (
                        <TouchableOpacity style={styles.bottomBarBtn} onPress={handleSaveBtn}>
                            <FontAwesome5 name={'save'} size={38} color={'gray'}/>
                        </TouchableOpacity>
                    ): (<View style={styles.bottomBarBtn}></View>)}
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    creator: {
        flex: 1,
        flexDirection: 'column',
    },
    background: {
        flex: 1,
        flexDirection: 'column',
    },
    content: {
        flex: 1,
        overflow: 'visible',
        flexDirection: 'column',
    },
    header: {
        flexShrink: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginHorizontal: 32,
    },
    title: {
        color: '#000',
        flex: 1,
        alignSelf: 'center',
        fontSize: 28,
        paddingBottom: 32,
        marginTop: 32
    },
    deleteBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        minHeight: 64,
        backgroundColor: '#FFF',
        borderRadius: 16,
        color: '#000',
        fontSize: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        marginTop: 16,
        marginBottom: 24,
        marginHorizontal: 32,
        paddingHorizontal: 16
    },
    subHeader: {
        flexShrink: 1,
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: 8,
        marginHorizontal: 32
    },
    subHeaderTitle: {
        color: 'gray',
        alignSelf: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomBar: {
        flexShrink: 0,
        minHeight: 128,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        elevation: 16
    },
    bottomBarBackground: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        minHeight: 96,
        bottom: 0,
        left: 0,
        right: 0,
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
    bottomBarBtn: {
        width: 48,
        height: 48,
        marginTop: 40,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomBarPrimaryBtn: {
        backgroundColor: '#5AF0AB',
        borderRadius: 16,
        position: 'relative',
        width: 64,
        height: 64,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    previewPanel: {
        flexShrink: 0,
        flexGrow: 1,
        padding: 16,
        marginTop: 16,
        marginBottom: 24,
        marginHorizontal: 32,
        backgroundColor: '#FFF',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        alignItems: 'center',
    }
});

CreatorScreen.options = {
    topBar: {
        visible: false
    },
};

export default CreatorScreen;
export type { Props };
export const ComponentId = 'CreatorScreen';