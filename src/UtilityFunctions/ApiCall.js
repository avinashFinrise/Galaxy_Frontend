import axios from 'axios'
let globalUrl = import.meta.env.VITE_REACT_APP_API_URL;


export const ApiCall = async (url, method) => {
    return new Promise((resolve, reject) => {
        axios({
            method: method,
            url: `${globalUrl}${url}`,
            headers: {
                'Content-Type': 'application/json',
                "Cookie": document.cookie
            },
        }).then(response => resolve(response)).catch(error => reject(error))
    })
}