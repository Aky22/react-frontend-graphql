import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Input from "react-toolbox/lib/input";
import {Component} from "react";
import gql from "graphql-tag";
import {ApolloClient, HttpLink, InMemoryCache} from "apollo-client-preset";
import {inject, observer, Provider} from "mobx-react";
import Button from "react-toolbox/lib/button";
import ProjectComponent from "./ProjectComponent";

const userLogin = gql`
    query($username: String!, $password: String!)
    {
        login(username: $username, password: $password) {
            access_token
            status
        }
    }
`;

const uri = 'http://localhost:3000/graphql/';

const client = new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache()
});

const userStore = new class {

    login = (username, password) =>
        client
            .query({
                query: userLogin,
                variables: { username, password },
            })
            .catch(error => console.error(error.message));

};

const LoginComponent = inject('userStore')(
    observer(
        class extends Component {

            state = {
                username: '',
                password: '',
                status: 0
            };

            handleChange = (name, value) => {
                this.setState({...this.state, [name]: value});
            };

            login = () => {
                // @ts-ignore
                this.props.userStore.login(this.state.username, this.state.password).then(res => this.setState({...this.state, status: res.data.login.status}));
            };

            render() {
                if(this.state.status == 200){
                    return (<ProjectComponent />);
                }else {
                    return (
                        <div>
                            <Input type='text' label='Username' name='username' value={this.state.username}
                                   onChange={this.handleChange.bind(this, 'username')} maxLength={16}/>
                            <Input type='password' label='Password' name='password' value={this.state.password}
                                   onChange={this.handleChange.bind(this, 'password')} maxLength={16}/>
                            <Button onClick={this.login} label='Login' />
                        </div>
                    );
                }
            }
        }
    )
);

const Login = () => (
    <Provider {...{ userStore }}>
        <LoginComponent />
    </Provider>
);

export default Login;
