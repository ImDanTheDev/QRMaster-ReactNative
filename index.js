import { Navigation } from 'react-native-navigation'
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';

import CreatorScreen, { ComponentId as CreatorId, Props as CreatorProps} from './src/components/CreatorScreen';
import DashboardScreen, { ComponentId as DashboardId, Props as DashboardProps} from './src/components/DashboardSceen';
import PrintPreviewScreen, { ComponentId as PrintPreviewId, Props as PrintPreviewProps} from './src/components/PrintPreviewScreen';

Navigation.registerComponent(DashboardId,
  () => gestureHandlerRootHOC(DashboardScreen),
  () => DashboardScreen);
Navigation.registerComponent(CreatorId,
  () => gestureHandlerRootHOC(CreatorScreen),
  () => CreatorScreen);
Navigation.registerComponent(PrintPreviewId,
  () => gestureHandlerRootHOC(PrintPreviewScreen),
  () => PrintPreviewScreen);
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
