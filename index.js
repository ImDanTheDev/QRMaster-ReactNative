import { Navigation } from 'react-native-navigation'
import Creator, { ComponentId as CreatorId, Props as CreatorProps} from './src/components/Creator';
import Dashboard, { ComponentId as DashboardId, Props as DashboardProps} from './src/components/Dashboard';

Navigation.registerComponent(DashboardId, () => Dashboard);
Navigation.registerComponent(CreatorId, () => Creator);
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
