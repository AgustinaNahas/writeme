import React from "react";
import {
    Dimensions, Image,
    StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity,
    View,
} from "react-native";
import * as Icons from "./Icons";
import {LogInProvider} from "./LogInContext/LogInProvider";
import {LogInAction} from "./LogInContext/LogInAction";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFFFFF";

type Props = {};

type State = {
    haveRecordingPermissions: boolean;
};

export default class LogIn extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            username: "enzo",
            password: "enzo",
        }
    }


    render() {
        const login = () => {
            const credenciales = {
                "agus": "agus",
                "enzo": "enzo",
                "mica": "mica"
            }

            if (credenciales[this.state.username] === this.state.password) {
                this.props.navigation.navigate('WriteMe')
            } else {

            }

        }

        return (
                <View style={styles.container}>
                    <View style={{display: 'flex', width: '100%', paddingTop: 60}}>
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
                                <LogInAction {...this.state} action={() => this.props.navigation.navigate('WriteMe')}/>
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
