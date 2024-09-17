import { AgGridReact } from "ag-grid-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GET_NETPOSITION_API } from "../../../API/ApiServices";
import useGridSettings from "../../CustomHook/useGridSettings";
import { Notification } from "../../DynamicComp/Notification";
import tableStyle from "./MtmPopupTable.module.scss";

const componentInfo = { componentname: "alert", componenttype: "card" }

const MtmSummary = () => {
  const [mtmSummaryData, setMtmSummaryData] = useState([]);
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

  const gridRef = useRef();

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };

  const fetchApiData = async () => {
    try {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Fetching Mtm Summary Data...",
      }));
      const apicall = await GET_NETPOSITION_API({
        event: "getmtmsummary",
      });
      console.log(apicall);
      if (apicall) setMtmSummaryData(apicall.data.result);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
        };
      });
    } catch (error) {
      console.log(error);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          errorFlag: true,
          errorMsg: "something went wrong",
          headerMsg: error.code,
        };
      });
    }
  }

  useEffect(() => {
    fetchApiData()
    // (async () => {
    //   try {
    //     setNotifyData((data) => ({
    //       ...data,
    //       loadingFlag: true,
    //       loadingMsg: "Fetching Mtm Summary Data...",
    //     }));
    //     const apicall = await GET_NETPOSITION_API({
    //       event: "getmtmsummary",
    //     });
    //     console.log(apicall);
    //     if (apicall) setMtmSummaryData(apicall.data.result);
    //     setNotifyData((prev) => {
    //       return {
    //         ...prev,
    //         loadingFlag: false,
    //       };
    //     });
    //   } catch (error) {
    //     console.log(error);
    //     setNotifyData((prev) => {
    //       return {
    //         ...prev,
    //         loadingFlag: false,
    //         errorFlag: true,
    //         errorMsg: "something went wrong",
    //         headerMsg: error.code,
    //       };
    //     });
    //   }
    // })();
  }, []);

  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true }

    return option
  }, [])

  const { gridProps, onReady } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    onReload: onReady,
    colDef: { generateColDef, row: mtmSummaryData[0] },
    groupBy: ["basecurrency"],
    settings: {
      sideBar: true
    }
  })


  useEffect(() => {
    if (!mtmSummaryData?.length) return
    onReady()
  }, [mtmSummaryData])

  const columnCreation = useMemo(() => {
    let columns = [];
    if (mtmSummaryData.length > 0) {
      for (let key in mtmSummaryData[0]) {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          sortable: true,
          filter: true,
        });
      }
    }
    return columns;
  }, [mtmSummaryData]);
  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      sortable: true,
      flex: 1,
      minWidth: 100,
      width: 100,
      filter: true,
      resizable: true,
    };
  }, []);
  const sideBar = useMemo(() => {
    return {
      toolPanels: ["filters"],
    };
  }, []);

  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      {/* <div className={tableStyle.popupTableHeader}>
        <div>
          <button
            className={`${tableStyle.columnSaveBtn} ${tableStyle.columnSaveBtn1}`}
            // onClick={viewMtmSummery}
          >
            <span className={tableStyle.textBtnContent}>View Mtm Summary</span>
            <span className={tableStyle.btnIcon}>View Mtm Summary</span>
          </button>
        </div>
      </div> */}
      <div style={{ height: "86vh" }}>
        <AgGridReact
          className="ag-theme-alpine"
          ref={gridRef}
          rowData={mtmSummaryData}
          columnDefs={columnCreation}
          defaultColDef={defaultColDef}
          sideBar={sideBar}
          asyncTransactionWaitMillis={500}
          pagination={true}
          paginationPageSize={50}
          groupIncludeFooter={true}
          groupIncludeTotalFooter={true}
        />
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
};

export default MtmSummary;
