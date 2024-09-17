let socket;
let flag=true;
const SocketConnect=(connectionurl)=>{
 socket=new WebSocket(connectionurl)

socket.onopen=()=>{
    console.log("Connection Opened");
}

socket.onmessage=(event)=>{
    console.log(JSON.parse(event.data));
}

socket.onerror=(err)=>{
    console.log(err);
}

socket.onclose=()=>{
    console.log("Connection Terminated");
    if(flag){
        if(socket.readyState==3){
            // socket.OPEN()
            SocketConnect(connectionurl)
        }
    }
}
}

const SocketDisconnect=()=>{
    if(socket.readyState===1){
        flag=false
        socket.close()
    }
}

export default SocketConnect;