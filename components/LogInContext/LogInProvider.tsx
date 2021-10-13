import {Component} from "react";
import React from "react";

import MyContext from './Context';

export class LogInProvider extends Component {
    state = {
        user: {
            username: "Agus"
        },
        filename: "",
        commands: [
            {key: "negrita", value: "b", type: "complex"},
            {key: "cursiva", value: "i", type: "complex"},
            {key: " punto", value: ". ", type: "simple"},
            {key: " coma", value: ", ", type: "simple"},
        ]
    };

    render() {
        return (
            <MyContext.Provider
                value={{
                    user: this.state.user,
                    filename: this.state.filename,
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
                }}
            >
                {this.props.children}
            </MyContext.Provider>
        );
    }
}