import { useState } from "react";
import React from "react";
import {
    Alert,
    Modal,
    View,
    StyleSheet,
    Text,
    TouchableHighlight,
    TextInput,
    TouchableOpacity,
    Image
} from "react-native";

export const VocesDisplay = ({ voces, remove }) => {

    console.log(voces)

    return <View style={{width: "100%"}}>
        { voces.map((voz, index) =>
            <TouchableOpacity
                style={{ width: "100%", padding: 20, backgroundColor: "#BBBBBB", display: "flex", flexDirection: "row", justifyContent: "space-between" }}
                onPress={() => { remove(voces[index]); }}>
                <Text style={{ paddingTop: 4 }} > {voz.key} </Text>
                <Image style={{ height: 24, width: 24 }} source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAoElEQVRIieWVwQ3DIAxFX7NDUUbKKu0UOXa+5JB7Mgi9uJWDSApYVGn6JYQx3/5gQMC/oAd80B4pgZeIzxsXs8rZGJMV41UGM7/6Dg4jcAOcGjvxFUPX9C72KImd2F7mQn62gE44BraL8LMFAK7AoPwT0O7w37AccuyRJuOrJap+yPD5mpoFivmHecm/J7BIH/5iW03HJKED5gyBWWJOiCdWa1gDu5MzfgAAAABJRU5ErkJggg=="}}/>
            </TouchableOpacity>
        )}
    </View>
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        width: "100%",
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    openButton: {
        backgroundColor: '#F194FF',
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
    },
});