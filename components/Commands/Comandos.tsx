import React from "react";
import {
    Dimensions, Image,
    StyleSheet, Text, TextInput, TouchableHighlight, TouchableOpacity,
    View,
} from "react-native";
import * as Icons from "./Icons";
import MyContext from "./../Context/Context";
import {FilesDisplay} from "./../Grabaciones/FilesDisplay";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get("window");
const BACKGROUND_COLOR = "#FFFFFF";
import {ComandDisplay} from "./../Commands/ComandDisplay";
import {storeCommands} from "./../Commands/storage";


type Props = {};

export default class Comandos extends React.Component {

    constructor() {
        super();
        this.state = {
            openModal: false,
            selectedComand: null,
            selectedComandIndex: null
        }
    }

    render() {
        return (
            <MyContext.Consumer>
                {context => (
                    <View style={styles.container}>
                        <View style={{ width: "100%" }}>
                            <View style={{ display: "flex" }}>

                                <ComandDisplay
                                    openModal={this.state.openModal}
                                    close={(state) => this.setState({openModal: state ? state : !this.state.openModal})}
                                    comandos={context.commands}
                                    saveComand={(comand, index)=>{
                                        const comandos = context.commands;
                                        comandos.splice(index, 1, comand);
                                        context.setCommands(comandos);
                                        storeCommands(comandos);
                                        this.setState({openModal: false})
                                    }}
                                    deleteComand={(comand, index)=>{
                                        const comandos = context.commands;
                                        comandos.splice(index, 1);
                                        context.setCommands(comandos);
                                        storeCommands(comandos);
                                        this.setState({openModal: false})
                                    }}
                                    discardChanges={() => {
                                        this.setState({openModal: false})
                                    }}
                                />

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
