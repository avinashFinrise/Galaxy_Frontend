import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MdGroup } from "react-icons/md";
import { Notification } from "../../DynamicComp/Notification";
import useApi from "../../CustomHook/useApi";
import { GET_GROUP_API } from "../../../API/ApiServices";
import profile from "../ProfilePage/ProfilePage.module.scss";
import { AgGridReact } from "ag-grid-react";

const GroupTable = () => {
  const { data, loading, error, makeApiCall } = useApi(GET_GROUP_API);
  let excludeColumns = [];
  const gridRef = useRef();
  const [createGroupData, setCreateGroupData] = useState([]); //group table
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
    makeApiCall(GET_GROUP_API);
  }, []);

  useEffect(() => {
    if (loading) {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Fetching groupname data...",
      }));
    }
    if (data?.httpstatus === 200 && !loading) {
      setCreateGroupData(data?.result);
      setNotifyData((prev) => {
        return { ...prev, loadingFlag: false };
      });
    } else if (error) {
      console.log(error);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          // confirmFlag: false,
          errorFlag: true,
          errorMsg: error.response?.data.reason,
          headerMsg: error.code,
        };
      });
    }
  }, [data, error, loading]);

  const columnDefs = useMemo(() => {
    let columns = [];
    if (createGroupData.length > 0) {
      for (let key in createGroupData[0]) {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          sortable: true,
          filter: true,
        });
      }
    }
    return columns;
  }, [createGroupData]);
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

  const getRowId = useCallback((params) => {
    return params.data.id;
  });
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <MdGroup />
        </span>
        View Group
      </h5>
      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        {/* {createGroupData && (
          <GridComponent
            tableData={createGroupData}
            excludeColumns={excludeColumns}
            groupData={[]}
          />
        )} */}
        {createGroupData && (
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={createGroupData}
            defaultColDef={defaultColDef}
            tooltipShowDelay={0}
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

export default GroupTable;
