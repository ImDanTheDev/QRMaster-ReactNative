import React, { useState } from 'react';
import {
    View,
    TextInput,
    Button,
    Text,
    StyleSheet,
} from 'react-native';
import { Navigation, NavigationFunctionComponent } from 'react-native-navigation';
import QRCode from 'react-native-qrcode-svg';
import uuid from 'react-native-uuid';
import IQRCodeData from '../IQRCodeData';

interface Props {
    /** react-native-navigation component id. */
    componentId: string;
    /** Callback that contains the QR code text. */
    onSaveQRCode: (qrData: IQRCodeData) => Promise<void>;
    /** Existing QR to edit. */
    qrData?: IQRCodeData
}

const CreatorScreen: NavigationFunctionComponent<Props> = (props: Props) => {
    const [qrText, setQRText] = useState(props.qrData?.text || '');
    const [qrName, setQRName] = useState(props.qrData?.name || '');

    /** Calls the onSaveQRCode callback and navigates to the previous screen. */
    const handleSaveBtn = async () => {
        await props.onSaveQRCode({
            id: props.qrData?.id || uuid.v4() as string,
            text: qrText,
            name: qrName
        });
        await Navigation.pop(props.componentId);
    }

    /** Render a preview of the QR code if possible. */
    const renderPreview = () => {
        if (qrText.length <= 0) return;

        return (
            <>
                <Text>Preview</Text>
                <QRCode value={qrText} />
            </>
        )
    }

    return (
        <View style={styles.creator}>
            <TextInput value={qrText} onChangeText={setQRText} placeholder='Enter QR code text'/>
            <TextInput value={qrName} onChangeText={setQRName} placeholder='Enter searchable name'/>
            {renderPreview()}
            <View style={styles.vFiller}/>
            <Button onPress={handleSaveBtn} title='Save' />
        </View>
    )
}

const styles = StyleSheet.create({
    creator: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 16
    },
    vFiller: {
        flex: 1
    },
});

CreatorScreen.options = {
    topBar: {
        title: {
            text: 'Create QR Code'
        },
    },
};

export default CreatorScreen;
export type { Props };
export const ComponentId = 'CreatorScreen';