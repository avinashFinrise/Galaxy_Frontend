import { useState } from "react";

const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    const makeApiCall = async (apiFunction, params) => {
        setLoading(true);

        const ps1 = new Promise((resolve, reject) => {
            resolve(apiFunction(params))
        })

        ps1.then(val => {
            setData(val.data)
            setLoading(false)
        })
            .catch(error => setError(error))

    }

    return { loading, data, error, makeApiCall }
};

export default useApi;