import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('[ErrorBoundary] Uncaught error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="placeholder-box">
                    <span className="material-icons placeholder-icon" aria-hidden="true">
                        error_outline
                    </span>
                    <h3>Something went wrong</h3>
                    <p>An unexpected error occurred. Please refresh the page.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
