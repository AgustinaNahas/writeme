import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Grabar from "./Grabar";
import ListaGrabaciones from "./ListaGrabaciones";
import * as Font from "expo-font";
import {useEffect, useState} from "react";
import * as Permissions from "expo-permissions";
import {View} from "react-native";

const Stack = createStackNavigator();

function App() {

    const [fonts, setFonts] = useState(false);

    useEffect(() => {
        (async () => {
            await Font.loadAsync({
                "cutive-mono-regular": require("./assets/fonts/CutiveMono-Regular.ttf"),
            });
            await Font.loadAsync({
                "inter": require("./assets/fonts/Inter-Bold.ttf"),
            });
            await Font.loadAsync({
                "open-sans": require("./assets/fonts/OpenSans-Regular.ttf"),
            });
            setFonts(true);

        })();
    }, []);

  return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Grabar" component={fonts ? Grabar : View} />
          <Stack.Screen name="Lista grabaciones" component={ListaGrabaciones} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default App;