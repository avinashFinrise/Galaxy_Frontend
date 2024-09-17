import { useEffect, useRef, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { GET_NETPOSITION_API } from "../../API/ApiServices";

const tokens = new Set()
const positions = new Set()


const useGetMtmDataSummary = (callback, gridRef, dep = [], live = true, onReload) => {
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
}, [ws])


    useEffect(() => {
        // if (apiNetPosition.length) {
        //     apiNetPosition.forEach(e => {
        //         ws.connection.send(
        //             JSON.stringify({
        //                 event: "subscribe",
        //                 stream: "ticker",
        //                 token: [e.token],
        //             })
        //         );
        //     })
        // }

        (async () => {
            try {
                const { data } = await GET_NETPOSITION_API({ event: "getnetposition" });
                let NETDATA=data.result
                // console.log({modified});
                setApiNetPosition(NETDATA)
                                    curentnetPositions.current = NETDATA
                                    NETDATA.forEach(e => {
                    positions.add(e.positionno)
                    tokens.add(e.token)
                })
            } catch (error) {
                console.log({ error })
            }
        })()
    }, [ws, onReload])

    useEffect(() => {
        if (!gridRef) return
        if (!ws.status) return;
        let shouldUpdate = true;

        let eventListener;
        const [prevArbMtm] = dep
        eventListener = (e) => {
            let newData = JSON.parse(e.data);
            if (newData.event === "ticker") {
                if (tokens.has(newData.data.token)) {
                    // console.log("we have token");
                    let updatedData = null
                    gridRef.current?.api.forEachNode(({ data }) => {
                        if (!data) return

                        if ([...Object.keys(data.l1.token)].concat([...Object.keys(data.l2.token)]).join(",").includes(newData.data.token)) {
                            // console.log("token matched");
                            const { cfamt, cfqty, multiplier, charges } = data
                            const { ltp } = newData.data.data

                            const currNetMtm = ((cfamt + (cfqty * (ltp) * multiplier))) - charges

                            if (data.l1.token[newData.data.token]) {
                                data.l1.netmtm = (data.l1.netmtm - data.l1.token[newData.data.token]) + currNetMtm
                                data.l1.token[newData.data.token] = currNetMtm
                                data.l1.arbnetmtm = data.l1.basecurrency == "USD" ? (data.l1.netmtm * data.l1.usdrate) : data.l1.netmtm || 0

                            }
                            else if (data.l2.token[newData.data.token]) {
                                data.l2.netmtm = (data.l2.netmtm - data.l2.token[newData.data.token]) + currNetMtm
                                data.l2.token[newData.data.token] = currNetMtm
                                data.l2.arbnetmtm = data.l2.basecurrency == "USD" ? (data.l2.netmtm * data.l2.usdrate) : data.l2.netmtm || 0
                            }
                            updatedData = {
                                ...data,
                                ltp: ltp,
                                grossmtm: (cfamt + (cfqty * (ltp) * multiplier)),
                                netmtm: data.l1.netmtm + data.l2.netmtm,
                                totalArbmtm: data.l1.arbnetmtm + data.l2.arbnetmtm,
                                oldarbmtm: prevArbMtm[data?.customId],
                                arbdiff: prevArbMtm[data?.customId] ? (data.l1.arbnetmtm + data.l2.arbnetmtm) - (prevArbMtm[data?.customId] || 0) : 0

                            }

                            callback({ isUpdate: true, data: updatedData })
                        }
                    })
                    // curentnetPositions.current[updatedIndex] = updatedData

                }
                else {
                    console.warn("we dont have this token")
                    // const updatedData = [newData.data]
                    // setUpdatedItem({ isUpdate: true, data: updatedData })
                }
            }
            if (newData.event === "netposition") {
                let updatedData = null

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
                    // console.log("new poistion");
                    isUpdate = false
                    positions.add(newData.data.positionno)
                } else {
                    // console.log("found old netposition");
                    gridRef.current?.api.forEachNode(({ data }) => {
                        if (!data) return

                        if ([...Object.keys(data.l1.token), ...Object.keys(data.l2.token)].includes(newData.data.token)) {
                            const { cfamt, cfqty, multiplier, charges } = data
                            const { ltp } = newData.data

                            const currNetMtm = ((cfamt + (cfqty * (ltp) * multiplier))) - charges

                            if (data.l1.token[newData.data.token]) {
                                data.l1.netmtm = (data.l1.netmtm - data.l1.token[newData.data.token]) + currNetMtm
                                data.l1.token[newData.data.token] = currNetMtm
                                data.l1.arbnetmtm = data.l1.basecurrency == "USD" ? (data.l1.netmtm * data.l1.usdrate) : data.l1.netmtm || 0
                            }
                            else if (data.l2.token[newData.data.token]) {
                                data.l2.netmtm = (data.l2.netmtm - data.l2.token[newData.data.token]) + currNetMtm
                                data.l2.token[newData.data.token] = currNetMtm
                                data.l2.arbnetmtm = data.l2.basecurrency == "USD" ? (data.l2.netmtm * data.l2.usdrate) : data.l2.netmtm || 0
                            }
                            updatedData = {
                                ...data,
                                ltp: ltp,
                                grossmtm: (cfamt + (cfqty * (ltp) * multiplier)),
                                netmtm: data.l1.netmtm + data.l2.netmtm,
                                totalArbmtm: data.l1.arbnetmtm + data.l2.arbnetmtm,
                                oldarbmtm: prevArbMtm[data?.customId],
                                arbdiff: prevArbMtm[data?.customId] ? (data.l1.arbnetmtm + data.l2.arbnetmtm) - (prevArbMtm[data?.customId] || 0) : 0

                            }
                            callback({ data: updatedData, isUpdate })
                        }
                    })

                }

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
    }, [ws.status, curentnetPositions.current, ...dep, live, onReload]);

    return [apiNetPosition]
}


export default useGetMtmDataSummary