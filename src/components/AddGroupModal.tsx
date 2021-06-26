import React, { FC, useState } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

interface Props {
    /** react-native-navigation component id. */
    componentId: string,
    onSave: (groupName: string) => void
}

const AddGroupModal: FC<Props> = (props: Props) => {

    const [groupName, setGroupName] = useState<string>('');

    /** Closes the modal without saving. */
    const handleDismissBtn = async (save: boolean) => {
        await Navigation.dismissModal(props.componentId);
        if (save) props.onSave(groupName);
    }

    return (
        <View style={styles.fullscreen}>
            <TouchableOpacity style={styles.dismissBackground} onPress={() => handleDismissBtn(false)}/>
            <View style={styles.modal}>
                <Text style={styles.header}>New Group</Text>
                <View style={styles.groupNameContainer}>
                    <TextInput style={styles.groupName} value={groupName} onChangeText={setGroupName} placeholder='Enter group name...' placeholderTextColor='gray'/>
                </View>
                <View style={styles.buttons}>
                    <TouchableOpacity style={styles.button} onPress={() => handleDismissBtn(false)}>
                        <FontAwesome5 name='trash' size={28} color='gray'/>
                        <View style={styles.flexFill}/>
                        <Text style={styles.btnLabel}>Dismiss</Text>
                        <View style={styles.flexFill}/>
                    </TouchableOpacity>
                    {(groupName.length === 0) ? (<></>) : (
                        <TouchableOpacity style={styles.button} onPress={() => handleDismissBtn(true)}>
                            <FontAwesome5 name='save' size={28} color='gray'/>
                            <View style={styles.flexFill}/>
                            <Text style={styles.btnLabel}>Save</Text>
                            <View style={styles.flexFill}/>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    fullscreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    dismissBackground: {
        width: '100%',
        height: '100%',
        backgroundColor: '#00000044',
        position: 'absolute'
    },
    modal: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginVertical: 8,
        flexDirection: 'column',
        shadowColor: "#00000088",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        alignItems: 'center',
        maxWidth: '75%'
    },
    header: {
        color: '#000',
        alignSelf: 'flex-start',
        fontSize: 28,
        marginHorizontal: 16,
        marginTop: 16
    },
    groupNameContainer: {
        flexDirection: 'row',
    },
    groupName: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        color: '#000',
        paddingHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        fontSize: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
        alignSelf: 'flex-start',
        flex: 1,
        marginHorizontal: 16,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    flexFill: {
        flex: 1
    },
    button: {
        flex: 1,
        padding: 16,
        margin: 16,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    btnLabel: {
        fontSize: 20
    }
});

export default AddGroupModal;
export type { Props };
export const ComponentId = 'AddGroupModal';