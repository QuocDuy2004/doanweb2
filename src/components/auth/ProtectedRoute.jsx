import { Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { axiosInstance } from '../../api';

const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/users/profile');
        const userRole = response.data.role;
        if (userRole && userRole !== 'ROLE_CUSTOMER') {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      setIsAuthorized(false);
    } else {
      checkAuth();
    }
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthorized) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;