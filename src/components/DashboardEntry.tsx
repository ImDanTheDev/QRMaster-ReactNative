import React, { useState, FC, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import IQRCodeData from '../IQRCodeData';

interface Props {
    /** The QR code to display. */
    qrCodeData: IQRCodeData;
    /** Callback to delete this QR code. */
    onDelete: (qrCodeData: IQRCodeData) => void;
    /** Callback to print this QR code. */
    onPrint: (base64: string) => Promise<void>;
    /** Calback when the entry is pressed. */
    onPress: (qrCodeData: IQRCodeData) => Promise<void>;
}

const DashboardEntry: FC<Props> = (props: Props) => {
    const [svg, setSVG] = useState<any>(undefined);
    const [qrBase64, setQRBase64] = useState<string>('');
    const [utilityMode, setUtilityMode] = useState<boolean>(false);

    // Runs when the generated QR code SVG changes.
    useEffect(() => {
        if (!svg || utilityMode) return;

        // Get the base64 representation of the SVG.
        svg.toDataURL(setQRBase64);
    }, [svg, utilityMode]);

    /** Calls the onPrint callback. */
    const handlePrintQRCode = async () => {
        await props.onPrint(qrBase64);
    }

    /** Calls the onDelete callback. */
    const deleteQRCode = () => {
        props.onDelete(props.qrCodeData);
    }

    /** Calls the onPress callback. */
    const handlePress = async () => {
        await props.onPress(props.qrCodeData);
    }

    const toggleUtilityMode = () => {
        setUtilityMode(!utilityMode);
    }

    if (utilityMode)
    {
        return (
            <View style={styles.qrCodeListEntry}>
                <TouchableOpacity style={styles.utilityOption} onPress={deleteQRCode}>
                    <Text style={styles.utilityLabel}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.utilityOption} onPress={handlePrintQRCode}>
                    <Text style={styles.utilityLabel}>Print</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.utilityOption} onPress={toggleUtilityMode}>
                    <Text style={styles.utilityLabel}>Cancel</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <TouchableOpacity style={styles.qrCodeListEntry} onPress={handlePress} onLongPress={toggleUtilityMode}>
            <View style={styles.detailsSection}>
                <Text style={{...styles.qrName, fontStyle: props.qrCodeData.name ? 'normal' : 'italic'}}>{props.qrCodeData.name || 'Unnamed'}</Text>
                <Text style={styles.qrText} numberOfLines={3}>{props.qrCodeData.text}</Text>
            </View>
            <View style={styles.qrSection}>
                <QRCode value={props.qrCodeData.text} size={64} getRef={setSVG}/>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    qrCodeListEntry: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        flexDirection: 'row',
        flex: 0,
        height: 96,
        shadowColor: "#00000088",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        
    },
    detailsSection: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    qrSection: {
    },
    qrName: {
        color: 'gray',
        fontWeight: 'bold'
    },
    qrText: {

    },
    utilityOption: {
        flex: 1,
        alignItems: 'center',
        alignSelf: 'center',
    },
    utilityLabel: {
        fontSize: 26
    }
});

export default DashboardEntry;