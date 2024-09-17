import { useState } from 'react';
import axios from 'axios';
const usePostApi = () => {

  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(false);
  let apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const sendPostRequest = async (url, requestData, config = { withCredentials: true }) => {
    let response;
    setLoading(true);

    try {
      console.log(`${apiUrl}${url}`);
      response = await axios.post(`${apiUrl}${url}`, requestData, config);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
    return response;
  };

  return { isLoading, sendPostRequest };
};

export default usePostApi;