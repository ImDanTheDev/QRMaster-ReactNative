import { Navigation } from 'react-native-navigation'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import CreatorScreen, { ComponentId as CreatorId} from './src/components/CreatorScreen';
import DashboardScreen, { ComponentId as DashboardId} from './src/components/DashboardSceen';
import PrintPreviewScreen, { ComponentId as PrintPreviewId} from './src/components/PrintPreviewScreen';
import ScannerScreen, { ComponentId as ScannerId} from './src/components/ScannerScreen';
import AddGroupModal, { ComponentId as AddGroupModalId} from './src/components/AddGroupModal';

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
Navigation.registerComponent(AddGroupModalId,
  () => gestureHandlerRootHOC(AddGroupModal),
  () => AddGroupModal);
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
