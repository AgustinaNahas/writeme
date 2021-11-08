import {Component, Fragment} from "react";
import React from "react";
import MyContext from "./Context";
import {Text, TouchableOpacity, View} from "react-native";


export const SignUpAction = ({username, password, action, error}) => {
    const signup = async (context) => {
        const apiUrl = "https://writeme-api.herokuapp.com/signup"
        const options = {
            method: 'POST',
            body: JSON.stringify({ "username": username, "password": password }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        };

        let response = await fetch(apiUrl, options);
        let result = await response.json();

        context.setToken(result.token)
        context.setName(username)

        if (result.token && !result.error) action();
        else error();

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
                        signup(context)
                        action();
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