import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { updateCurrentSession, getLastSession } from '@/utils/sessionStorage.jsx';

const useLastPageSession = (initialFilters = {}) => {
  const location = useLocation();
  const user = useSelector(state => state?.auth?.user);
  const userId = user?.userId;
  const [sessionFilters, setSessionFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
   
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    } 
    const pagePath = location.pathname;
    const lastSession = getLastSession(pagePath);
    
    if (lastSession && lastSession.userId === userId && lastSession.filters) { 
      setSessionFilters(lastSession.filters);
    } else { 
      setSessionFilters(initialFilters);
    }
    
    setIsLoading(false);
    
    return () => { 
      updateCurrentSession(userId, pagePath, sessionFilters);
    };
  }, [userId, location.pathname]);
   
  useEffect(() => {
    if (!isLoading && userId) { 
      const debounceTimeout = setTimeout(() => {
        updateCurrentSession(userId, location.pathname, sessionFilters);
      }, 500);
      
      return () => clearTimeout(debounceTimeout);
    }
  }, [sessionFilters, userId, location.pathname, isLoading]);
   
  const updateFilter = (key, value) => {
    setSessionFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const updateFilters = (newFilters) => {
    setSessionFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };
  
  const clearFilters = () => {
    setSessionFilters(initialFilters);
  };
  
  const saveSession = () => {
    if (userId) {
      return updateCurrentSession(userId, location.pathname, sessionFilters);
    }
    return false;
  };
  
  return {
    sessionFilters,
    updateFilter,
    updateFilters,
    clearFilters,
    saveSession,
    isLoading
  };
};

export default useLastPageSession;