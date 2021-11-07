import React from "react";
import {
    Dimensions, Image,
    StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity,
    View,
} from "react-native";
import * as Icons from "./Icons";
import MyContext from "./LogInContext/Context";
import {FilesDisplay} from "./LogInContext/FilesDisplay";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFFFFF";
import {ComandDisplay} from "./LogInContext/ComandDisplay";
import {VocesDisplay} from "./LogInContext/VocesDisplay";


type Props = {};

export default class Voces extends React.Component {
    render() {
        return (
            <MyContext.Consumer>
                {context => (
                    <View style={styles.container}>
                        <View style={{ width: "100%" }}>
                            <View style={{ display: "flex" }}>
                                <VocesDisplay voces={context.voces} remove={(a) => {console.log(a)}}/>
                            </View>
                        </View>
                    </View>
                )}
            </MyContext.Consumer>
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
    bottomButton: {
        width: 72,
        height: 72,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: "column",
        alignSelf: "flex-end",
    },
    floatingButtonStyle: {
        resizeMode: 'contain',
        width: 50,
        height: 50,
    },

});
