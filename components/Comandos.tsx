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


type Props = {};

type State = {
    haveRecordingPermissions: boolean;
};

export default class Comandos extends React.Component<Props, State> {

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

                        <Text
                            style={{
                                padding: 10
                            }}
                        >
                            {context.user.username}
                        </Text>
                        <View style={{ width: "100%" }}>
                            <View style={{ display: "flex" }}>

                                <ComandDisplay
                                    openModal={this.state.openModal}
                                    close={(state) => this.setState({openModal: state ? state : !this.state.openModal})}
                                    comandos={context.commands}
                                    // selectedComand={this.state.selectedComand}
                                    // setSelectedComand={(a) => this.setState({selectedComand: a})}
                                    // selectedComandIndex={this.state.selectedComandIndex}
                                    // setSelectedComandIndex={(a) => this.setState({selectedComandIndex: a})}
                                    saveComand={(comand, index)=>{
                                        const comandos = context.commands;
                                        comandos.splice(index, 1, comand);
                                        context.setCommands(comandos);
                                        this.setState({openModal: false})
                                        console.log(this.state.openModal)
                                    }}
                                    deleteComand={(comand, index)=>{
                                        const comandos = context.commands;
                                        comandos.splice(index, 1);
                                        context.setCommands(comandos);
                                        this.setState({openModal: false})
                                    }}
                                    discardChanges={() => {
                                        this.setState({openModal: false})
                                    }}
                                />

                            </View>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => {
                                const comandos = context.commands;
                                comandos.push({key: "", value: "", type: ""});
                                context.setCommands(comandos);
                                this.setState({openModal: true})
                            }}
                            style={styles.bottomButton}>
                            <Image source={{ uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAABmJLR0QA/wD/AP+gvaeTAAAD9ElEQVR4nO2dPWsUQRiAHxM54xcm2hg/WqsIgqK1/oOksNIfoFhHrIxoYaUXJZ1dOjUBQRDE5A8Yg/hRaCGJikREFI1eFHOx2D2JMWbvbt7Zd2b3fWAI3OZmZ95nZ/bj3t0FwzAMwzAMwzAMd/qAKvAMmAeWlMuQ3+6GQwUYARbRD3rpJFSACfQDXVoJI+gHuLQS+oBf6Ae3tBKG0Q9qq+Wyl0go8Rz9gJZ6JHxFP5ilHglZnQytPYWTELuA6CUUQUDUEooiIFoJRRIQpYSiCYhOQhEFRCWhqAKikVBkAVFIKLqA4CWUQUDQEsoiIFgJZRIQpISyCQhOQhkFBCWhrAJEJKxzrYDsIEusoxXylu7Uvw6pVhjtYQKUMQHKrNdugAek9zle9yk2ApQxAcqYAGVMgDImQBkToIwJUMYEKGMClDEBypgAZYp4LUiao8Br4BPwOf2sG9gO7HWtvIg/yESFTUHKmABlTIAyJkAZE6CMCVDGzgNWpwM4BBxL/+4D9gCb0+XfgLfAC+ARMAlMAfXcW0p4mXEu9AKXSE68Ws2Sm02/25t3o4sgoIfkoSM13NMVa2ld3Xk1PnYBA8B75PNG59K6vROrgE7yedRONV2XN2IU0AWM4z/4jTKertMLsQnoBG6RX/Ab5Q6ejjpjE6D5hK+rPjoUk4AB9IK/RHKe0C/dqVgEbAPeoStgieToqEeyY7EIuIZ+8BtlWLJjMQjYCXxHP/CNUgN2QXkuxp0BNgrUcyEtrnQBpwXqAcIfAR0k12lct9rzy+o8K1DfDEIDIHQBh3EP1mrPGB0SqPeQRAdDF3AOuS1/Ja4jYVCig6ELuI2f4DdwkXBToH/BC3iK3LTzP9qdjp449SwldAEf8bPlr6SdkfChzT79RegCfuA/+A1albDgsK4/FEmAS/AbtCKhFAKanYIkgt+gWQmlmIKa2Qn7eJdAMzvmUuyEsw5DJbf8lWSNBJHD0C8ZK/FdTmW0z/VEzGcZlLgW8UagDhf2ZyyfyKUV7TEpIeC+QB0uHMlYPkWSaBUas8C0hIAbJG/P0+IAsGON5XVgNKe2tMIogqmM19GdS09ktK8Xmaw3qVJDOIWxAjxQ7NDdJtoY0vvOqk20t2UqJL+7arxV7yewO6N93SQ/iGsHf45leaOSKXOLwD1gjOT0fyuwiUSMbzpJhvXkGv+zALwCjqN35+YScBJ4rLT+IKiit/VfyaF/waOZmug1STcmNpBvcu5Yuk5jGZ0kuZp1/AW+TjLt2Ja/Bv34OTqaw0MeaFHpRvYWpSo53qJUJHqBi7SXyDWTfrelM1x7ksnqdAAH+fc21S3p8nmS21RfAg9Jzj+maePazm8skvV3yRHRaQAAAABJRU5ErkJggg=="}}
                                   style={styles.floatingButtonStyle}
                            />
                            <Text style={{ fontFamily: "inter", fontSize: 12, textAlign: "center", marginTop: 6 }}> Nuevo </Text>
                        </TouchableOpacity>
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
