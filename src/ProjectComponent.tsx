import * as React from 'react';
import * as ReactDOM from 'react-dom';
import gql from 'graphql-tag';
import {graphql, QueryRenderer} from 'react-relay';
import {Component} from "react";
import {Table, TableHead, TableCell, TableRow} from "react-toolbox/lib/table";
import {Dialog} from "react-toolbox/lib/dialog";
import {Input} from "react-toolbox/lib/input";
import * as environment from './environment';

const projectFragment = gql`
    fragment project on Project {
        id
        description
        name
        taskCount
    }
`;

const allProjectsQuery = gql`
    {
        getProjects {
            ...project
        }
    }
    ${projectFragment}
`;

const projectQuery = gql`
    {
        project(id: $id) {
            ...project
        }
    }
`;

const createProjectMutation = gql`
    mutation createProject($createProjectInput: CreateProjectInput) {
        createProject(createProjectInput: $createProjectInput) {
            ...project
        }
    }
    ${projectFragment}
`;

export default class ProjectComponent extends Component {

    render() {
        return (
            <QueryRenderer
                environment={environment}
                query={graphql`
                    query ProjectQuery {
                        getProjects {
                            id
                        }
                    }
                `}
                variables={{}}
                render={({error, props}) => {
                    if (error) {
                        return <div>Error!</div>;
                    }
                    if (!props) {
                        return <div>Loading...</div>;
                    }
                    return <div>User ID: {props.getProjects.id}</div>;
                }}
            />
        );
    }

}
