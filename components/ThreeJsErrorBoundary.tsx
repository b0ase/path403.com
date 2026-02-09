'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ThreeJsErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details for debugging
        console.error('Three.js Error Boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render custom fallback UI or default
            return this.props.fallback || (
                <div className="w-full h-full bg-transparent flex items-center justify-center">
                    <div className="text-gray-500 text-xs font-mono">
                        {/* Silent fallback - no error message shown to user */}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
