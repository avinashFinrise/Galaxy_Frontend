import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-alpine.css";
import { useSelector } from "react-redux";
import useApi from "../CustomHook/useApi";
import { GET_NETPOSITION_API } from "../../API/ApiServices";

function Aggrid() {
  const gridRef = useRef("");
  const [rowData, setRowData] = useState([]);

  const ws = useSelector((state) => state?.websocket);
  const { data, loading, error, makeApiCall } = useApi();
  let excludeColumns = [
    "id",
    "positionno",
    "sender",
    "userid_id",
    "ctclid",
    "accountcode",
    // "segment",
    "segment_id",
    "exchange_id",
    "securitytype",
    "securitytype_idmembercode",
    "multiplier",
    "divider",
    "token",
    "membercode",
    "securitytype_id",
    // "opttype",
    // "strikeprice",
    "date",
    "charges",
    "group_master_id",
    "ltp",
    "user_config_id",
    "group_config_id",
    "configname",
    "expirybuybrokrate",
    "expirysellbrokrate",
    "broktype",
    "brokersharingrate",
    "clientsharingrate",
    "comsharingrate",
    "usdcost",
    "isusdlive",
    "usdrate",
    "cluster_id",
    "group_id",
    "clustername",
    "createddate",
    "updateddate",
    "configName",
    "cluster",
    "group_config",
    "user_config",
    "group",
    "user",
    "buybrokrate",
    "sellbrokrate",
    "basecurrency",
    // "exchange",
    "bfrate",
    "cfrate",
    "netrate",
    "buyrate",
    "sellrate",
  ];
  let defaultGroupingBySymbol = ["symbol", "expirydate", "groupname", "userid"];
  let defaultGroupingByGroup = [
    "groupname",
    "userid",
    "exchange",
    "symbol",
    "expirydate",
    "opttype",
    "strikeprice",
  ];

  useEffect(() => {
    makeApiCall(GET_NETPOSITION_API, {
      viewtype: "table",
      exchange: "all",
    });
  }, []);

  useEffect(() => {
    if (data?.httpstatus === 200 && !loading) {
      Array.isArray(data.result) && setRowData(data.result);
    }
  }, [data]);

  useEffect(() => {
    if (!ws.status) return;

    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "netposition") {
        // if (rowData.length == 0) {
        //   setRowData((previous) => previous.push(newData.data));
        // }
        const rowNode = gridRef.current.api.getRowNode(
          newData.data.positionno
        )?.id;
        if (rowNode) {
          gridRef.current.api.applyTransactionAsync({
            update: [newData.data],
          });
        } else {
          gridRef.current.api.applyTransactionAsync({
            add: [newData.data],
          });
        }
      }
    };
    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  const numberformatter = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  let myValueFormatter = (p) => numberformatter.format(p.value);

  const columnCreation = useMemo(() => {
    let columns = [];
    if (rowData) {
      for (let key in rowData[0]) {
        if (!excludeColumns.includes(key)) {
          if (defaultGroupingByGroup.indexOf(key) > -1) {
            columns.push({
              field: key,
              rowGroup: true,
              hide: true,
              pinned: "left",
              filter: true,
              rowGroupIndex: defaultGroupingByGroup.indexOf(key),
            });
          } else if (key.includes("mtm")) {
            columns.push({
              headerName: key.toUpperCase(),
              field: key,
              sortable: true,
              filter: false,
              valueFormatter: myValueFormatter,
              aggFunc: "sum",
            });
          } else if (key.includes("qty")) {
            columns.push({
              headerName: key.toUpperCase(),
              field: key,
              sortable: true,
              filter: false,
              aggFunc: "sum",
            });
          } else if (key.includes("amt")) {
            columns.push({
              headerName: key.toUpperCase(),
              field: key,
              sortable: true,
              filter: false,
              aggFunc: "sum",
            });
          } else if (["segment"].indexOf(key) > -1) {
            columns.push({
              headerName: key.toUpperCase(),
              field: key,
              sortable: true,
              filter: true,
              hide: true,
            });
          } else {
            columns.push({
              headerName: key.toUpperCase(),
              field: key,
              sortable: true,
              // filter: false,
            });
          }
        }
      }
    }
    return columns;
  }, [rowData]);

  const getRowId = useCallback((params) => {
    return params.data.positionno;
  });

  const autoGroupColumnDef = useMemo(() => {
    return {
      minWidth: 300,
      pinned: "left",
    };
  }, []);

  // useEffect(() => {
  // }, [positionNumbers]);
  console.log("rowData", rowData);

  return (
    <>
      <AgGridReact
        className="ag-theme-alpine"
        getRowId={getRowId}
        ref={gridRef}
        columnDefs={columnCreation}
        rowData={rowData}
        asyncTransactionWaitMillis={500}
        pagination={true}
        paginationPageSize={50}
        animateRows={false}
        rowSelection={"multiple"}
        autoGroupColumnDef={autoGroupColumnDef}
        groupIncludeTotalFooter={true}
        // maintainColumnOrder={true}
        groupDisplayType={"singleColumn"}
        sideBar={{ toolPanels: ["filters"] }}
        // showOpenedGroup={true}
      />
    </>
  );
}

export default Aggrid;
