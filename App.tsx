import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Grabar, {GrabarWrapper} from "./components/Grabar";
import ListaGrabaciones from "./components/Grabaciones/ListaGrabaciones";
import * as Font from "expo-font";
import {useEffect, useState} from "react";
import {Image, View} from "react-native";

import logo from "./assets/images/logo-minimalista.png";
import LogIn from "./components/LogIn/LogIn";
import {ContextProvider} from "./components/Context/ContextProvider";
import Comandos from "./components/Commands/Comandos";
import SignUp from "./components/SignUp/SignUp";
import Voces from "./components/Voces/Voces";

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

            setFonts(true);

        })();
    }, []);

  return (
      <ContextProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Ingresar">
              <Stack.Screen name="Ingresar" component={LogIn} />
              <Stack.Screen name="Registrarse" component={SignUp} />
              <Stack.Screen name="WriteMe" component={fonts ? GrabarWrapper : Loading} />
              <Stack.Screen name="Lista de grabaciones" component={ListaGrabaciones} />
              <Stack.Screen name="Comandos" component={Comandos} />
              <Stack.Screen name="Voces" component={Voces} />
            </Stack.Navigator>
          </NavigationContainer>
      </ContextProvider>
  );
}

function Loading(){
    return <View style={{ width: "100%", height: "100%", flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <Image source={logo} style={{ width: 100, height: 70 }} />
    </View>
}

export default App;