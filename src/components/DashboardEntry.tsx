import React, { useState, FC, useEffect } from 'react';
import {
    View,
    Button,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import IQRCodeData from '../IQRCodeData';

interface Props {
    /** The QR code to display. */
    qrCodeData: IQRCodeData
    /** Callback to delete this QR code. */
    onDelete: (qrCodeData: IQRCodeData) => void;
    /** Callback to print this QR code. */
    onPrint: (base64: string) => Promise<void>;
}

const DashboardEntry: FC<Props> = (props: Props) => {
    const [svg, setSVG] = useState<any>(undefined);
    const [qrBase64, setQRBase64] = useState<string>('');

    // Runs when the generated QR code SVG changes.
    useEffect(() => {
        if (svg === undefined) return;

        // Get the base64 representation of the SVG.
        svg.toDataURL(setQRBase64);
    }, [svg]);

    /** Calls the onPrint callback. */
    const handlePrintQRCode = async () => {
        await props.onPrint(qrBase64);
    }

    /** Calls the onDelete callback. */
    const deleteQRCode = () => {
        props.onDelete(props.qrCodeData);
    }

    return (
        <View>
            <QRCode value={props.qrCodeData.text} getRef={setSVG}/>
            <Button onPress={handlePrintQRCode} title='Print' />
            <Button onPress={deleteQRCode} title='Delete' />
        </View>
    );
}

export default DashboardEntry;