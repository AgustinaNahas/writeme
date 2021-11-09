import React from "react";
import {
    Dimensions, Image,
    StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity,
    View,
} from "react-native";
import * as Icons from "./Icons";
import {ContextProvider} from "./LogInContext/ContextProvider";
import {LogInAction} from "./LogInContext/LogInAction";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFFFFF";
import SnackBar from 'react-native-snackbar-component';

import logo from "./../assets/images/logo.png";

type Props = {};

export default class LogIn extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
        this.state = {
            username: "enzo",
            password: "enzo",
            error: false,
        }
    }

    render() {
        return (
                <View style={styles.container}>
                    <View style={{display: 'flex', width: '100%', paddingTop: 30}}>
                        <View style={{
                            width: '100%',
                            display: "flex",
                            padding: 24,
                            paddingBottom: 0,
                            alignItems: "center"
                        }}>
                            <Image source={logo} style={{ marginLeft: "auto", marginRight: "auto",
                                width: 250, height: 125, marginBottom: 30 }} />
                            <Text
                                style={{fontFamily: "cutive-mono-regular", width: "75%"}}
                            >
                                Nombre de usuario:
                            </Text>
                            <TextInput
                                style={{
                                    height: 40,
                                    borderColor: '#ADB5BD',
                                    borderWidth: 1,
                                    width: "75%",
                                    marginTop: 16,
                                    padding: 6,
                                    borderRadius: 3
                                }}
                                autoCapitalize="none"
                                autoCompleteType="username"
                                autoCorrect={false}
                                onChangeText={text => {
                                    this.setState({username: text})
                                }}
                                value={this.state.username}
                            />
                        </View>
                        <View style={{
                            width: '100%',
                            display: "flex",
                            padding: 24,
                            paddingBottom: 0,
                            alignItems: "center"
                        }}>
                            <Text
                                style={{fontFamily: "cutive-mono-regular", width: "75%"}}
                            >
                                Contraseña:
                            </Text>
                            <TextInput
                                style={{
                                    height: 40,
                                    borderColor: '#ADB5BD',
                                    borderWidth: 1,
                                    width: "75%",
                                    marginTop: 16,
                                    padding: 6,
                                    borderRadius: 3
                                }}
                                autoCapitalize="none"
                                autoCompleteType="password"
                                autoCorrect={false}
                                secureTextEntry={true}
                                onChangeText={text => {
                                    this.setState({password: text})
                                }}
                                value={this.state.password}
                            />
                        </View>
                        <View style={{
                            width: '100%',
                            display: "flex",
                            padding: 24,
                            paddingBottom: 0,
                            alignItems: "center"
                        }}>
                                <LogInAction {...this.state} action={() => this.props.navigation.navigate('WriteMe')}
                                             error={() => {
                                                 console.log("Error!!!")
                                                 this.setState({error: true})
                                             }}/>
                        </View>
                        <View style={{
                            width: '100%',
                            display: "flex",
                            padding: 24,
                            paddingBottom: 0,
                            alignItems: "center"
                        }}>
                            <View style={{ width: "100%" }}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={{
                                        backgroundColor: "white",
                                        width: "75%",
                                        paddingTop: 6,
                                        paddingBottom: 12,
                                        borderRadius: 3,
                                        marginTop: 10,
                                        marginLeft: "auto",
                                        marginRight: "auto"
                                    }} onPress={() => { this.props.navigation.navigate('Registrarse') }}>
                                    <Text style={{
                                        fontFamily: "inter",
                                        fontSize: 12,
                                        textAlign: "center",
                                        marginTop: 6,
                                        color: "#A10060",
                                    }}> Registrarse </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: BACKGROUND_COLOR,
        minHeight: DEVICE_HEIGHT,
        maxHeight: DEVICE_HEIGHT,
        // borderColor: 'purple', borderWidth: 1,
    },

});
