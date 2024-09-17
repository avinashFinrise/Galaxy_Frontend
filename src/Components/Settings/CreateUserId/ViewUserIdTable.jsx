import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MdGroup } from "react-icons/md";
import { Notification } from "../../DynamicComp/Notification";
import { GET_USERID_MASTER } from "../../../API/ApiServices";
import profile from "../ProfilePage/ProfilePage.module.scss";
import { AgGridReact } from "ag-grid-react";

const ViewUserIdTable = () => {
  let excludeColumns = [];
  const gridRef = useRef();
  const [uerIdData, setUserIdData] = useState([]); //group table
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
  useEffect(() => {
    (() => {
      const api = new Promise((resolve, reject) => {
        resolve(GET_USERID_MASTER());
        setNotifyData((data) => ({
          ...data,
          loadingFlag: true,
          loadingMsg: "Fetching userid data...",
        }));
      });
      api
        .then((res) => {
          // console.log(res);
          setUserIdData(res?.data?.result);
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
  const columnDefs = useMemo(() => {
    let columns = [];
    if (uerIdData.length > 0) {
      for (let key in uerIdData[0]) {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          sortable: true,
          filter: true,
        });
      }
    }
    return columns;
  }, [uerIdData]);
  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      sortable: true,
      // floatingFilter: true,
      flex: 1,
      minWidth: 100,
      width: 100,
      filter: "agTextColumnFilter",
      resizable: true,
    };
  }, []);
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
          <MdGroup />
        </span>
        View UserId
      </h5>
      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        {uerIdData && (
          <AgGridReact
            ref={gridRef}
            rowData={uerIdData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            // tooltipShowDelay={0}
            className="ag-theme-alpine"
            sideBar={sideBar}
            getRowId={getRowId}
          // tooltipHideDelay={2000}
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

export default ViewUserIdTable;
