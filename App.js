const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('defaultProps will be removed from function components')
  ) {
    return;
  }
  originalWarn(...args);
};

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('defaultProps will be removed from function components')
  ) {
    return;
  }
  originalError(...args);
};


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './pages/login';
import SurveyPage from './pages/surveypage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Survey" component={SurveyPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
