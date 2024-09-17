import { useDispatch, useSelector } from 'react-redux';
import { SocketConnectAction, SocketDisconnectAction } from '../../Redux/RMSAction';
const useSocketConnect = () => {
    let newsocket;
    let reconnectFlag = true;
    const socket_URL = import.meta.env.VITE_REACT_APP_SOCKET_URL
    const ws = useSelector(state => state?.websocket)
    const dispatch = useDispatch()

    const socketConnect = () => {
        if (ws.status) return
        newsocket = new WebSocket(socket_URL)

        newsocket.onopen = () => {
            console.log("Connection Established to Socket Server");
            dispatch(SocketConnectAction({ status: true, connection: newsocket }))


        }

        newsocket.onerror = (err) => {
            console.log("Error in Socket", err);
        }


        newsocket.onclose = () => {
            console.log("Connection Closed", ws.status);
            console.log(newsocket.readyState);
            dispatch(SocketConnectAction({ status: false, connection: newsocket }))

            if (JSON.parse(localStorage.getItem('data'))) {
                console.log(JSON.parse(localStorage.getItem('data')));
                setTimeout(() => {
                    console.log("Reconnecting to Socket Server");
                    socketConnect()
                }, 2000)

            }
        }
    }

    const SocketDisconnect = () => {
        console.log('Disconnection called');
        if (ws.status) {
            reconnectFlag = false
            newsocket.close()
            dispatch(SocketDisconnectAction())
        }
    }

    return { socketConnect, SocketDisconnect }


}

export default useSocketConnect;