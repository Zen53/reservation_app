import React from "react";
import Error500 from "../../pages/auth/Error500";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <Error500 error={this.state.error} />;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
