import dayjs from 'dayjs';

const LAST_SESSION_KEY = 'userSession';
let currentSession = null;
 
const saveSessionToStorage = () => {
  if (currentSession) {
    try {
      localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(currentSession)); 
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  }
  return false;
};
 
export const updateCurrentSession = (userId, pagePath, filters) => {
  if (!userId || !pagePath) { 
    return false;
  }
  
  try { 
    const processedFilters = {};
    
    Object.keys(filters || {}).forEach(key => {
      const value = filters[key]; 
      if (Array.isArray(value) && value.some(item => item && typeof item.format === 'function')) {
        processedFilters[key] = value.map(item => 
          item && typeof item.format === 'function' ? item.format('YYYY-MM-DD') : item
        );
      }  
      else if (value && typeof value.format === 'function') {
        processedFilters[key] = value.format('YYYY-MM-DD');
      }  
      else {
        processedFilters[key] = value;
      }
    });
     
    currentSession = {
      userId,
      pagePath,
      filters: processedFilters,
      timestamp: new Date().toISOString()
    };
     
    return saveSessionToStorage();
  } catch (error) {
    console.error('Error processing session data:', error);
    return false;
  }
};
 
export const getLastSession = (pagePath) => {
  try {
    const sessionData = localStorage.getItem(LAST_SESSION_KEY);
    
    if (!sessionData) return null;
    
    const parsedData = JSON.parse(sessionData); 
    if (parsedData.pagePath !== pagePath) {
      return null;
    } 
    if (parsedData.filters) {
      Object.keys(parsedData.filters).forEach(key => {
        const value = parsedData.filters[key]; 
        if (Array.isArray(value) && value.some(item => typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item))) {
          parsedData.filters[key] = value.map(item => 
            typeof item === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item) ? dayjs(item) : item
          );
        }  
        else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
          parsedData.filters[key] = dayjs(value);
        }
      });
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error parsing session data:', error);
    return null;
  }
};
 
export const clearLastSession = () => {
  localStorage.removeItem(LAST_SESSION_KEY);
  currentSession = null;
};
 
if (typeof window !== 'undefined') { 
  window.addEventListener('beforeunload', () => { 
    saveSessionToStorage();
  });
   
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { 
      saveSessionToStorage();
    }
  });
}