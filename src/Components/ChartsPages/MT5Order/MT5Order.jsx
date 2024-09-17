import React, { useCallback, useEffect, useRef, useState } from 'react'
import { shallowEqual, useSelector } from 'react-redux';
import { GET_MT5ORDER_LOGS } from '../../../API/ApiServices';
import { Notification } from '../../DynamicComp/Notification';
import { AgGridReact } from 'ag-grid-react';
import useGridSettings from '../../CustomHook/useGridSettings';
import { formatValue, redGreenRowBgColor, redGreenRowText } from '../../../UtilityFunctions/grid';

const componentInfo = { componentname: "mt5logs", componenttype: "table" }

const MT5Order = () => {
    const gridRef = useRef();

    const ws = useSelector((state) => state?.websocket, shallowEqual);

    const [apiMt5Logs, setApiMt5Logs] = useState([])
    const [NotifyData, setNotifyData] = useState({
        confirmFlag: false,
        confirmMsg: "confirm msg",
        successFlag: false,
        successMsg: "success msg",
        errorFlag: false,
        errorMsg: "error msg",
        loadingFlag: false,
        loadingMsg: "loading msg",
        activesession: false,
        headerMsg: "error ",
    });
    const CloseConfirm = () => {
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };

    useEffect(() => {
        if (!ws.status) return;
        let eventListener;
        eventListener = (e) => {
            let newData = JSON.parse(e.data);
            // console.log("newData", newData);
            // const lastRow = gridRef.current.api.getModel().rowsToDisplay.slice(-1)[0];
            // const newId = lastRow ? lastRow.data.id + 1 : null;

            // Generate new ID by incrementing the last row's ID
            // const newId = lastRowId + 1;
            // console.log(lastRow)

            if (newData.event === "logs") {
                // console.log("newData", newData);

                const now = new Date();
                const offset = -now.getTimezoneOffset();
                const sign = offset >= 0 ? '+' : '-';
                const pad = (num) => String(num).padStart(2, '0');

                const formattedTime =
                    now.getFullYear() +
                    '-' + pad(now.getMonth() + 1) +
                    '-' + pad(now.getDate()) +
                    'T' + pad(now.getHours()) +
                    ':' + pad(now.getMinutes()) +
                    ':' + pad(now.getSeconds()) +
                    '.' + String(now.getMilliseconds()).padStart(3, '0') +"Z"
                    // sign + pad(Math.floor(Math.abs(offset) / 60)) +
                    // ':' + pad(Math.abs(offset) % 60);
                // console.log(formattedTime)

                gridRef.current.api.applyTransactionAsync({ add: [{  createddate: formattedTime, ...newData.data.data }], })

            }
        };
        ws.connection.addEventListener("message", eventListener);

        ws.connection.send(
            JSON.stringify({
                event: "subscribe",
                stream: "logs",
                data: {}
            })
        );
        return () => {
            if (eventListener) {
                ws.connection.removeEventListener("message", eventListener);
            }
        };
    }, [ws]);
useEffect(() => {
  console.log({apiMt5Logs});
  
}, [apiMt5Logs])


    useEffect(() => {
        (async () => {
            try {
                const apiData = await GET_MT5ORDER_LOGS()
                console.log("api",apiData.data.result);
                
                setApiMt5Logs(apiData.data.result)
                // console.log(apiData)
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                    };
                });
            } catch (error) {
                console.log(error)
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                        errorFlag: true,
                        errorMsg: error.response?.data.result || error,
                        headerMsg: error.code,
                    };
                });
            }

        })();
    }, []);
    function generateColDef(key, rowIndex) {
        // if (!['updateddate', 'createddate'].includes(key)) {

        const option = {
            headerName: key.toUpperCase(),
            field: key,
            sortable: true,
            hide: false,
            filter: true,
            enableValue: true,
            cellStyle: redGreenRowBgColor,
        };
        return option;
        // }
        // if (key == 'event') option['filter'] = true

    }
    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo: componentInfo,
        // onReload: fetchAccountData,
        colDef: { generateColDef, row: apiMt5Logs[0] },
        // groupBy: apiMt5Logs && apiMt5Logs.length ? Object.keys(apiMt5Logs[0]) : [],
        settings: {
            sideBar: true,
        }
    })
    useEffect(() => {
        if (!apiMt5Logs?.length) return
        onReady()
    }, [apiMt5Logs])
    const getRowId = useCallback((params) => {
        return params.data.createddate;
    });
    return (
        <div style={{ height: "100%"}}>
            <div
                style={{ height: "98%" }}
            >
                <AgGridReact
                    className="ag-theme-alpine"
                    {...gridProps}
                    ref={gridRef}
                    getRowId={getRowId}

                    rowData={apiMt5Logs}
                    suppressAggFuncInHeader={true}
                    // onCellValueChanged={onCellValueChanged}
                    rowSelection='multiple'

                // onModelUpdated={setTotal}
                // pinnedBottomRowData={[totalRow]}
                // onFilterModified={setTotal}
                />
            </div>
            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
                CloseConfirm={CloseConfirm}
            />
        </div>
    )
}

export default MT5Order