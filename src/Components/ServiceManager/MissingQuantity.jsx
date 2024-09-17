import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GET_SERVICEMANAGER_API, POST_RESTARTSERVICE_API } from "../../API/ApiServices";
import { Notification } from "../DynamicComp/Notification";
import { AgGridReact } from "ag-grid-react";
import { TbReload } from "react-icons/tb";
import serStyle from "./ServiceManager.module.scss";
import useGridSettings from "../CustomHook/useGridSettings";
const componentInfo = { componentname: "missingQuantityService", componenttype: 'table' }

const MissingQuantity = () => {
  const gridRef = useRef();
  const [missingQuantityApi, setMissingQuantityApi] = useState([]);
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

  const missingQuantityData = () => {
    setNotifyData((prev) => ({
      ...prev,
      loadingFlag: true,
      loadingMsg: "Fetching missing Quantity data ...",
    }));
    const restartData = new Promise((resolve, reject) => {
      resolve(GET_SERVICEMANAGER_API({ event: "checkquantity" }));
    });
    restartData
      .then((res) => {
        // console.log(res);
        setMissingQuantityApi(res.data.result);
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
            errorFlag: true,
            errorMsg: err.response?.data.reason,
            headerMsg: err.code,
          };
        });
      });
  }

  useEffect(() => {
    missingQuantityData()
  }, []);

  const handleReloadQuantity = async (e) => {
    e.preventDefault();
    missingQuantityData()
  }
  const handleRestartMissingQuantity = async (e) => {
    e.preventDefault();
    setNotifyData((prev) => ({
      ...prev,
      loadingFlag: true,
      loadingMsg: "Please Wait Restarting Quantity data...",
    }));
    const restartData = new Promise((resolve, reject) => {
      resolve(POST_RESTARTSERVICE_API({ event: "restart_netposition_services" }));
    });
    restartData
      .then((res) => {
        // console.log(res);
        setNotifyData({
          loadingFlag: false,
          successFlag: true,
          confirmFlag: false,
          successMsg: res.data.result
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // const defaultColDef = useMemo(() => {
  //   return {
  //     editable: true,
  //     sortable: true,
  //     flex: 1,
  //     minWidth: 100,
  //     width: 100,
  //     filter: true,
  //     resizable: true,
  //   };
  // }, []);
  // const sideBar = useMemo(() => {
  //   return {
  //     toolPanels: ["filters"],
  //   };
  // }, []);
  const getRowId = useCallback((params) => {
    // console.log(params.data.sender)
    return params.data.sender;
  });

  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, filter: false, editable: false }

    if (key == "sender") option['filter'] = true
    return option
  }, [])

  const { gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    onReload: missingQuantityData,
    colDef: { generateColDef, row: missingQuantityApi[0] },
    groupBy: [],
    settings: {
      sideBar: true
    }
  })

  useEffect(() => {
    setNotifyData(GridNotifyData)
  }, [GridNotifyData])

  useEffect(() => {
    if (!missingQuantityApi?.length) return
    onReady()
  }, [missingQuantityApi])

  const columnCreation = useMemo(() => {
    let columns = [];
    for (let key in missingQuantityApi[0]) {
      columns.push({
        field: key,
        headerName: key.toUpperCase(),
        sortable: true,
        filter: true,
      });
    }
    return columns;
  }, [missingQuantityApi]);

  const rowStyle = (params) => {
    // console.log("params**********", params)
    if (params.data && params.data.diff_buyqty != 0 || params.data.diff_sellqty != 0) {
      return { color: "red" };
    } else if (params.data && params.data.diff_buyqty === 0 || params.data.diff_sellqty === 0) {
      return { color: "green" };
    }
    return null;
  };

  // console.log("missingQuantityApi", missingQuantityApi);
  return (
    <div style={{ height: '100%' }}>
      <div className={serStyle.BtnSection}>
        <button
          onClick={handleReloadQuantity} className={serStyle.reloadBtn}
        >
          <span><TbReload /></span>
          Reload
        </button>
        <button
          // onClick={handleRestartMissingQuantity}
          onClick={(e) => {
            setNotifyData((data) => ({
              ...data,
              confirmFlag: true,
              confirmMsg: "Are you sure, You want to restart missing quantity?",
              confirmAction: (e) =>
                handleRestartMissingQuantity(e)
            }))
          }}
        >
          <span><TbReload /></span>
          Restart
        </button>
      </div>
      <div style={{ height: "100%" }}>
        {missingQuantityApi && (
          <AgGridReact
            {...gridProps}
            // className="ag-theme-alpine"
            ref={gridRef}
            rowData={missingQuantityApi}
            // columnDefs={columnCreation}
            // defaultColDef={defaultColDef}
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

export default MissingQuantity;
