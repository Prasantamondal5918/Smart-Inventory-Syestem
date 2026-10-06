import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const RoleRoute = ({ allowedRoles = ['owner'] }) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    toast.error('Access restricted to Shop Owner only');
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
