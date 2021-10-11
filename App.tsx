import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Grabar from "./components/Grabar";
import ListaGrabaciones from "./components/ListaGrabaciones";
import * as Font from "expo-font";
import {useEffect, useState} from "react";
import {Image, View} from "react-native";

import logo from "./assets/images/logo-minimalista.png";
import LogIn from "./components/LogIn";
import {LogInProvider} from "./components/LogInContext/LogInProvider";

const Stack = createStackNavigator();

function App() {

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

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
            await sleep(1000);

            setFonts(true);

        })();
    }, []);

  return (
      <LogInProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="LogIn">
              <Stack.Screen name="LogIn" component={LogIn} />
              <Stack.Screen name="WriteMe" component={fonts ? Grabar : Loading} />
              <Stack.Screen name="Lista grabaciones" component={ListaGrabaciones} />
            </Stack.Navigator>
          </NavigationContainer>
      </LogInProvider>
  );
}

function Loading(){
    return <View style={{ width: "100%", height: "100%", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Image source={logo} style={{ width: 100, height: 70 }} />
    </View>
}

export default App;