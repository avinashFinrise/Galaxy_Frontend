import { AgGridReact } from 'ag-grid-react'
import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import useGridSettings from '../../../../CustomHook/useGridSettings';
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { formatValue } from '../../../../../UtilityFunctions/grid';
import CheckBox from '../CheckBox';
import { Notification } from '../../../../DynamicComp/Notification';


const componentInfo = { componentname: 'reversedTabel', componenttype: 'table' }
const groupby = ['symbol', 'groupname']
const extraFields = {
    'groupname': "", "userid": "",

    "noOfBuyClient": "", "buyLimit": "", "buyClientTotalUsed": "", "buyusedPER": "",
    "noOfSellClient": "", "sellLimit": "", "sellClientTotalUsed": "", "sellUsedPER": "",

    "clientLimit": "", "clientCF": "", "clientSide": "", "clientPER": "", "alert": "", "playSound": "", "blink": ""
}

export default function ReversedTabel({ tabelData, updateSetting, updateLimitInput }) {
    const gridRef = useRef()


    const generateColDef = useCallback((key) => {
        // if (excludeColumns.includes(key)) return null
        const option = { valueFormatter: formatValue, aggFunc: "sum", headerName: key.toUpperCase(), field: key, sortable: true, filter: false, editable: false }

        if (["buyLimit", "sellLimit"].includes(key)) {
            option["editable"] = true
            option["aggFunc"] = "sum"
            option["valueGetter"] = ({ data }) => {
                return data.reversed?.[key]
            }
        }

        if (["buyClientTotalUsed", "sellClientTotalUsed"].includes(key)) option["valueGetter"] = ({ data }) => data.cfqty;
        if (["buyClientTotalUsed"].includes(key)) option["valueGetter"] = ({ data }) => data.cfqty > 0 ? data.cfqty : 0
        if (["sellClientTotalUsed"].includes(key)) option["valueGetter"] = ({ data }) => data.cfqty > 0 ? data.cfqty : 0


        if (key == "noOfBuyClient") option["valueGetter"] = ({ data }) => data.cfqty > 0 ? 1 : 0
        if (key == "noOfSellClient") option["valueGetter"] = ({ data }) => data.cfqty < 0 ? 1 : 0

        if (key == "userid") option["aggFunc"] = params => params.values.join(", ")

        if (key == "clientTotalUsed") option["valueGetter"] = ({ data }) => data.netmtm;

        if (key == "playSound" || key == "blink") option["cellRenderer"] = (e) => <CheckBox componenttype="reversed" grid={e} update={updateSetting} />
        if (key == "clientLimit") option["valueGetter"] = ({ data }) => data.marginConf.allowed
        if (key == "clientCF") option["valueGetter"] = ({ data }) => data.cfqty

        if (key == "alert") option["valueGetter"] = ({ data }) => (Math.abs(data.cfqty / data.marginConf.allowed * 100) >= 100) ? 1 : 0

        if (key == "clientPER") {
            option["aggFunc"] = "avg"
            option["valueGetter"] = ({ data }) => Math.abs(data.cfqty / data.marginConf.allowed * 100)
        }

        if (key == "buyusedPER") {
            option["aggFunc"] = "avg"
            option["valueGetter"] = ({ data }) => {
                if (data.cfqty > 0) {
                    return data.cfqty / data.buyLimit * 100
                } else return 0
            }
        }

        if (key == "sellUsedPER") {
            option["aggFunc"] = "avg"
            option["valueGetter"] = ({ data }) => {
                if (data.cfqty < 0) {
                    return data.cfqty / data.sellLimit * 100
                } else return 0
            }
        }

        if (groupby.indexOf(key) > -1) {
            option['rowGroupIndex'] = groupby.indexOf(key)
            option['rowGroup'] = true
            option['hide'] = true
            option['filter'] = true
        }

        if (key == "clientSide") {
            option["valueGetter"] = ({ data }) => data.cfqty > 0 ? "BUY" : "SELL"
            option["aggFunc"] = params => {
                let buy = 0;
                let sell = 0
                params.values.forEach(value => {
                    value == "BUY" ? buy += 1 : sell += 1
                });

                return buy > sell ? "BUY" : "SELL";
            }
        }

        return option
    }, [])
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
    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo,
        colDef: { generateColDef, row: extraFields, },
        settings: {
            sideBar: true
        }

    })
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
                ref={gridRef}
                onCellEditingStopped={e => updateLimitInput("reversed", e.colDef.field, e.newValue, e.node.id)}
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

