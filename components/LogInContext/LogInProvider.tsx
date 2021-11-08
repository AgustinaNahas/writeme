import {Component} from "react";
import React from "react";

import MyContext from './Context';

export class LogInProvider extends Component {
    state = {
        user: {
            username: "Agus"
        },
        filename: "",
        token: undefined,
        commands: [
            {key: "negrita", value: "b", type: "complex"},
            {key: "cursiva", value: "i", type: "complex"},
            {key: " punto", value: ". ", type: "simple"},
            {key: " coma", value: ", ", type: "simple"},
        ],
        voces: [
            {key: "Mica"},
            {key: "Enzo"},
            {key: "Agus"},
        ]
    };

    render() {
        return (
            <MyContext.Provider
                value={{
                    user: this.state.user,
                    filename: this.state.filename,
                    token: this.state.token,
                    commands: this.state.commands,
                    setName: texto => {
                        this.setState({
                            user: {username: texto}
                        });
                    },
                    setFilename: filename => {
                        this.setState({
                            filename: filename
                        });
                    },
                    setCommands: commands => {
                        this.setState({
                            commands: commands
                        });
                    },
                    setToken: texto => {
                        this.setState({
                            token: texto
                        });
                    },
                    voces: this.state.voces,
                }}
            >
                {this.props.children}
            </MyContext.Provider>
        );
    }
}