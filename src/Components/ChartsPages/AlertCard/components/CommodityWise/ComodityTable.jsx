import { AgGridReact } from 'ag-grid-react'
import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import useGridSettings from '../../../../CustomHook/useGridSettings';
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { formatValue } from '../../../../../UtilityFunctions/grid';
import CheckBox from '../CheckBox';
import { Notification } from '../../../../DynamicComp/Notification';


const componentInfo = { componentname: 'commodityTable', componenttype: 'table' }
const groupby = ['symbol', 'groupname']

export default function ComodityTable({ tabelData, updateSetting, updateLimitInput }) {
    const gridRef = useRef()


    const extraFields = { "symbol": "", 'groupname': "", 'userid': "", "clientlimit": "", "netmtm": "", "warning": "", "playSound": "", "blink": "", }
    const generateColDef = useCallback((key) => {
        // if (excludeColumns.includes(key)) return null
        const option = { valueFormatter: formatValue, aggFunc: "sum", headerName: key.toUpperCase(), field: key, sortable: true, filter: false, editable: false }

        if (key == "playSound" || key == "blink") {
            option["cellRenderer"] = (e) => <CheckBox componenttype="commodity" grid={e} update={updateSetting} />
        }

        if (key == "userid") option["aggFunc"] = params => params.values.join(", ")

        if (key == "clientlimit") {
            option["editable"] = true
            option["valueGetter"] = ({ data }) => data.commodity?.["clientlimit"] || 0
        }


        if (key == "warning") {
            option['filter'] = true
            option["showRowGroup"] = false
            option["valueGetter"] = ({ data }) => {
                return data.clientlimit < data.netmtm ? 1 : 0;
            }
        }


        if (groupby.indexOf(key) > -1) {
            option['rowGroupIndex'] = groupby.indexOf(key)
            option['rowGroup'] = true
            option['hide'] = true
            option['filter'] = true
        }

        return option
    }, [])

    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo,
        // onReload: onGridReady,
        colDef: { generateColDef, row: extraFields, },
        // groupBy: [ "userid", "groupname", "clustername"],
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

    const autoGroupColumnDef = useMemo(() => {
        return {
            minWidth: 300,
            pinned: "left",
        };
    }, []);


    useEffect(() => {
        if (!tabelData?.length) return
        onReady()
    }, [tabelData])

    return (
        <div className="container-fluid"
            style={{ height: "90vh", marginTop: "1rem" }}>

            <AgGridReact
                {...gridProps}
                onCellEditingStopped={e => updateLimitInput("commodity", e.colDef.field, e.newValue, e.node.id)}
                ref={gridRef}
                getRowId={p => p.data.positionno}
                rowData={tabelData}
                autoGroupColumnDef={autoGroupColumnDef}
                suppressAggFuncInHeader={true}
                animateRows={false}
            />

            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
            />
        </div>
    )
}

