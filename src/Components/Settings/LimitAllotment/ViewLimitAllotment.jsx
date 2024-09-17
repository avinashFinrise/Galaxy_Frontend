import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Notification } from "../../DynamicComp/Notification";
import useApi from "../../CustomHook/useApi";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { CREATE_MARGIN_CONFIG_API, GET_MARGIN_CONFIG_API } from "../../../API/ApiServices";
import { AgGridReact } from "ag-grid-react";
import { GiSandsOfTime } from "react-icons/gi";
import profile from "../ProfilePage/ProfilePage.module.scss";

const ViewLimitAllotment = () => {
  const { data, loading, error, makeApiCall } = useApi(GET_MARGIN_CONFIG_API);
  let excludeColumns = [];
  const [marginConfigData, setMarginConfigData] = useState([]); //margin table
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
    makeApiCall(GET_MARGIN_CONFIG_API);
  }, []);

  useEffect(() => {
    if (loading) {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Fetching marginConfig data...",
      }));
    }
    if (data?.httpstatus === 200 && !loading) {
      // console.log(data);
      setMarginConfigData(data?.result);
      // console.log(data.result);
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
  const gridRef = useRef();
  const columnDefs = useMemo(() => {
    // return [
    //   { field: "id", headerName: "ID" },
    //   { field: "date", headerName: "DATE" },
    //   { field: "userid", headerName: "USERID" },
    //   { field: "clustername", headerName: "CLUSTERNAME" },
    //   { field: "symbol", headerName: "SYMBOL" },
    //   { field: "margintype", headerName: "MARGINTYPE" },
    //   { field: "allowed", headerName: "ALLOWED" },
    //   { field: "userid_id", headerName: "USERID_ID" },
    //   { field: "group", headerName: "GROUP" },
    //   { field: "cluster", headerName: "CLUSTER" },
    //   { field: "exchange", headerName: "EXCHANGE" },
    // ];
    let columns = [];
    if (marginConfigData.length > 0) {
      for (let key in marginConfigData[0]) {
        let existingColumnIndex = columns.findIndex((col) => col.field === key);
        if (existingColumnIndex > -1) {
          if (key === "allowed") {
            columns[existingColumnIndex] = {
              ...columns[existingColumnIndex],
              editable: true,
              headerName: key.toUpperCase(),
              cellEditor: "agNumberCellEditor",
              valueFormatter: (params) => params.value,
              cellEditorParams: {

                precision: 0,
              },
            }
          }
        }
        else {
          if (key == "allowed") {
            columns.push({
              field: key,
              editable: true,
              headerName: key.toUpperCase(),
              cellEditor: "agNumberCellEditor",
              valueFormatter: (params) => params.value,
              cellEditorParams: {
                // min: 1,
                // max: 100,
                precision: 0,
              },
            })
          } else {
            columns.push({
              field: key,
              headerName: key.toUpperCase(),
              sortable: true,
              filter: true,
              editable: false
            });
          }
        }
      }
    }
    return columns;
  }, [marginConfigData]);
  const defaultColDef = useMemo(() => {
    return {
      // editable: true,
      sortable: true,
      flex: 1,
      minWidth: 100,
      width: 100,
      filter: true,
      resizable: true,
    };
  }, []);
  // console.log(marginConfigData);
  const sideBar = {
    // toolPanels: ["filters"],
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Hide Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
      },
      {
        id: 'filters',
        labelDefault: 'Filters',
        labelKey: 'filters',
        iconKey: 'filter',
        toolPanel: 'agFiltersToolPanel',
      }
    ]
  };

  const getRowId = useCallback((params) => {
    return params.data.id;
  });


  const onCellValueChanged = async (params) => {
    // const clientLimit = params;
    console.log(params.data);
    let { createddate, updateddate, ...paramsobjectCopy } = { ...params.data }
    console.log("paramsobjectCopy", paramsobjectCopy);

    const marginConfigUpdatePost = await CREATE_MARGIN_CONFIG_API({
      event: "update",
      data: {
        ...paramsobjectCopy

      }
    })
  }

  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <GiSandsOfTime />
        </span>
        View Limit Allotment
      </h5>
      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      // className={` ${profile.marginTable} `}
      >
        {marginConfigData && (
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={marginConfigData}
            defaultColDef={defaultColDef}
            tooltipShowDelay={0}
            className="ag-theme-alpine"
            sideBar={sideBar}
            getRowId={getRowId}
            onCellValueChanged={onCellValueChanged}
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

export default ViewLimitAllotment;
