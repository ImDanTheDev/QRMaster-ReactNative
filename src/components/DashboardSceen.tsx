import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    ListRenderItem,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { Navigation, NavigationFunctionComponent, OptionsModalPresentationStyle } from 'react-native-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import uuid from 'react-native-uuid';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IQRCodeData from '../IQRCodeData';
import DashboardEntry from './DashboardEntry';
import IGroupData from '../IGroupData';
import GroupEntry from './GroupEntry';
import { ComponentId as CreatorId, Props as CreatorProps} from './CreatorScreen';
import { ComponentId as AddGroupModalId} from './AddGroupModal';
import { ComponentId as ScannerId, Props as ScannerProps} from './ScannerScreen';

interface Props {
    /** react-native-navigation component id. */
    componentId: string
}

const DashboardScreen: NavigationFunctionComponent<Props> = (props: Props) => {

    const [qrCodes, setQRCodes] = useState<IQRCodeData[]>([]);
    const [groups, setGroups] = useState<IGroupData[]>([{ // Initialize storage with a default group(mainly for new app installs).
        name: 'Default',
        id: 'default'
    }]);
    const [openedGroupIndex, setOpenedGroupIndex] = useState<number>(0);
    const [searchPhrase, setSearchPhrase] = useState<string>('');
    const [newQRCode, setNewQRCode] = useState<IQRCodeData>();
    const [searching, setSearching] = useState<boolean>(false);

    // Runs once on component mount and when search phrase changes.
    useEffect(() => {
        /** Load groups from storage or default to one default group. */
        const readGroups = async () => {
            try {
                const jsonGroups: string = await AsyncStorage.getItem('@groups') || JSON.stringify(groups);
                const savedGroups: IGroupData[] = JSON.parse(jsonGroups);
                setGroups(savedGroups);
            } catch (e) {
                console.error(e);
            }
        }

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
        
        readGroups();
        readQRCodes();
    }, [searchPhrase]);

    // Runs when the qrCodes array changes.
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

    // Runs when groups array changes.
    useEffect(() => {
        /** Save all groups to storage. */
        const writeGroups = async () => {
            try {
                const jsonGroups = JSON.stringify(groups);
                await AsyncStorage.setItem('@groups', jsonGroups);
            } catch (e) {
                console.error(e);
            }
        }

        writeGroups();
    }, [groups])

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
                        text: qrText,
                        groupId: 'default'
                    },
                    onSaveQRCode: async (qrData: IQRCodeData) => {
                        // Store the QR data to be merged in later.
                        setNewQRCode(qrData);
                    },
                    onDelete: handleDelete
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
        const a = [...qrCodes.filter(i => i.id !== qrData.id), qrData];
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
                    onSaveQRCode: saveQRCode,
                    onDelete: handleDelete
                }
            }
        });
    }

    /** Opens the Creator screen to edit the QR code. */
    const handleQRPress = async (qrData: IQRCodeData) => {
        await Navigation.push<CreatorProps>(props.componentId, {
            component: {
                name: CreatorId,
                passProps: {
                    componentId: CreatorId,
                    qrData,
                    onSaveQRCode: saveQRCode,
                    onDelete: handleDelete
                }
            }
        });
    }

    /** Shows a modal to gather group data and save it to storage. */
    const handleAddGroupBtn = async (): Promise<string> => {
        /** Save the group. */
        const handleSave = (groupName: string) => {
            setGroups([...groups, {
                id: (uuid.v4() as string),
                name: groupName,
            }]);
        }

        await Navigation.showModal({
            stack: {
                children: [
                    {
                        component: {
                            name: AddGroupModalId,
                            options: {
                                topBar: {
                                    visible: false
                                },
                                modalPresentationStyle: OptionsModalPresentationStyle.overCurrentContext,
                                layout: {
                                    backgroundColor: 'transparent'
                                }
                            },
                            passProps: {
                                onSave: handleSave
                            }
                        }
                    }
                ]
            }
        })
        return '';
    }

    /** Render a QR code list entry. */
    const renderQRCode: ListRenderItem<IQRCodeData> = ({item}) => (
        <DashboardEntry qrCodeData={item} groups={groups} onPress={handleQRPress} onChangeGroup={saveQRCode}/>
    );

    /** Return QR codes with names that start with the search phrase. */
    const getFilteredQRCodes = (): IQRCodeData[] => {
        if (openedGroupIndex === -1) // Show all QR codes if no group is selected.
        {
            return qrCodes.filter(qrCode => qrCode.name?.startsWith(searchPhrase));
        } else { // Show QR codes in a group and match the search phrase.
            return qrCodes.filter(qrCode => `${qrCode.groupId}` === groups[openedGroupIndex].id && qrCode.name?.startsWith(searchPhrase));
        }
    }

    /** Delete a group from storage. Moves QR codes from deleted group to default group. */
    const handleDeleteGroup = (groupIndex: number) => {
        const groupId = groups[groupIndex].id;
        // Move QR codes from deleted group to default group.
        qrCodes.filter(x => x.groupId === groupId).forEach(x => {
            x.groupId = 'default';
        });
        setQRCodes(qrCodes);

        // Delete the group.
        setGroups(() => groups.filter(x => x.id !== groupId));
    }

    /** Toggle search bar visibility and clear it when hiding. */
    const toggleSearchBar = () => {
        if (searching) {
            setSearchPhrase('');
        }
        setSearching(!searching);
        setOpenedGroupIndex(-1);
    }

    // Generate GroupEntry's for each group in a grid layout.
    const renderGroups = () => {
        const groupRows: React.ReactElement[] = [];

        const isLastRowFull = groups.length % 3 == 0;
        const rows = Math.ceil(groups.length / 3);

        const renderRowContents = (rowIndex: number, fullRow: boolean): React.ReactElement[] => {
            const groupEntries: React.ReactElement[] = [];

            const groupCount = fullRow ? 3 : groups.length % 3;
            for(let i = 0; i < 3; i++) {
                const groupIndex = rowIndex * 3 + i;
                
                groupEntries.push(
                    <GroupEntry key={i} group={groups[groupIndex] || {}} disabled={i > groupCount - 1} isOpen={groupIndex === openedGroupIndex} onClose={() => {
                        setOpenedGroupIndex(-1);
                    }} onOpen={() => {
                        setOpenedGroupIndex(groupIndex);
                    }} onDeleteGroup={() => {
                        handleDeleteGroup(groupIndex);
                    }} />
                );
            }

            return groupEntries;
        }

        for(let i = 0; i < rows; i++)
        {
            groupRows.push(
                <View key={i} style={styles.groupRow}>
                    {renderRowContents(i, i === rows - 1 ? isLastRowFull : true)}
                </View>
            );
        }

        return groupRows;
    }

    /** Render groups and sub-headers */
    const renderHeader = (): React.ReactElement => {
        return (
            <View style={styles.listHeader}>
                <View>
                    <View style={styles.subHeader}>
                        <Text style={styles.subHeaderTitle}>GROUPS</Text>
                        <View style={styles.flexFiller}/>
                        <TouchableOpacity style={styles.addGroupBtn} onPress={handleAddGroupBtn}>
                            <Text style={styles.subHeaderAction}>Add Group</Text>
                            <FontAwesome5 name={'plus'} size={20} color={'gray'}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.groupsList}>
                        {renderGroups()}
                    </View>
                </View>
                <View style={styles.subHeader}>
                    <Text style={styles.subHeaderTitle}>QR CODES</Text>
                    {(openedGroupIndex < 0) ? (searching ? (
                        <Text style={styles.subHeaderHint}>(in search results)</Text>
                    ) : (
                        <Text style={styles.subHeaderHint}>(in all groups)</Text>)
                    ) : (
                        <Text style={styles.subHeaderHint}>(in group: {groups[openedGroupIndex].name})</Text>
                    )}
                    
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

    return (
        <View style={styles.dashboard}>
            <LinearGradient style={styles.background} colors={['#FFFFFF','#F2F1F6']} >
                <View style={styles.content}>
                    <FlatList style={styles.qrCodesList} removeClippedSubviews={false} ListHeaderComponentStyle={{
                        flexGrow: 1,
                        flexShrink: 0,
                        flexDirection: 'column'
                    }} ListHeaderComponent={renderHeader} ListFooterComponent={renderListFooter} data={getFilteredQRCodes()} renderItem={renderQRCode} keyExtractor={item => item.id || ''} />
                    <LinearGradient start={{x: 0, y: 0.75}} end={{x: 0, y: 1}} colors={['#FFFFFFFF','#FFFFFF00']}>
                        <View style={styles.header}>
                            {searching ? (
                                <TextInput style={styles.searchBar} placeholderTextColor={'gray'} placeholder='Enter search phrase...' onChangeText={setSearchPhrase}/>
                            ) : (
                                <Text style={styles.title}>Your QR Codes</Text>
                            )}
                            <TouchableOpacity style={styles.searchBtn} onPress={toggleSearchBar}>
                                <FontAwesome5 name={searching ? 'times' : 'search'} size={28} color={'gray'}/>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
                <View style={styles.bottomBarBackground}>
                </View>
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.bottomBarBtn}>
                        <Entypo name={'grid'} size={48} color={'#3e3e3e'}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bottomBarPrimaryBtn} onPressIn={handleCreateBtn}>
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
        flexDirection: 'column',
    },
    content: {
        paddingHorizontal: 16,
        flexDirection: 'column-reverse',
        flex: 1,
        marginBottom: 32,
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
        backgroundColor: '#FFF',
        borderRadius: 16,
        color: '#000',
        paddingHorizontal: 16,
        fontSize: 16,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    listHeader: {
        flexGrow: 1,
        flexDirection: 'column',
        marginHorizontal: 16
    },
    groupsList: {
        flexDirection: 'column',
    },
    groupRow: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    subHeader: {
        flexDirection: 'row',
    },
    subHeaderTitle: {
        color: 'gray',
        alignSelf: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        padding: 8
    },
    subHeaderHint: {
        color: 'gray',
        alignSelf: 'center',
        fontSize: 18,
        fontStyle: 'italic',
        paddingVertical: 8
    },
    subHeaderAction: {
        color: 'gray',
        alignSelf: 'center',
        fontSize: 18,
        paddingRight: 8
    },
    flexFiller: {
        flex: 1,
    },
    addGroupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8
    },
    qrCodesList: {
        flexGrow: 1,
        overflow: 'visible',
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
        marginTop: 8+32,
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
        alignItems: 'center',
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