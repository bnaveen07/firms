import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { logout, fetchMe } from '../features/auth/authSlice';

const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, loading, error, initialized } = useSelector((state) => state.auth);

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const refreshUser = useCallback(() => {
    if (token) dispatch(fetchMe());
  }, [dispatch, token]);

  return {
    user,
    token,
    loading,
    error,
    initialized,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
    isInspector: user?.role === 'inspector',
    isApplicant: user?.role === 'applicant',
    logout: handleLogout,
    refreshUser,
  };
};

export default useAuth;
