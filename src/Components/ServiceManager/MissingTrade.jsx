import { AgGridReact } from "ag-grid-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TbReload } from "react-icons/tb";
import { GET_SERVICEMANAGER_API, POST_RESTARTSERVICE_API } from "../../API/ApiServices";
import { Notification } from "../DynamicComp/Notification";
import serStyle from "./ServiceManager.module.scss";


const MissingTrade = () => {
  const gridRef = useRef();
  const [missingTradeApi, setMissingTradeApi] = useState([]);
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
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };
  const missingTradeData = () => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching missing trades...",
    }));
    const apiCall = new Promise((resolve, reject) => {
      resolve(
        GET_SERVICEMANAGER_API({
          event: "checkmissingtrade",
        })
      );
    });
    apiCall
      .then((res) => {
        // console.log("res*****************", res);
        // console.log("ressetrespt", res.data.result);
        setMissingTradeApi(res.data.result);
        setNotifyData({
          loadingFlag: false,
        });
      })
      .catch((err) => {
        console.log(err);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            // confirmFlag: false,
            errorFlag: true,
            errorMsg: err.response?.data.reason,
            headerMsg: err.code,
          };
        });
      });
  }
  useEffect(() => {
    missingTradeData()
  }, []);
  const handleReloadMissingTrade = async (e) => {
    e.preventDefault();
    missingTradeData()
  }

  const handleRestartMissingTrade = async (e) => {
    e.preventDefault();
    setNotifyData((prev) => ({
      ...prev,
      loadingFlag: true,
      loadingMsg: "Please Wait Restarting missing trades...",
    }));
    const restartData = new Promise((resolve, reject) => {
      resolve(POST_RESTARTSERVICE_API({ event: "restart_tradetransfer_services" }));
    });
    restartData
      .then((res) => {
        // console.log(res);
        setNotifyData({
          loadingFlag: false,
          successFlag: true,
          // confirmFlag: false,
          successMsg: res.data.result
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const defaultColDef = useMemo(() => {
    return {
      editable: false,
      sortable: true,
      flex: 1,
      minWidth: 100,
      width: 100,
      // filter: true,
      resizable: true,
      floatingFilter: false
    };
  }, []);
  const sideBar = useMemo(() => {
    return {
      toolPanels: ["filters"],
    };
  }, []);
  const getRowId = useCallback((params) => {
    // console.log("params.data", params.data);
    return params.data.tradesender;
  });

  const columnCreation = useMemo(() => {
    let columns = [];
    for (let key in missingTradeApi[0]) {
      columns.push({
        field: key,
        headerName: key.toUpperCase(),
        sortable: true,
        // filter: true,
      });
    }
    return columns;
  }, [missingTradeApi]);

  const rowStyle = (params) => {
    if (params.data && params.data.missingtrade != 0) {
      return { color: "red" };
    } else if (params.data && params.data.missingtrade === 0) {
      return { color: "green" };
    }
    return null;
  };



  // console.log("missingTradeApi", missingTradeApi);
  return (
    <div style={{ height: '100%' }}>
      <div className={serStyle.BtnSection}>
        <button
          onClick={handleReloadMissingTrade}
          className={serStyle.reloadBtn}>
          <span><TbReload /></span>
          Reload
        </button>
        <button
          // onClick={handleRestartMissingTrade}
          onClick={(e) => {
            setNotifyData((data) => ({
              ...data,
              confirmFlag: true,
              confirmMsg: "Are you sure, You want to restart missing trade?",
              confirmAction: (e) =>
                handleRestartMissingTrade(e)
            }))
          }}
        >
          <span><TbReload /></span>
          Restart
        </button>

      </div>
      <div style={{ height: "100%" }}>
        {missingTradeApi && (
          <AgGridReact
            gridOptions={{ headerHeight: 30, }}
            className="ag-theme-alpine"
            ref={gridRef}
            rowData={missingTradeApi}
            columnDefs={columnCreation}
            defaultColDef={defaultColDef}
            // sideBar={sideBar}
            getRowId={getRowId}
            getRowStyle={rowStyle}
          />
        )}
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
    </div>
  );
};

export default MissingTrade;
