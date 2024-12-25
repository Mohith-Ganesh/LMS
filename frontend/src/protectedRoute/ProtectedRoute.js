import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, ...rest }) => {
    // Assume authentication is stored in localStorage/sessionStorage (this is an example, adapt as needed)
    const isAuthenticated = !!localStorage.getItem('token'); // or use sessionStorage

    return isAuthenticated ? (
        <Component {...rest} />
    ) : (
        <Navigate to="/signin" replace />   // Redirect to the sign-in page if not authenticated
    );
};

export default ProtectedRoute;