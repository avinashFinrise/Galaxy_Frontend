import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlineCluster } from "react-icons/ai";
import { Notification } from "../../DynamicComp/Notification";
import useApi from "../../CustomHook/useApi";
import { GET_CLUSTER_API } from "../../../API/ApiServices";
import profile from "../ProfilePage/ProfilePage.module.scss";
import { AgGridReact } from "ag-grid-react";

const ClusterTable = () => {

  const [clusterData, setClusterData] = useState([]); //cluster table
  let ds = [];

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

  // const CloseConfirm = () => {
  //   setNotifyData((data) => ({ ...data, confirmFlag: false }));
  // };

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };
  const gridRef = useRef();

  //cluster
  useEffect(() => {
    // makeApiCall(GET_CLUSTER_API);
    (() => {
      const api = new Promise((resolve, reject) => {
        resolve(GET_CLUSTER_API());
        setNotifyData((data) => ({
          ...data,
          loadingFlag: true,
          loadingMsg: "Fetching cluster data...",
        }));
      });
      api
        .then((res) => {
          // console.log(res);
          setClusterData(res?.data?.result);
          setNotifyData((prev) => {
            return { ...prev, loadingFlag: false };
          });
        })
        .catch((err) => {
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
    })();
  }, []);


  const columnCreation = useMemo(() => {
    let columns = [];
    if (clusterData.length > 0) {
      for (let key in clusterData[0]) {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          sortable: true,
          filter: true,
        });
      }
    }

    return columns;
  }, [clusterData]);

  const defaultColDef = useMemo(() => {
    return {
      // editable: true,
      // sortable: true,
      flex: 1,
      minWidth: 100,
      // // filter: true,
      resizable: true,
      // filter: "agTextColumnFilter",
      floatingFilter: false,
      // cellDataType: false,
      width: 100,
      editable: true,
      filter: "agTextColumnFilter",
      // menuTabs: ["filterMenuTab"],
    };
  }, []);

  // console.log(columnCreation);

  const sideBar = useMemo(() => {
    return {
      toolPanels: ["filters"],
    };
  }, []);

  const getRowId = useCallback((params) => {
    return params.data.id;
  });
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <AiOutlineCluster />
        </span>
        View Cluster
      </h5>
      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        {clusterData && (
          <AgGridReact
            ref={gridRef}
            defaultColDef={defaultColDef}
            className="ag-theme-alpine"
            rowData={clusterData}
            columnDefs={columnCreation}
            sideBar={sideBar}
            getRowId={getRowId}
          />

        )}
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      // CloseConfirm={CloseConfirm}
      />
    </div>
  );
};

export default ClusterTable;
