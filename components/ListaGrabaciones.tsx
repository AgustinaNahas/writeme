import React from "react";
import {
    Dimensions,
    StyleSheet,
    View,
} from "react-native";
import * as Icons from "./Icons";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFF8ED";

type Props = {};

type State = {
    haveRecordingPermissions: boolean;
};

export default class ListaGrabaciones extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
    }

    componentDidMount() {

    }

    render() {

        return (
            <View style={styles.container}>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: BACKGROUND_COLOR,
        minHeight: DEVICE_HEIGHT,
        maxHeight: DEVICE_HEIGHT,
        borderColor: 'purple', borderWidth: 1,
    },
});
