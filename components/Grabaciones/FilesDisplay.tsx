import { Component, Fragment, Props, useEffect, useState } from "react";
import React from "react";
import { Text, TouchableHighlight, TouchableOpacity, View, ScrollView } from "react-native";

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
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        };

        console.log(apiUrl)
        console.log(options)

        fetch(apiUrl, options).then((response) => {
            if (response.ok) return response.json()
            else throw new Error('Señores hagan algo, salió todo mal');
        }).then((json) => {
            console.log(json)
            if (json.length > 0) {
                this.setState({files: json})
            }

        }).catch((error) => {
            console.log(error)
        });
    }


    render() {

        return <ScrollView style={{ width: "100%", marginBottom: 90 }}>
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
        </ScrollView>
    }

}