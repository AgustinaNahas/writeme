import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Grabar from "./Grabar";
import ListaGrabaciones from "./ListaGrabaciones";

const Stack = createStackNavigator();

function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Grabar" component={Grabar} />
          <Stack.Screen name="Lista grabaciones" component={ListaGrabaciones} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default App;