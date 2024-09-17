import { useEffect, useRef, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { GET_NETPOSITION_API } from "../../API/ApiServices";

const tokens = new Set()
const positions = new Set()


const useGetMtm = (callback, gridRef, dep = [], live = true) => {
    const ws = useSelector((state) => state?.websocket, shallowEqual);
    const [apiNetPosition, setApiNetPosition] = useState([])
    const curentnetPositions = useRef()


    useEffect(() => {
        if (apiNetPosition.length) {
            apiNetPosition.forEach(e => {
                ws.connection.send(
                    JSON.stringify({
                        event: "subscribe",
                        stream: "ticker",
                        token: [e.token],
                    })
                );
            })
        }

        (async () => {
            try {
                const { data } = await GET_NETPOSITION_API({ event: "getnetposition" });
                setApiNetPosition(data.result)
                curentnetPositions.current = data.result
                data.result.forEach(e => {
                    positions.add(e.positionno)
                    tokens.add(e.token)
                })
            } catch (error) {
                console.log({ error })
            }
        })()
    }, [ws])

    useEffect(() => {
        if (!gridRef) return
        if (!ws.status) return;
        let shouldUpdate = true;
        console.log({ live })

        let eventListener;
        eventListener = (e) => {
            let newData = JSON.parse(e.data);
            if (newData.event === "ticker") {
                if (tokens.has(newData.data.token)) {
                    let updatedData = null
                    gridRef.current.api.forEachNode(({ data }) => {
                        if (!data) return
                        // console.log({ token: data?.token, data })

                        if (data.token === newData.data.token) {
                            const { cfamt, cfqty, multiplier, charges } = data
                            const { ltp } = newData.data.data

                            // updatedIndex = index
                            updatedData = {
                                ...data,
                                ltp: ltp,
                                grossmtm: (cfamt + (cfqty * (ltp) * multiplier)),
                                netmtm: ((cfamt + (cfqty * (ltp) * multiplier))) - charges
                            }

                            // curentnetPositions.current[updatedIndex] = updatedData
                            callback({ isUpdate: true, data: updatedData })
                        }
                    })



                }
                // else {
                //     const updatedData = [newData.data]
                //     setUpdatedItem({ isUpdate: true, data: updatedData })
                // }
            }
            if (newData.event === "netposition") {
                if (!tokens.has(newData.data.token)) {
                    ws.connection.send(
                        JSON.stringify({
                            event: "subscribe",
                            stream: "ticker",
                            token: [newData.data.token],
                        })
                    );
                    tokens.add(newData.data.token);
                }

                let isUpdate = true
                if (!positions.has(newData.data.positionno)) {
                    isUpdate = false
                    positions.add(newData.data.positionno)
                }


                callback({ data: newData.data, isUpdate })

                // netpositionObj[newData.data.positionno] = newData.data;

            }
        };
        if (!live) return ws.connection.removeEventListener("message", eventListener);
        ws.connection.addEventListener("message", eventListener);

        return () => {
            if (eventListener) {
                ws.connection.removeEventListener("message", eventListener);
            }
        };
    }, [ws.status, curentnetPositions.current, ...dep, live]);

    return [apiNetPosition]
}


export default useGetMtm