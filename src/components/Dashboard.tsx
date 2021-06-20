import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    Button,
    ListRenderItem,
} from 'react-native';
import { Navigation, NavigationFunctionComponent } from 'react-native-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import RNPrint from 'react-native-print';

import { ComponentId as CreatorId, Props as CreatorProps} from './Creator';
import IQRCodeData from '../IQRCodeData';
import DashboardEntry from './DashboardEntry';

interface Props {
    /** react-native-navigation component id. */
    componentId: string
}

const Dashboard: NavigationFunctionComponent<Props> = (props: Props) => {
    // All loaded QR codes in the app.
    const [qrCodes, setQRCodes] = useState<IQRCodeData[]>([]);

    // Runs once on component mount.
    useEffect(() => {
        /** Load saved QR codes from storage or default to empty array. */
        const readQRCodes = async () => {
            try {
                const jsonQRCodes: string = await AsyncStorage.getItem('@qrCodes') || JSON.stringify(qrCodes);
                setQRCodes(JSON.parse(jsonQRCodes));
            } catch (e) {
                console.error(e);
            }
        }

        readQRCodes();
    }, []);

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

    /** Add a QR code to the state. useEffect auto-saves the new code. */
    const saveQRCode = async (text: string) => {
        setQRCodes(() => [...qrCodes, {
            id: uuid.v4() as string,
            text,
        }]);
    }

    /** Removes a QR code from the state. useEffect auto-saves the change. */
    const handleDelete = (qrCodeData: IQRCodeData) => {
        setQRCodes(() => qrCodes.filter(i => i.id !== qrCodeData.id));
    }

    /** Opens the Creator screen on the navigation stack. */
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

    /** Send a print-ready QR code document to the native print service. */
    const handlePrint = async (base64: string) => {
        await RNPrint.print({
            html: `
                <html>
                <body>
                <img src='data:image/png;base64, ${base64}'/>
                </body>
                </html>
            `,
        });
    }

    /** Render a QR code list entry. */
    const renderQRCode: ListRenderItem<IQRCodeData> = ({item}) => (
        <DashboardEntry qrCodeData={item} onDelete={handleDelete} onPrint={handlePrint}/>
    );

    return (
        <View>
            <Button onPress={handleCreateBtn} title='Create'/>
            <FlatList data={qrCodes} renderItem={renderQRCode} keyExtractor={item => item.id} />
        </View>
    )
}

Dashboard.options = {
    topBar: {
        title: {
            text: 'Dashboard'
        },
    },
};


export default Dashboard;
export type { Props };
export const ComponentId = 'DashboardScreen';