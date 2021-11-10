import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableHighlight, View } from "react-native";
import * as Icons from "./Icons";
import MyContext from "./../Context/Context";
import {FilesDisplay} from "./../Grabaciones/FilesDisplay";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFFFFF";

type Props = {};

type State = {
    haveRecordingPermissions: boolean;
};

export default class ListaGrabaciones extends React.Component<Props, State> {
    render() {
        return (
            <MyContext.Consumer>
                {context => (
                    <View style={styles.container}>
                        <FilesDisplay username={context.user.username} action={(filename) => {
                            context.setFilename(filename)
                            this.props.navigation.navigate('WriteMe')
                        }}/>
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

});
