import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { OPERATOR_STORAGE_KEY } from '../constants';

const AuthGuard = ({ children, requireAdmin }) => {
  const location = useLocation();
  const currentOperator = localStorage.getItem(OPERATOR_STORAGE_KEY);

  if (!currentOperator) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверка прав администратора
  if (requireAdmin && currentOperator !== 'Меньшеков А.В.' && currentOperator !== 'Андреев Н.Н.') {
    return <Navigate to="/" replace />;
  }

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool
};

export default React.memo(AuthGuard);