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

interface Props {
    /** react-native-navigation component id. */
    componentId: string;
    /** Callback that contains the QR code text. */
    onSaveQRCode: (text: string) => Promise<void>;
}

const Creator: NavigationFunctionComponent<Props> = (props: Props) => {
    const [qrText, setQRText] = useState('');

    /** Calls the onSaveQRCode callback and navigates to the previous screen. */
    const handleSaveBtn = async () => {
        await props.onSaveQRCode(qrText);
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
            <TextInput onChangeText={setQRText} placeholder='Enter QR code text'/>
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

Creator.options = {
    topBar: {
        title: {
            text: 'Create QR Code'
        },
    },
};

export default Creator;
export type { Props };
export const ComponentId = 'CreatorScreen';