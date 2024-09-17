import axios from 'axios';
import { useEffect, useState } from 'react'

function useFetchApi(endpoint) {
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  let config = {
    headers: {
      'content-Type': 'application/json',
      "Cookie": document.cookie
    }
  }


  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${apiUrl}${endpoint}`, config);
        console.log(response);
        setApiData(response);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [endpoint]);

  return { apiData, loading, error };
}

export default useFetchApi;