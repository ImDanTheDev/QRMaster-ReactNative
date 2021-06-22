import React, { FC } from 'react';
import {
    Button,
} from 'react-native';

interface Props {
    /** react-native-navigation component id. */
    componentId: string,
    /** Callback for when the button is pressed. */
    onOpenScanner: () => Promise<void>
}

const ScannerButton: FC<Props> = (props: Props) => {
    return (
        <Button title={'Scan'} onPress={props.onOpenScanner}/>
    )
}

export default ScannerButton;
export type { Props };
export const ComponentId = 'ScannerButton';