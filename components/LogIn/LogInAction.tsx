import {Component, Fragment} from "react";
import React from "react";
import MyContext from "./../Context/Context";
import {Text, TouchableOpacity, View} from "react-native";


export const LogInAction = ({username, password, preAction, action, error}) => {
    const login = async (context) => {

        preAction();

        const apiUrl = "https://writeme-api.herokuapp.com/login"
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

        console.log(result.token )
        console.log(!result.error)

        if (result.token && !result.error) {
            action();
        }
        else {
            error();
        }
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
                        login(context);
                    }}>
                    <Text style={{
                        fontFamily: "inter",
                        fontSize: 12,
                        textAlign: "center",
                        marginTop: 6,
                        color: "white"
                    }}> Ingresar </Text>
                </TouchableOpacity>
            </View>
        )}
    </MyContext.Consumer>

}