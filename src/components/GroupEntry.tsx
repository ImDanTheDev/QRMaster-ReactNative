import React, { useState, FC } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import IGroupData from '../IGroupData';

interface Props {
    group: IGroupData,
    disabled: boolean,
    isOpen: boolean,
    onOpen: () => void;
    onClose: () => void;
    onDeleteGroup: () => void;
}

const DashboardEntry: FC<Props> = (props: Props) => {
    const [deleteMode, setDeleteMode] = useState<boolean>(false);

    /** Toggle the openness of the group.  */
    const handleGroupPress = () => {
        if (props.isOpen) {
            props.onClose();
        } else {
            props.onOpen();
        }
    }

    /** Toggles deletion mode. */
    const handleGroupLongPress = () => {
        if (props.group.id === 'default') return;
        setDeleteMode(!deleteMode);
    }

    /** Calls callbacks to close and delete the group. */
    const handleDeletePress = () => {
        props.onClose();
        props.onDeleteGroup();
    }

    // Hide the group if its disabled (used for spacing in grid layouts).
    if (props.disabled)
    {
        return (<View style={styles.disabled}/>)
    }

    if (deleteMode)
    {
        return (
            <View style={styles.groupEntry}>
                <TouchableOpacity onPress={handleDeletePress}>
                    <FontAwesome5 name={'trash'} size={36} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGroupLongPress}>
                    <FontAwesome5 name={'arrow-left'} size={36} />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <TouchableOpacity style={styles.groupEntry} onPress={handleGroupPress} onLongPress={handleGroupLongPress}>
            <Text>{props.group.name}</Text>
            <FontAwesome5 name={props.isOpen ? 'folder-open' : 'folder'} size={58}/>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    disabled: {
        height: 100,
        width: 100,
        flexGrow: 0,
        flexShrink: 0,
    },
    groupEntry: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        marginVertical: 8,
        padding: 16,
        flexDirection: 'column',
        height: 100,
        width: 100,
        flexGrow: 0,
        flexShrink: 0,
        shadowColor: "#00000088",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
        alignItems: 'center',
        justifyContent: 'space-between'
    }
});

export default DashboardEntry;