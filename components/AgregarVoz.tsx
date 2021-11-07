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

export const AgregarVoz = ({guardar}) => {

    const [name, setName] = useState("");
    const [openModal, setModal] = useState(false);

    return <View style={{}}>
        <Modal
            animationType="slide"
            transparent={true}
            visible={openModal}
            onRequestClose={() => {
                Alert.alert('Modal has been closed.');
            }}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text> Nombre de la nueva voz: </Text>
                    <TextInput
                        style={{ height: 40, textAlign: "center", borderBottomColor: '#ADB5BD', borderBottomWidth: 1, width: "100%", padding: 6, borderRadius: 3  }}
                        onChangeText={text => {
                            setName(text);
                        }}
                        value={name ? name : ""}
                    />
                    <View style={{ display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between" }}>
                        <TouchableOpacity
                            style={{ flex: 1, padding: 16, backgroundColor: "#BBBBBB", borderRadius: 8, marginTop: 10 }}
                            onPress={() => {setModal(!openModal); guardar(name);}}>
                            <Text style={{ textAlign: "center" }}> Guardar </Text>
                        </TouchableOpacity>
                    </View>


                </View>
            </View>
        </Modal>

        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => { setModal(!openModal); }}
            style={{ display: "flex", flexDirection: "row" }}
        >
            <Image
                source={{
                    uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAA/UlEQVRIie2VQW6CQBSGvzGmCdoLlKPoOXRHh16iId0Y9SAC3ek52p4EbkBpXDAuwDiZgDDUxBr7bRjevDf/+ycwA/+0IPSXLbOHbx7XAuUBTwCSUNRWVkT4qhqmQOyQLebs9sf5oZ6cM14J1GvPZl0g+GGkgLdjcGAkeeWjmEhC0dY9lA4loRggpgAKIfV5U8Ati+Iv2/Y9Np/6Gk0CZ4nwlbbnl6ePgJWDPpwVaOu4i6PrOrgJASv+/lf02x+prn7YlFxHl7PJxNyiFOCdl4ntQiFyWg0TPW46iIGgQH1E+IDVfXAKNQk4ZIucMcAzxqnYgQSIHLKlZd29cwD9PkzcN499rwAAAABJRU5ErkJggg==",
                }}
                //source={require('./images/float-add-icon.png')}
                style={{ height: 24, width: 24 }}
            />
            <Text style={{ color: "#A10060", fontFamily: "inter", fontSize: 12, textAlign: "center", marginTop: 6}}> Agregar esta voz </Text>
        </TouchableOpacity>
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