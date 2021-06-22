import { Navigation } from 'react-native-navigation'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import CreatorScreen, { ComponentId as CreatorId, Props as CreatorProps} from './src/components/CreatorScreen';
import DashboardScreen, { ComponentId as DashboardId, Props as DashboardProps} from './src/components/DashboardSceen';
import PrintPreviewScreen, { ComponentId as PrintPreviewId, Props as PrintPreviewProps} from './src/components/PrintPreviewScreen';
import ScannerScreen, { ComponentId as ScannerId, Props as ScannerProps} from './src/components/ScannerScreen';
import ScannerButton, { ComponentId as ScannerButtonId, Props as ScannerButtonProps} from './src/components/ScannerButton';

Navigation.registerComponent(DashboardId,
  () => gestureHandlerRootHOC(DashboardScreen),
  () => DashboardScreen);
Navigation.registerComponent(CreatorId,
  () => gestureHandlerRootHOC(CreatorScreen),
  () => CreatorScreen);
Navigation.registerComponent(PrintPreviewId,
  () => gestureHandlerRootHOC(PrintPreviewScreen),
  () => PrintPreviewScreen);
Navigation.registerComponent(ScannerId,
  () => gestureHandlerRootHOC(ScannerScreen),
  () => ScannerScreen);
Navigation.registerComponent(ScannerButtonId,
  () => gestureHandlerRootHOC(ScannerButton),
  () => ScannerButton);
Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: DashboardId,
            }
          }
        ]
      }
    }
  })
});
