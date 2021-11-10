import React from "react";
import {
    Dimensions, Image,
    StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity,
    View,
} from "react-native";
import {LogInAction} from "./LogInAction";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFFFFF";
import SnackBar from 'react-native-snackbar-component';

import logo from "./../../assets/images/logo.png";
import loading from "../../assets/images/loading.gif";

type Props = {};

export default class LogIn extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
        this.state = {
            username: "agus",
            password: "agus",
            error: false,
            loading: false,
        }
    }

    render() {
        return (
                <View style={styles.container}>
                    <View style={{ display: this.state.loading ? "flex" : "none", position: "absolute",
                        width: this.state.loading ? "100%" : 0, height: this.state.loading ? "100%" : 0,
                        justifyContent: "center", alignItems: "center", flexDirection: "row", zIndex: 1000,
                        backgroundColor: "#FDFDFD", opacity: this.state.loading ? 0.8 : 0 }}>
                        <Image source={loading} style={{ backgroundColor: "white", width: 80, height: 84 }} />
                    </View>

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
                                <LogInAction {...this.state} preAction={() => {this.setState({loading: true})}} action={() => {
                                    this.props.navigation.navigate('WriteMe')
                                    this.setState({error: false, loading: false})
                                }}
                                 error={() => {
                                     console.log("Error!!!")
                                     this.setState({error: true, loading: false})
                                     setTimeout(() => {this.setState({error: false, loading: false})}, 5000);
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
                        <SnackBar position="bottom" bottom={-70} visible={this.state.error} textMessage="Usuario y/o contraseña incorrectos. "
                                  autoHidingTime={3000} onDismiss={()=>{this.setState({ error: false })}} actionText="ok"/>

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
