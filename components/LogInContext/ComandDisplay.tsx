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
import { Picker } from '@react-native-picker/picker';

export const ComandDisplay = ({comandos, saveComand, deleteComand, openModal, close }) => {

    const [selectedComand, setSelectedComand] = useState(false);
    const [selectedComandIndex, setSelectedComandIndex] = useState(false);

    return <View style={{width: "100%"}}>
        <Modal
            animationType="slide"
            transparent={true}
            visible={openModal}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.');
            }}>
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
                        <Picker.Item label="Punto" value=". " />
                        <Picker.Item label="Coma" value=", " />
                    </Picker>
                    <View style={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={{ flex: 1, padding: 20, backgroundColor: "#BBBBBB", borderRadius: 8 }}
                            onPress={() => {close(!openModal);
                                saveComand(selectedComand, selectedComandIndex);}}>
                            <Text style={{ textAlign: "center" }}> Guardar </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, padding: 20, backgroundColor: "#FFBBBB", borderRadius: 8 }}
                            onPress={() => {close(!openModal);
                                deleteComand(selectedComand, selectedComandIndex);}}>
                            <Text style={{ textAlign: "center" }}> Eliminar </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, padding: 20, backgroundColor: "#BBBBFF", borderRadius: 8 }}
                            onPress={() => {
                                close(!openModal)}}>
                            <Text style={{ textAlign: "center" }}> Descartar </Text>
                        </TouchableOpacity>
                    </View>


                </View>
            </View>
        </Modal>

        {comandos.map((comando, index) =>
            <TouchableOpacity
                style={{ width: "100%", padding: 20, backgroundColor: "#BBBBBB" }}
                onPress={() => { close(!openModal); setSelectedComand(comando); setSelectedComandIndex(index); }}>
                <Text> {comando.key} </Text>
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