import { AgGridReact } from 'ag-grid-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { formatValue, redGreenRowText } from '../../UtilityFunctions/grid';
import useGridSettings from '../CustomHook/useGridSettings';
import { Notification } from '../DynamicComp/Notification';

const pinnedRowBody = {};

function SymbolTable({ heading, data, total }) {
    const [pinnedRowBody, setPinnedRowBody] = useState({ "userid": "Total", margin: 0, allowed: 0, remaining: 0 })

    const componentInfoRef = useRef({ componentname: `${heading}symbolLimit`, componenttype: 'table' })

    const rowClassRules = useMemo(() => {
        return {
            'redRow': (params) => params.data?.remaining < 0,
            'greenRow': (params) => params.data?.remaining > 0,
        };
    }, []);



    const gridRef = useRef()

    const generateColDef = useCallback((key) => {
        const option = { headerName: key.toUpperCase(), field: key, sortable: true, filter: false, editable: false, valueFormatter: formatValue, cellStyle: redGreenRowText }

        if (['userid', 'symbol'].indexOf(key) > -1) option['filter'] = true
        return option
    }, [])

    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo: componentInfoRef.current,
        // onReload: onGridReady,
        colDef: { generateColDef, row: data[0] },
        // groupBy: ["basecurrency"],
        settings: {
            sideBar: true
        }
    })
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
    useEffect(() => {
        setNotifyData(GridNotifyData)
    }, [GridNotifyData])

    const calcTotal = () => {
        let sum = { margin: 0, allowed: 0, remaining: 0 }
        gridRef.current?.api?.forEachNodeAfterFilterAndSort(({ data }) => {
            sum['margin'] += data.margin
            sum['allowed'] += data.allowed
            sum['remaining'] += data.remaining
        })
        setPinnedRowBody(previous => ({ ...previous, ...sum }))
    }

    useEffect(() => {
        if (!data?.length) return
        onReady()
    }, [data])





    // const getRowId = useCallback((params) => {
    //     return params.data.uniqueKey;
    // });





    const columnCreation = useMemo(() => {
        let columns = [];

        for (let key in data[0]) {
            columns.push({
                field: key,
                headerName: key.toUpperCase(),
                filter: false,
                sortable: true,
                valueFormatter: formatValue,
                cellStyle: redGreenRowText,

            })
        }
        return columns;
    }, [data])

    return (
        <>
            <div style={{ height: "80vh" }}>
                <p style={{ fontWeight: "bold", textTransform: "capitalize" }}>{heading}</p>
                <AgGridReact
                    {...gridProps}
                    // className="ag-theme-alpine"
                    ref={gridRef}
                    // getRowId={getRowId}
                    rowData={data}
                    // columnDefs={columnCreation}
                    // asyncTransactionWaitMillis={500}
                    // pagination={true}
                    // paginationPageSize={50}
                    animateRows={false}
                    rowSelection={"multiple"}
                    // groupIncludeTotalFooter={true}
                    suppressAggFuncInHeader={true}
                    // defaultColDef={defaultColDef}
                    rowClassRules={rowClassRules}
                    // onModelUpdated={setTotal}
                    pinnedBottomRowData={total ? [pinnedRowBody] : false}
                    onModelUpdated={calcTotal}
                // sideBar={sideBar}
                />
            </div>
            <div>
                <Notification
                    notify={NotifyData}
                    CloseError={CloseError}
                    CloseSuccess={CloseSuccess}
                />
            </div>

        </>
    )
}

export default React.memo(SymbolTable)