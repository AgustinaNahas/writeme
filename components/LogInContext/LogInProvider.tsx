import {Component} from "react";
import React from "react";

import MyContext from './Context';

export class LogInProvider extends Component {
    state = {
        user: {
            username: "Agus"
        }
    };

    render() {
        return (
            <MyContext.Provider
                value={{
                    user: this.state.user,
                    setName: texto => {
                        this.setState({
                            user: {username: texto}
                        });
                    }
                }}
            >
                {this.props.children}
            </MyContext.Provider>
        );
    }
}