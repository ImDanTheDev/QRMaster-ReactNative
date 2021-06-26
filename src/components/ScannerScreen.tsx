import React, { useState } from 'react';
import {
    View,
    StyleSheet,
} from 'react-native';
import { BarCodeReadEvent, RNCamera } from 'react-native-camera';
import { NavigationFunctionComponent } from 'react-native-navigation';

interface Props {
    /** react-native-navigation component id. */
    componentId: string,
    /** Callback that contains the scanned QR code text. */
    onScan: (qrData: string) => void
}

const ScannerScreen: NavigationFunctionComponent<Props> = (props: Props) => {

    // Flag to detect the first scan. RNCamera may rapidly scan the QR code multiple times.
    const [scanned, setScanned] = useState<boolean>(false);

    /** Call the onScan callback with the scanned QR data */
    const handleReadQR = (e: BarCodeReadEvent) => {
        // Only react to the first scan.
        if (scanned) return; 
        setScanned(true);
        
        props.onScan(e.data);
    }

    return (
        <View style={styles.scanner}>
            <RNCamera style={styles.camera} onBarCodeRead={handleReadQR} type='back' flashMode={'auto'} captureAudio={false} />
        </View>
    )
}

const styles = StyleSheet.create({
    scanner: {
        flex: 1
    },
    camera: {
        flex: 1,
    },
});

ScannerScreen.options = {
    topBar: {
        title: {
            text: 'Scanner'
        },
    },
};

export default ScannerScreen;
export type { Props };
export const ComponentId = 'ScannerScreen';