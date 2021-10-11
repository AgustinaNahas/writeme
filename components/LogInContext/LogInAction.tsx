import {Component, Fragment} from "react";
import React from "react";
import MyContext from "./Context";
import {Text, TouchableOpacity, View} from "react-native";


export const LogInAction = ({username, password, action}) => {
    const login = () => {
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
                <Text style={{ width: "100%", textAlign: "center" }}>{context.user.username}</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={{
                        backgroundColor: "#A10060",
                        width: "75%",
                        paddingTop: 6,
                        paddingBottom: 12,
                        borderRadius: 3,
                        marginTop: 40,
                        marginLeft: "auto",
                        marginRight: "auto"
                    }} onPress={() => {
                        if (login()) {
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
                    }}> LogIn </Text>
                </TouchableOpacity>
            </View>
        )}
    </MyContext.Consumer>

}