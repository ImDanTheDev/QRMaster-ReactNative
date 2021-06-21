import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    Button,
    ListRenderItem,
    TextInput,
} from 'react-native';
import { Navigation, NavigationFunctionComponent } from 'react-native-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ComponentId as CreatorId, Props as CreatorProps} from './CreatorScreen';
import { ComponentId as PrintPreviewId, Props as PrintPreviewProps} from './PrintPreviewScreen';
import IQRCodeData from '../IQRCodeData';
import DashboardEntry from './DashboardEntry';

interface Props {
    /** react-native-navigation component id. */
    componentId: string
}

const DashboardScreen: NavigationFunctionComponent<Props> = (props: Props) => {
    // All loaded QR codes in the app.
    const [qrCodes, setQRCodes] = useState<IQRCodeData[]>([]);
    const [searchPhrase, setSearchPhrase] = useState<string>('');

    // Runs once on component mount.
    useEffect(() => {
        /** Load saved QR codes from storage or default to empty array. */
        const readQRCodes = async () => {
            try {
                const jsonQRCodes: string = await AsyncStorage.getItem('@qrCodes') || JSON.stringify(qrCodes);
                const savedQRCodes: IQRCodeData[] = JSON.parse(jsonQRCodes);
                setQRCodes(savedQRCodes);
            } catch (e) {
                console.error(e);
            }
        }

        readQRCodes();
    }, [searchPhrase]);

    // Runs when the qrCodes array changes
    useEffect(() => {
        /** Save all QR codes to storage. */
        const writeQRCodes = async () => {
            try {
                const jsonQRCodes = JSON.stringify(qrCodes);
                await AsyncStorage.setItem('@qrCodes', jsonQRCodes);
            } catch (e) {
                console.error(e);
            }
        }

        writeQRCodes();
    }, [qrCodes]);

    /** Add or update a QR code to the state. useEffect auto-saves the new code. */
    const saveQRCode = async (qrData: IQRCodeData) => {
        setQRCodes(() => [...qrCodes.filter(i => i.id !== qrData.id), qrData]);
    }

    /** Removes a QR code from the state. useEffect auto-saves the change. */
    const handleDelete = (qrData: IQRCodeData) => {
        setQRCodes(() => qrCodes.filter(i => i.id !== qrData.id));
    }

    /** Opens the Creator screen to create a new QR code. */
    const handleCreateBtn = async () => {
        await Navigation.push<CreatorProps>(props.componentId, {
            component: {
                name: CreatorId,
                passProps: {
                    componentId: CreatorId,
                    onSaveQRCode: saveQRCode
                }
            }
        });
    }

    /** Opens the PrintPreview screen for a QR code. */
    const openPrintPreview = async (base64: string) => {
        await Navigation.push<PrintPreviewProps>(props.componentId, {
            component: {
                name: PrintPreviewId,
                passProps: {
                    componentId: PrintPreviewId,
                    base64
                }
            }
        });
    }

    /** Opens the Creator screen to edit the QR code. */
    const handlePress = async (qrData: IQRCodeData) => {
        await Navigation.push<CreatorProps>(props.componentId, {
            component: {
                name: CreatorId,
                passProps: {
                    componentId: CreatorId,
                    qrData,
                    onSaveQRCode: saveQRCode
                }
            }
        });
    }

    /** Render a QR code list entry. */
    const renderQRCode: ListRenderItem<IQRCodeData> = ({item}) => (
        <DashboardEntry qrCodeData={item} onPress={handlePress} onDelete={handleDelete} onPrint={openPrintPreview}/>
    );

    /** Return QR codes with names that start with the search phrase. */
    const getFilteredQRCodes = (): IQRCodeData[] => {
        return qrCodes.filter(qrCode => qrCode.name.startsWith(searchPhrase));
    }

    return (
        <View>
            <TextInput onChangeText={setSearchPhrase} />
            <Button onPress={handleCreateBtn} title='Create'/>
            <FlatList data={getFilteredQRCodes()} renderItem={renderQRCode} keyExtractor={item => item.id} />
        </View>
    )
}

DashboardScreen.options = {
    topBar: {
        title: {
            text: 'Dashboard'
        },
    },
};


export default DashboardScreen;
export type { Props };
export const ComponentId = 'DashboardScreen';