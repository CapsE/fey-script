import React from 'react';
// eslint-disable-next-line require-jsdoc
export class ErrorBoundary extends React.Component {
    // eslint-disable-next-line require-jsdoc
    constructor(props) {
        super(props);
        this.state = {error: ''};
    }

    // eslint-disable-next-line require-jsdoc
    componentDidCatch(error) {
        this.setState({error: `${error.name}: ${error.message}`});
    }

    // eslint-disable-next-line require-jsdoc
    render() {
        const {error} = this.state;
        if (error) {
            return (
                <div>{error}</div>
            );
        } else {
            return <>{this.props.children}</>;
        }
    }
}
