import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {action, extendObservable} from 'mobx';
import {inject, observer, Provider} from 'mobx-react';
import DevTools from 'mobx-react-devtools';
import gql from 'graphql-tag';
import graphql from 'mobx-apollo';
import { ApolloClient, HttpLink, InMemoryCache } from 'apollo-client-preset';
import {Component} from "react";
import {Table, TableHead, TableCell, TableRow} from "react-toolbox/lib/table";
import {Dialog} from "react-toolbox/lib/dialog";
import {Input} from "react-toolbox/lib/input";

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
            id
            name
            description
            taskCount
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

const uri = 'http://localhost:3000/graphql/';

const client = new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache()
});

// building a mobx store
const projectStore = new class {
    constructor() {
        extendObservable(this, {
            get allProjects() {
                return graphql({ client, query: allProjectsQuery });
            },
            get error() {
                return (this.allProjects.error && this.allProjects.error.message) || null;
            },
            get loading() {
                return this.allProjects.loading;
            },
            get projects() {
                return (this.allProjects.data && this.allProjects.data.getProjects) || [];
            },
            get count() {
                return this.projects.length;
            }
        });
    }

    createProject = createProjectInput =>
        client
            .mutate({
                mutation: createProjectMutation,
                variables: { createProjectInput },
                refetchQueries: [{ query: allProjectsQuery }]
            })
            .catch(error => console.error(error.message));
}();

// our main component
const Example = inject('projectStore')(
    observer(
        class extends Component {
            state = {
                active: false,
                name: "",
                description: "",
            };

            handleChange = (name, value) => {
                this.setState({...this.state, [name]: value});
            };

            handleToggle = () => {
                this.setState({active: !this.state.active});
            };

            actions = [
                {label: "Cancel", onClick: this.handleToggle},
                {label: "Save", onClick: () => {
                    this.create();
                    this.handleToggle();
                }}
            ];

            // @ts-ignore
            create = () => this.props.projectStore.createProject({name: this.state.name, description: this.state.description});

            render() {
                // @ts-ignore
                const { error, loading, count, projects } = this.props.projectStore;

                if (error) return <p>{error}</p>;

                if (loading) return <p>Loading ..</p>;

                if (count === 0)
                    return (
                        <div>
                            <button onClick={this.create}>Say Hello</button>
                            <p>No posts :(</p>
                        </div>
                    );

                return (
                    <div>
                        <button onClick={this.handleToggle}>Create new project</button>

                        <Dialog
                            actions={this.actions}
                            active={this.state.active}
                            onEscKeyDown={this.handleToggle}
                            onOverlayClick={this.handleToggle}
                            title='Create new Project'
                        >
                            <Input type='text' label='Name' name='name' value={this.state.name} onChange={this.handleChange.bind(this, 'name')} maxLength={16 } />
                            <Input type='text' multiline label='Description' maxLength={20} value={this.state.description} onChange={this.handleChange.bind(this, 'description')} />
                        </Dialog>

                        <Table>
                            <TableHead>
                                <TableCell>ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Number of Tasks</TableCell>
                            </TableHead>
                            {projects.map((project, idx) => (
                                <TableRow key={idx}>
                                    <TableCell >{project.id}</TableCell>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>{project.description}</TableCell>
                                    <TableCell>{project.taskCount}</TableCell>
                                </TableRow>
                            ))}
                        </Table>
                    </div>
                );
            }
        }
    )
);

const ExampleWithState = () => (
    <Provider {...{ projectStore }}>
        <Example />
    </Provider>
);

export default ExampleWithState;
ReactDOM.render(<ExampleWithState />, document.getElementById('root'));
