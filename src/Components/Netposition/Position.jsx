import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import daysjs from "dayjs";
import cunstomParseFormate from "dayjs/plugin/customParseFormat";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { shallowEqual, useSelector } from "react-redux";
import { GET_TOKENS_API, } from "../../API/ApiServices";
import { formatValue } from "../../UtilityFunctions/grid";
import useGetMtm from "../CustomHook/useGetMtm";
import useGridSettings from "../CustomHook/useGridSettings";
import { Notification } from "../DynamicComp/Notification";
let tokens = new Set();
daysjs.extend(cunstomParseFormate)

const componentInfo = { componentname: "position", componenttype: "table" }
const pinnedRowBody = { date: "Total", netmtm: 0, grossmtm: 0, bfqty: 0, bfamt: 0, buyqty: 0, buyamt: 0, sellqty: 0, sellamt: 0, netqty: 0, netamt: 0, cfqty: 0, cfamt: 0, charges: 0, };




const calcTotalWorker = new Worker('/workers/getTotal.js');

function getTotal(gridApi, colDef) {
  if (!colDef) return
  const gridRows = [];

  gridApi.current?.api?.forEachNodeAfterFilterAndSort((n) => gridRows.push(n.data));
  calcTotalWorker.postMessage({ gridRows })
}

const accessGroups = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")).accessgroups : [];

function Position() {
  const gridRef = useRef();

  // const positionData = useSelector((state) => state.Netposition, shallowEqual);
  // const [componentSetting, setComponentSetting] = useState({})
  // const [positionData, setPositionData] = useState([]);
  const [tokensList, setTokensList] = useState([]);
  const ws = useSelector((state) => state?.websocket, shallowEqual);

  const setTotal = (columns) => getTotal(gridRef, columns)

  calcTotalWorker.onmessage = ({ data }) => {
    gridRef.current.api.setPinnedBottomRowData([data]);
  }


  const update = useCallback((newData) => {

    if (newData.isUpdate) gridRef.current.api.applyTransactionAsync({ update: [newData.data] });
    else gridRef.current.api.applyTransactionAsync({ add: [newData.data], });
  }, [gridRef])

  const [positionData] = useGetMtm(update, gridRef)


  // console.log({ positionData });


  // let excludeColumns = [
  //   "createddate",
  //   "updateddate",
  //   "date",
  //   "arbmtm",
  //   "positionno",
  //   "ex_buyqty",
  //   "ex_buyamt",
  //   "ex_sellqty",
  //   "ex_sellamt",
  //   "ex_charges",
  //   "multiplier",
  //   "userid_id", "segment", "ctclid", "membercode", "accountcode", "exchange_id", "group_id", "configname", "cluster_id", "isusdlive"
  // ];




  useEffect(() => {
    if (!ws.status) return;
    if (tokensList.length < 1) return;

    ws.connection.send(
      JSON.stringify({ event: "subscribe", stream: "ticker", token: tokensList, })
    );

    return () => {
      if (ws.status) {
        ws.connection.send(
          JSON.stringify({ event: "unsubscribe", stream: "ticker", token: tokensList, })
        );
      }
    };
  }, [ws, tokensList]);



  const onGridReady = useCallback(async () => {

    setNotifyData((prev) => ({
      ...prev,
      loadingFlag: true,
      loadingMsg: "loading...",
    }));

    try {
      const { data } = await GET_TOKENS_API({ event: "getalltoken", data: {}, })

      setNotifyData((prev) => ({ ...prev, loadingFlag: false, }));
      setTokensList(data.result);
      data.result.map((val) => tokens.add(val));
    } catch (error) {
      setNotifyData((prev) => ({ ...prev, loadingFlag: false, errorFlag: true, errorMsg: error?.response, }));
    }
  }, []);

  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, editable: false, filter: true }
    if (key.indexOf("rate") > -1) option["valueFormatter"] = (e) => e.value?.toFixed(2)
    if (key.indexOf("mtm") > -1 || key.indexOf("qty") > -1 || key.indexOf("charges") > -1 || key.indexOf("amt") > -1) {
      option["valueFormatter"] = formatValue
    }
    if (key == "expirydate") {
      option["cellStyle"] = (p) => {
        return `${p.value}`.toLowerCase() == daysjs().format('DDMMMYYYY').toLowerCase() ? { color: 'red' } : {}
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

  const { gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    onReload: onGridReady,
    colDef: { generateColDef, row: positionData[0] },
    groupBy: ["user", "basecurrency", "symbol", "expirydate", "sender", "userid", "exchange", "securitytype", "opttype", "groupname", "clustername", "strikeprice"],
    settings: {
      sideBar: true
    }
  })
  // console.log(gridProps, onReady)
  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };

  useEffect(() => {
    setNotifyData(GridNotifyData)
  }, [GridNotifyData])

  useEffect(() => {
    if (!positionData?.length) return
    onReady()
  }, [positionData])

  useEffect(() => {
    // console.log({ status: ws.status })
    if (!ws.status) return

    ws.connection.send(
      JSON.stringify({
        event: "subscribe",
        stream: "netposition",
        access_id: accessGroups?.access_id,
      })
    )
    return () => {
      if (!ws.status) return
      JSON.stringify({ event: "unsubscribe", stream: "netposition", access_id: accessGroups?.access_id, })
    }
  }, [ws.status])
  return (
    <div>
      <div
        className="container-fluid"
        style={{ height: "90vh", marginTop: "1rem" }}
      >
        <AgGridReact
          // onColumnMoved={(e) => onColumnMoved(e, componentSetting)}
          {...gridProps}
          ref={gridRef}
          rowData={positionData}
          onGridReady={onGridReady}
          // columnDefs={columnCreation}
          getRowId={p => p.data.positionno}
          pagination={true}
          onModelUpdated={setTotal}
          pinnedBottomRowData={[pinnedRowBody]}
          filterParams={{ apply: true, newRowsAction: 'keep' }}
          suppressAggFuncInHeader={true}

        />
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
}

export default React.memo(Position);
