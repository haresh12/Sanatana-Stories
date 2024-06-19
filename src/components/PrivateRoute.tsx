import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  return currentUser ? <>{children}</> : <Navigate to="/" />;
};

export default PrivateRoute;
