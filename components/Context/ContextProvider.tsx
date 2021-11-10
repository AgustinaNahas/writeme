import {Component} from "react";
import React from "react";

import MyContext from './Context';
import {getCommands, storeCommands} from "../Commands/storage";

export class ContextProvider extends Component {
    state = {
        user: {
            username: "Agus"
        },
        filename: "",
        token: undefined,
        commands: [],
        voces: [
            {key: "Mica"},
            {key: "Enzo"},
            {key: "Agus"},
        ]
    };

    async componentDidMount() {
        // await storeCommands(null)
        const commands = await getCommands();
        if (!commands){
            const initialCommands = [
                {key: "negrita", value: "b", type: "complex", active: true},
                {key: "cursiva", value: "i", type: "complex", active: true},
                {key: "subrayado", value: "u", type: "complex", active: true},
                {key: " guión ", value: "-", type: "simple", active: true},
                {key: " punto ", value: ". ", type: "simple", active: true},
                {key: " coma ", value: ", ", type: "simple", active: true},
                {key: "inicio pregunta", value: " ¿", type: "simple", active: true},
                {key: "fin pregunta", value: "?", type: "simple", active: true},
                {key: "inicio exclamación", value: " ¡", type: "simple", active: true},
                {key: "fin exclamación", value: "!", type: "simple", active: true},
            ]
            storeCommands(initialCommands)
        }

        this.state.commands = commands;
    }

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