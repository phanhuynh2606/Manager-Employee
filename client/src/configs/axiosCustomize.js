// Add a request interceptor
import axios from 'axios';
const instance = axios.create({
  baseURL: 'http://localhost:4000'
});


instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if(response && response.data){
         return response.data;
    }
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if(error.response && error.response.status === 500){
         // Optionally log the error or handle specific 400 scenarios
         console.warn("Server returned status 400 with data:", error.response.data);
         // Return the response data instead of rejecting it
         return Promise.resolve(error.response.data);
    }
    return error.response.data;
  });

export default instance;