import {Component, Fragment} from "react";
import React from "react";
import MyContext from "./Context";
import {Text, TouchableOpacity, View} from "react-native";


export const SignUpAction = ({username, password, action}) => {
    const signup = () => {
        const credenciales = {
            "agus": "agus",
            "enzo": "enzo",
            "mica": "mica"
        }

        return (credenciales[username] === password)

    }

    return <MyContext.Consumer>
        {context => (
            <View style={{ width: "100%" }}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: "#A10060",
                        width: "75%",
                        paddingTop: 6,
                        paddingBottom: 12,
                        borderRadius: 3,
                        marginTop: 10,
                        marginLeft: "auto",
                        marginRight: "auto"
                    }} onPress={() => {
                        if (signup()) {
                            action();
                            context.setName(username)
                        }
                    }}>
                    <Text style={{
                        fontFamily: "inter",
                        fontSize: 12,
                        textAlign: "center",
                        marginTop: 6,
                        color: "white"
                    }}> Registrarse </Text>
                </TouchableOpacity>
            </View>
        )}
    </MyContext.Consumer>

}