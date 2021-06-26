import React, { useState, FC, ReactNode } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Picker } from '@react-native-picker/picker';
import IQRCodeData from '../IQRCodeData';
import IGroupData from '../IGroupData';

interface Props {
    /** The QR code to display. */
    qrCodeData: IQRCodeData;
    /** Array of all groups. */
    groups: IGroupData[];
    /** Calback when the entry is pressed. */
    onPress: (qrCodeData: IQRCodeData) => Promise<void>;
    /** Callback when the group is changed. */
    onChangeGroup: (qrCodeData: IQRCodeData) => Promise<void>;
}

const DashboardEntry: FC<Props> = (props: Props) => {
    
    const [groupMode, setGroupMode] = useState<boolean>(false);
    const [group, setGroup] = useState<string>(props.qrCodeData.groupId || 'default');

    /** Calls the onPress callback. */
    const handlePress = async () => {
        await props.onPress(props.qrCodeData);
    }

    /** Save the new group id and call the onChangeGroup callback. */
    const handleChangeGroup = async () => {
        props.qrCodeData.groupId = group;
        setGroupMode(false);
        await props.onChangeGroup(props.qrCodeData);
    }

    /** Create Picker items for each group. */
    const renderGroups = (): ReactNode[] => {
        const items: ReactNode[] = [];
        props.groups.forEach(group => {
            items.push(<Picker.Item label={group.name} value={group.id} key={group.id}/>)
        });

        return items;
    }

    if (groupMode)
    {
        return (
            <View style={styles.qrCodeListEntry}>
                <View style={styles.groupSelector}>
                    <Text style={styles.moveToLabel}>Move to:</Text>
                    <View style={styles.inputContainer}>
                        <View style={styles.pickerContainer}>
                            <Picker style={styles.picker} dropdownIconColor={'gray'} selectedValue={group} onValueChange={(value, index) => setGroup(value)}>
                                {renderGroups()}
                            </Picker>
                        </View>
                        <TouchableOpacity style={styles.btn} onPress={handleChangeGroup}>
                            <FontAwesome5 name={'save'}  color='gray' size={32}/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <TouchableOpacity style={styles.qrCodeListEntry} onPress={handlePress} onLongPress={() => setGroupMode(true)}>
            <View style={styles.detailsSection}>
                <Text style={{...styles.qrName, fontStyle: props.qrCodeData.name ? 'normal' : 'italic'}}>{props.qrCodeData.name || 'Unnamed'}</Text>
                <Text numberOfLines={3}>{props.qrCodeData.text}</Text>
            </View>
            <View>
                <QRCode value={props.qrCodeData.text} size={64}/>
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
        height: 100,
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
    qrName: {
        color: 'gray',
        fontWeight: 'bold'
    },
    groupSelector: {
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'column'
    },
    moveToLabel: {
        flexGrow: 0,
        flexShrink: 0,
    },
    inputContainer: {
        flexGrow: 1,
        flexShrink: 0,
        flexDirection: 'row',
    },
    pickerContainer: {
        flexGrow: 1,
        borderWidth: 1,
        borderRadius: 16,
        borderColor: 'lightgray',
    },
    picker: {
        flex: 1,
        color: 'black',
        marginTop: -2
    },
    btn: {
        flexGrow: 0,
        flexShrink: 0,
        marginLeft: 8,
        paddingHorizontal: 8,
        justifyContent: 'center'
    }
});

export default DashboardEntry;