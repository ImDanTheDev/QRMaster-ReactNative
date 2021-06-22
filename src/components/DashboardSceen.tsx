import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    ListRenderItem,
    TextInput,
    Text,
    TouchableOpacity,
} from 'react-native';
import { Navigation, NavigationFunctionComponent } from 'react-native-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ComponentId as CreatorId, Props as CreatorProps} from './CreatorScreen';
import { ComponentId as PrintPreviewId, Props as PrintPreviewProps} from './PrintPreviewScreen';
import { ComponentId as ScannerId, Props as ScannerProps} from './ScannerScreen';
import IQRCodeData from '../IQRCodeData';
import DashboardEntry from './DashboardEntry';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
    /** react-native-navigation component id. */
    componentId: string
}

const DashboardScreen: NavigationFunctionComponent<Props> = (props: Props) => {
    // All loaded QR codes in the app.
    const [qrCodes, setQRCodes] = useState<IQRCodeData[]>([]);
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [newQRCode, setNewQRCode] = useState<IQRCodeData>();
    const [searching, setSearching] = useState<boolean>(false);

    // Runs once on component mount and when search phrase changes.
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

    // Runs when a QR code is scanned.
    useEffect(() => {
        if (newQRCode) {
            // Merge the scanned QR code into array.
            setQRCodes([...qrCodes, newQRCode]);
        }
    }, [newQRCode]);

    /** Open the Creator screen for the scanned QR code. */
    const handleScan = async (qrText: string) => {
        await Navigation.push<CreatorProps>(props.componentId, {
            component: {
                name: CreatorId,
                passProps: {
                    componentId: CreatorId,
                    qrData: {
                        text: qrText
                    },
                    onSaveQRCode: async (qrData: IQRCodeData) => {
                        // Store the QR data to be merged in later.
                        setNewQRCode(qrData);
                    }
                }
            }
        });
    }

    /** Open the scanner screen. */
    const handleOpenScanner = async () => {
        await Navigation.push<ScannerProps>(props.componentId, {
            component: {
                name: ScannerId,
                passProps: {
                    componentId: ScannerId,
                    onScan: handleScan
                }
            }
        });
    }

    /** Add or update a QR code to the state. useEffect auto-saves the new code. */
    const saveQRCode = async (qrData: IQRCodeData) => {
        const a = [...qrCodes.filter(i =>i.id !== qrData.id), qrData];
        setQRCodes(() => a);
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

    /** Render a QR code list entry. */
    const renderQRCode: ListRenderItem<IQRCodeData> = ({item}) => (
        <DashboardEntry qrCodeData={item} onPress={handlePress} onDelete={handleDelete} onPrint={openPrintPreview}/>
    );

    /** Return QR codes with names that start with the search phrase. */
    const getFilteredQRCodes = (): IQRCodeData[] => {
        return qrCodes.filter(qrCode => qrCode.name?.startsWith(searchPhrase));
    }

    /** Render groups and sub-headers */
    const renderListHeader = (): React.ReactElement => {
        return (
            <View>
                <View style={styles.groupsSection}>
                    <View style={styles.subHeader}>
                        <Text style={styles.subHeaderTitle}>GROUPS</Text>
                        <View style={styles.flexFiller}/>
                        <Text style={styles.subHeaderAction}>View all</Text>
                    </View>
                    <View style={styles.groupsList}>
                        <Text style={styles.noGroupsLabel}>No groups</Text>
                    </View>
                </View>
                <View style={styles.subHeader}>
                    <Text style={styles.subHeaderTitle}>QR CODES</Text>
                </View>
            </View>
        )
    }

    /** Add padding to bottom of the QR list. */
    const renderListFooter = (): React.ReactElement => {
        return (
            <View style={{padding: 24}}/>
        )
    }

    /** Toggle search bar visibility and clear it when hiding. */
    const toggleSearchBar = () => {
        if (searching) {
            setSearchPhrase('');
        }
        setSearching(!searching);
    }

    return (
        <View style={styles.dashboard}>
            <LinearGradient style={styles.background} colors={['#FFFFFF','#F2F1F6']} >
                <View style={styles.content}>
                    <FlatList style={styles.qrCodesList} removeClippedSubviews={false} ListHeaderComponent={renderListHeader} ListFooterComponent={renderListFooter} data={getFilteredQRCodes()} renderItem={renderQRCode} keyExtractor={item => item.id || ''} />
                    <LinearGradient start={{x: 0, y: 0.75}} end={{x: 0, y: 1}} colors={['#FFFFFFFF','#FFFFFF00']}>
                        <View style={styles.header}>
                            {searching ? (
                                <TextInput style={styles.searchBar} onChangeText={setSearchPhrase}/>
                            ) : (
                                <Text style={styles.title}>Your QR Codes</Text>
                            )}
                            <TouchableOpacity style={styles.searchBtn} onPress={toggleSearchBar}>
                                <FontAwesome5 name={searching ? 'times' : 'search'} size={28} color={'gray'}/>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.bottomBarBtn}>
                        <Entypo name={'grid'} size={48} color={'#3e3e3e'}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomBarPrimaryBtn} onPress={handleCreateBtn}>
                        <FontAwesome5 name={'plus'} size={38} color={'#FFF'}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomBarBtn} onPress={handleOpenScanner}>
                        <Ionicons name={'scan'} size={38} color={'#3e3e3e'}/>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    dashboard: {
        flex: 1,
        flexDirection: 'column',
    },
    background: {
        flex: 1,
        flexDirection: 'column'
    },
    content: {
        paddingHorizontal: 16,
        flexDirection: 'column-reverse',
        flex: 1
    },
    header: {
        flexShrink: 1,
        flexDirection: 'row',
        paddingHorizontal: 16,
        height: 125,
        backgroundColor: 'transparent',
        alignItems: 'center'
    },
    title: {
        color: '#000',
        flex: 1,
        alignSelf: 'center',
        fontSize: 28,
    },
    searchBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchBar: {
        flex: 1,
        backgroundColor: '#F2F1F6',
        borderRadius: 16,
        color: '#000',
        paddingHorizontal: 16,
        fontSize: 16
    },
    groupsSection: {
        flexShrink: 1,
        minHeight: 96,
    },
    groupsList: {
        flex: 1,
        flexDirection: 'column',
    },
    noGroupsLabel: {
        flexGrow: 1,
        alignSelf: 'center',
        textAlignVertical: 'center',
        fontSize: 18,
        color: 'gray',
    },
    subHeader: {
        flexShrink: 1,
        flexDirection: 'row',
        margin: 16
    },
    subHeaderTitle: {
        color: 'gray',
        alignSelf: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    subHeaderAction: {
        color: 'gray',
        alignSelf: 'center',
        fontSize: 18,
    },
    flexFiller: {
        flex: 1,
    },
    qrCodesSection: {
        flexGrow: 1,
    },
    qrCodesList: {
        flexGrow: 1,
        overflow: 'visible',
    },
    bottomBar: {
        flexShrink: 0,
        minHeight: 96,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,

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
        marginTop: 8,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomBarPrimaryBtn: {
        backgroundColor: '#5AF0AB',
        borderRadius: 16,
        position: 'relative',
        top: -64/2,
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
    }
});

DashboardScreen.options = {
    topBar: {
        visible: false
    }
};

export default DashboardScreen;
export type { Props };
export const ComponentId = 'DashboardScreen';