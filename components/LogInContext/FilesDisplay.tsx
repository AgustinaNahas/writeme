import {Component, Fragment, Props, useEffect, useState} from "react";
import React from "react";
import {Text, TouchableHighlight, TouchableOpacity, View} from "react-native";

export class FilesDisplay extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            files: []
        }
    }

    async componentDidMount() {

        let apiUrl = `https://writeme-api.herokuapp.com/user/${this.props.username}/files`;

        let options = {
            method: 'POST',
            body: {
                token: this.props.token
            },
        };

        console.log(apiUrl)
        console.log(options)

        try {
            let response = await fetch(apiUrl, options);
            let result = await response.json();

            if (result.length > 0) {
                this.setState({files: result})
            }

            console.log(result)
        } catch(e) {
            console.log("Press F")
            console.log(e);
        }
    }


    render() {

        return <View style={{width: "100%"}}>
            {this.state.files.map((file, index) => <TouchableHighlight
                key={"file_" + index}
                    style={{
                        width: "100%",
                        borderBottomColor: "#ADB5BD",
                        borderBottomWidth: 1,
                        paddingBottom: 10
                    }}
                    onPress={() => this.props.action(file)}
                >
                    <Text
                        style={{
                            padding: 10
                        }}
                    >
                        {file}
                    </Text>
                </TouchableHighlight>
            )}
        </View>
    }

}