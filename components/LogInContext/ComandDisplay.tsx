import { useState } from "react";
import React from "react";
import { Alert, Image, Modal, View, StyleSheet, Text, TextInput, TouchableOpacity, Switch } from "react-native";
import { Picker } from '@react-native-picker/picker';

export const ComandDisplay = ({comandos, saveComand, deleteComand, openModal, close }) => {

    const [selectedComand, setSelectedComand] = useState(false);
    const [selectedComandIndex, setSelectedComandIndex] = useState(false);

    return <View style={{width: "100%"}}>
        <Modal
            animationType="slide"
            transparent={true}
            visible={openModal}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <TextInput
                        style={{ height: 40, textAlign: "center", borderBottomColor: '#ADB5BD', borderBottomWidth: 1, width: "100%", padding: 6, borderRadius: 3  }}
                        onChangeText={text => {
                            let comand = Object.assign({}, selectedComand);
                            comand.key = text;
                            setSelectedComand(comand);
                        }}
                        value={selectedComand ? selectedComand.key : ""}
                    />

                    <Picker
                        style={{ width: "100%" }}
                        selectedValue={selectedComand.value}
                        onValueChange={(value) => {
                            let comand = Object.assign({}, selectedComand);
                            comand.value = value;
                            setSelectedComand(comand);
                        }}>
                        <Picker.Item label="Negrita" value="b" />
                        <Picker.Item label="Cursiva" value="i" />
                        <Picker.Item label="Subrayado" value="u" />
                        <Picker.Item label="Punto" value=". " />
                        <Picker.Item label="Coma" value=", " />
                        <Picker.Item label="Guion" value="-" />
                        <Picker.Item label="Pregunta" value="?" />
                        <Picker.Item label="Exclamación" value="!" />
                    </Picker>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginBottom: 40 }}>
                        <Text style={{ textAlign: "left", marginRight: 15 }}> Activo </Text>
                        <Switch
                            trackColor={{false: '#767577', true: '#A10060'}}
                            thumbColor={selectedComand.active ? '#f4f3f4' : '#f4f3f4'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(value) => {
                                let comand = Object.assign({}, selectedComand);
                                comand.active = value;
                                setSelectedComand(comand);
                            }}
                            value={selectedComand.active}
                        />
                    </View>
                    <View style={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={{ padding: 10, backgroundColor: "#EFEFEF", borderRadius: 8, display: "flex", alignItems: "center" }}
                            onPress={() => {close(!openModal);
                                saveComand(selectedComand, selectedComandIndex);}}>
                            <Image style={{ height: 40, width: 40 }} source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAABR0lEQVRoge2YPW7CQBBGX6LUOUBS5wJpcghAXCkSQuIoaejThHCA3ASlwNCTAiNFq43N7vw4luZJU1jszDcfO7a1hiAIgv/ME7AGGuBkHK8WzX87NG5mYu3cvLoJj7ExNZEWteKZ/KiupIW9DICRCU8DYGDC2wAom+gzIL1RS02MxgDAy7Xrb3oMdK2VjlWX9jX6ANwKmxicMDA0d4Lcvhl2YfQ7EAaGxsLAHNgCxzY+gZmBTi81r/JVJu8SSwd9UYF5JieNqaG+uMA2k5PGxlBfXOCQyUmj0db3fgqpnys0DXwprVGjdIRmmZw0Job6KgWWmbxLLBz0VQpMOT9tDm18UPbPF+lLTmTWxIlsFIzeQNeJrAHuf12rv4QK2P/1Q9cOvBs0UktVL4/ADvkHLGnsgIcaA7SJb5y30Lvxfatd3XwQBIE9PzMai0xo4VXdAAAAAElFTkSuQmCC"}}/>
                            <Text style={{ textAlign: "center", fontSize: 8, fontFamily: "inter" }}> Guardar </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 10, backgroundColor: "#EFEFEF", borderRadius: 8, display: "flex", alignItems: "center" }}
                            onPress={() => {close(!openModal);
                                deleteComand(selectedComand, selectedComandIndex);}}>
                            <Image style={{ height: 40, width: 40 }} source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAABU0lEQVRoge2YO04DMRCGPxA1B4AjkOOAUsA9UpIyR8kRuFOq0IK0FKylxfgxfjFhNZ+0xSqTmf/3yPYkYBhGT/bAlHkOauoySMR3N3EliJl6FaskqfH6r1SMwgxoI9kDDn8vlHx3WP5/3wEzoI0Z0Ka3gYdOMUPw5xmfPfAJvCRyPAEfhGehXP5mUgWWg1zMhBMfG+jUDGw8YdP8vl3EbCMxm0swAPAYEOg64a+8++y5IP9wAxBf5Vx3pPmbkRQIdSK38iX5m5AWiJlIiS/J/4MRF1lqiuw9wRYhWaHQhg1t7Nr8Tax6E6eOytQRexEGVnGR7fi98j5+J14L8nchV2BH/qh0JnzxkvzNSAq0jNNVBuxfCW3MgDZmQBszoM1NQew7cLt4H3JbzpylgSUdeKsQUsuQWvfAifiPlV7PCbgbYYA58ZHvFvcWfp5zDxNvGGvkC7DGLyDlpyUPAAAAAElFTkSuQmCC"}}/>
                            <Text style={{ textAlign: "center", fontSize: 8, fontFamily: "inter" }}> Eliminar </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 10, backgroundColor: "#EFEFEF", borderRadius: 8, display: "flex", alignItems: "center" }}
                            onPress={() => {
                                close(!openModal)}}>
                            <Image style={{ height: 40, width: 40, }} source={{uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAABmJLR0QA/wD/AP+gvaeTAAABGElEQVRoge2ZTQ6CMBCFn15HjqNhofdgqUvvrAlueJuGEuj8dGr6JSwIyfR9bYApAJ1Op9MCl5bHfAH4AnhoFdzBDcAHwFta6AVgXg4vCYbnuMUSQ1JoXs5HecYsY2bMobTgdaWg1UqkM8+x7tLCHhJm4YmlhHl4YiHhFp5oSriHJxoS1cITiUT18KREIkx4ckQiXHiyRyJseLIlET48yfUx3v2UiLWVCD/zKTkJk/Bn7YIAToXXQrB2w3q04io0fRNvPSo9N0VF7HnOh5U48pIKJ1Hyhg0jIWkPqkto9DbVJDQbM3cJi67STcKyJTaX8OjnzSQ8NyPqEn/xcXeC/cynpCvxlBac4L+TooQ4PGn6F1On0+nY8QN8QVJkL9gdPQAAAABJRU5ErkJggg=="}}/>
                            <Text style={{ textAlign: "center", fontSize: 8, fontFamily: "inter" }}> Descartar </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>

        {comandos.map((comando, index) =>
            <TouchableOpacity
                style={{ width: "100%", padding: 20, display: "flex", flexDirection: "row", backgroundColor: "#FCFCFC", borderBottomColor: "#CED4DA", borderBottomWidth: 1 }}
                onPress={() => { close(!openModal); setSelectedComand(comando); setSelectedComandIndex(index); }}>
                <Text style={{ width: "80%" }}> {comando.key} </Text>
                <Image style={{ height: 20, width: 20 }}
                       source={{uri: comando.active ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAnklEQVRIie2VMQ6AIAxFX7yDxiN5FT2uDu56EB2EiFVSCg4OvoSJ9r+kBIAfIx2wAlvmWlxGlKUgPJRE8UW53PqrgrAkPi9ogN7SYDmDBphc/ZDanyqogdHVzkD7piAWniXoOUbhCccyiT2zYBBBWrhZIAO1cLMArvN+mnmxIJRo4dkCOM9A47V7kNwvn4pVFFpXmPFIR9mfoH44Pzd2G42KEKyvKj8AAAAASUVORK5CYII=" : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAAUUlEQVRIiWNgGAUkAg8GBobHDAwM/8nEj6Bm4ASPKDAc2RKcAKaIXIChn4kCw4gCoxaMWjBqwagFg9GCx1Ca3KIa2QyswIOBsjqBYIUzCjAAALrIRhJJbcctAAAAAElFTkSuQmCC"}}
                />
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
        width: "90%",
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
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