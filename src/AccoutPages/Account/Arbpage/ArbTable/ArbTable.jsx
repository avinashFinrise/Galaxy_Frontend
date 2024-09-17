import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import useGridSettings from '../../../../Components/CustomHook/useGridSettings';
import { Notification } from '../../../../Components/DynamicComp/Notification';
import { GET_ARB_API } from '../../../../API/ApiServices';

const ArbTable = ({ data }) => {
    const gridRef = useRef();
    const [totaldata, setTotaldata] = useState([])
    const [apiArbdata, setApiArbdata] = useState([]);
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

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };
    const fetchArbAccountData = async (event) => {
        try {
            setNotifyData({
                loadingFlag: true,
                loadingMsg: `Fetching ${data.api} Data...`,
            });
            setApiArbdata([])
            const apiData = await GET_ARB_API({ event: data.api })
            setApiArbdata(apiData.data.result)

            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                };
            });
        } catch (error) {
            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    errorFlag: true,
                    errorMsg: error.response?.data.result,
                    headerMsg: error.code,
                };
            });
        }
    }


    useEffect(() => {
        fetchArbAccountData(data.api)
        if (gridRef.current?.api) {
            gridRef.current.columnApi?.setRowGroupColumns([]);
            gridRef.current.columnApi.columnModel.pivotMode = false;
        }
    }, [data, gridRef.current]);
    // useEffect(() => {
    //     fetchArbAccountData()
    // }, [data])
    const componentInfo = useMemo(() => ({ componentname: `arb_${data.api}`, componenttype: "table" }), [data])

    function generateColDef(key) {
        const option = {
            headerName: key.toUpperCase(), field: key, sortable: true, hide: false, filter: true, enableValue: true
        }
        return option
    }

    const { componentSetting: filterSetting, gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo: componentInfo,
        onReload: fetchArbAccountData,
        colDef: {
            generateColDef,
            row: apiArbdata[0]
        },
        groupBy: apiArbdata && apiArbdata.length ? Object.keys(apiArbdata[0]) : [],
        settings: {
            sideBar: true,
        }
    })
    useEffect(() => {
        if (!apiArbdata?.length) return
        onReady()
    }, [apiArbdata])

    const getRowId = useCallback((params) => {
        return params.data.id;
    });
    // const setTotal = () => {
    //     if (!gridRef.current) return;

    //     const totalRow = { ...data.toTotal };

    //     apiArbdata.forEach((rowData) => {
    //         Object.keys(data.toTotal).forEach(key => {
    //             if (!isNaN(data.toTotal[key])) {
    //                 totalRow[key] += rowData[key] || 0;
    //             }
    //         })
    //     });
    //     gridRef.current.api.setPinnedBottomRowData([totalRow]);
    // };

    const setTotal = () => {
        if (!gridRef.current) return;

        const totalRow = { ...data.toTotal };
        gridRef.current.api.forEachNodeAfterFilter((node) => {
            if (node.data) {
                Object.keys(data.toTotal).forEach(key => {
                    if (!isNaN(data.toTotal[key])) {
                        totalRow[key] += node?.data[key] || 0;
                    }
                });
            }
        });
        Object.keys(totalRow).forEach(key => {
            if (!isNaN(totalRow[key])) {
                totalRow[key] = parseFloat(totalRow[key].toFixed(4));
            }
        });
        setTotaldata(totalRow);
    };


    return (
        <>
            <div
                style={{ height: "80vh", marginTop: "1rem" }}
            >
                <AgGridReact
                    className="ag-theme-alpine"
                    {...gridProps}
                    ref={gridRef}
                    getRowId={getRowId}
                    rowData={apiArbdata}
                    suppressAggFuncInHeader={true}
                    // pagination={true}
                    // paginationPageSize={50}
                    onModelUpdated={setTotal}
                    pinnedBottomRowData={[totaldata]}
                    onFilterModified={setTotal}

                    pivotMode={true}
                    removePivotHeaderRowWhenSingleValueColumn={true}


                />
            </div>
            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
            />
        </>
    )
}

export default ArbTable

