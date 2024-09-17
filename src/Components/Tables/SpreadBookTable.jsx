import {
  useEffect,
  useRef,
  useState,
} from "react";
import { shallowEqual, useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { formatValue } from "../../UtilityFunctions/grid";
import useGridSettings from "../CustomHook/useGridSettings";
import { Notification } from "../DynamicComp/Notification";

const defaultTotalRow = { groupname: "Total", parity: 0, paritylive: 0, disparity: 0 };
const componentInfo = { componentname: "spreadbook", componenttype: "table" }


const SpreadBookTable = ({ tableData, getSpreadbookData }) => {
  // const [componentSetting, setComponentSetting] = useState({})
  const gridRef = useRef();


  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const accessGroups = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")).accessgroups : [];
  let excludeColumns = ["createddate", "updateddate"];
  const columnState = localStorage.getItem('spreadbookVisibleColumns') ? JSON.parse(localStorage.getItem('spreadbookVisibleColumns')) : []

  useEffect(() => {
    if (!ws.status) return;
    if (accessGroups) {
      ws.connection.send(
        JSON.stringify({ event: "subscribe", stream: "spreadbook", data: accessGroups, })
      );
    }

    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);

      if (newData.event === "spreadbook") {
        if (newData.data) {
          const rowNode = gridRef.current.api.getRowNode(newData.data?.spreadbookno);
          if (rowNode) gridRef.current.api.applyTransactionAsync({ update: [newData.data], });
          else gridRef.current.api.applyTransactionAsync({ add: [newData.data], addIndex: 0, });
        }
      }
    };
    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) ws.connection.removeEventListener("message", eventListener);

      if (accessGroups) {
        ws.connection.send(
          JSON.stringify({ event: "unsubscribe", stream: "spreadbook", data: accessGroups, })
        );
      }
    };
  }, [ws.status]);

  function generateColDef(key) {
    const option = {
      headerName: key.toUpperCase(),
      field: key,
      sortable: true,
      editable: false,
      valueFormatter: (e) => formatValue(e, null, key),
      // hide: columnState?.length > 0 ? columnState.indexOf(key) > -1 ? false : true : false
    }
    if (key == "entrytime") {
      option.sort = "desc"
      console.log({ option })
    }

    return option
  }
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


  const { componentSetting, gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    onReload: getSpreadbookData,
    colDef: { generateColDef, row: tableData[0] },
  })

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
    if (!tableData?.length) return
    onReady()
  }, [tableData])


  const rowStyle = (params) => {
    console.log();
    if (params.data?.qty1 == 0 || params.data?.qty2 == 0 || params.data?.qty3 == 0) {
      let currentTheme = localStorage.getItem("theme")
      return { color: currentTheme == "body" ? "black" : "white" }
    } else {
      if (params.data && params.data.spreadside === "Buy") {
        return { color: "green" };
      } else if (params.data && params.data.spreadside === "Sell") {
        return { color: "red" };
      }
    }

    return null;
  };

  const setTotal = () => {
    if (!gridRef.current) return

    const totalRow = { ...defaultTotalRow }

    gridRef.current?.api?.forEachNodeAfterFilterAndSort(({ data }) => {
      totalRow["disparity"] += data.disparity
      totalRow["parity"] += data.parity
      totalRow["paritylive"] += data.paritylive
    })

    gridRef.current.api.setPinnedBottomRowData([totalRow])
  }

  useEffect(() => {

    if (tableData.length > 0) {
      gridRef.current.api.setFilterModel(componentSetting?.table?.setting?.filters);
    }
  }, [componentSetting, tableData])

  return (
    <div style={{ height: "80vh" }}>
      <AgGridReact
        {...gridProps}
        ref={gridRef}
        rowData={tableData}
        getRowId={p => p.data?.spreadbookno}
        pagination={true}
        paginationPageSize={50}
        getRowStyle={rowStyle}
        onModelUpdated={setTotal}
        pinnedBottomRowData={[defaultTotalRow]}
        onFilterModified={setTotal}
        suppressAggFuncInHeader={true}
      />
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
};

export default SpreadBookTable;
