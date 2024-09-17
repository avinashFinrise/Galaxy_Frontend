import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaUserCog } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import { Notification } from "../../DynamicComp/Notification";
import {
  GET_USER_CONFIG_API,
  GET_USER_SETTINGS_API,
} from "../../../API/ApiServices";
import CustomUserIdTooltip from "./CustomUserIdTooltip";
import profile from "../ProfilePage/ProfilePage.module.scss";
import { DatePicker } from "antd";
import { Row } from "react-bootstrap";
import dayjs from "dayjs";

const UserConfigTable = () => {
  const [userConfigData, setUserConfigData] = useState([]); //userconfig table
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
  const [userConfigApiData, setUserConfigApiData] = useState({
    date: new Date().toISOString().split("T")[0],
  });
  const [userdate, setUserdate] = useState();

  useEffect(() => {
    (async () => {
      const getDate = await GET_USER_SETTINGS_API();
      // console.log(getDate.data.result[0].createddate);
      if (getDate)
        setUserdate(dayjs(getDate.data.result[0].date_range.fromdate));
    })();
  }, []);

  const gridRef = useRef()

  // const CloseConfirm = () => {
  //   setNotifyData((data) => ({ ...data, confirmFlag: false }));
  // };

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };



  const viewUserConfig = async (e) => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching user config Data...",
    }));
    try {
      const apicall = await GET_USER_CONFIG_API(userConfigApiData);
      // console.log("apicall", apicall);
      if (apicall) {
        setUserConfigData(apicall.data.result);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            // confirmFlag: false,
            successFlag: true,
            successMsg: apicall.data.status,
            // successMsg: "fetch success",
          };
        });
      }
    } catch (error) {
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
  };


  const columnDefs = useMemo(() => {
    let columns = [
      { field: "id", headerName: "ID" },
      { field: "date", headerName: "DATE" },
      {
        field: "userid",
        headerName: "USERID",
        tooltipField: "userid",
        tooltipComponent: CustomUserIdTooltip,
        tooltipComponentParams: { color: "#ececec" }
      },
      {
        field: "configname",
        headerName: "CONFIGNAME",
        tooltipField: "configname",
        // tooltipComponent: CustomGroupTooltip,
        tooltipComponentParams: { color: "#ececec" }
      },
    ];

    return columns
  }, [userConfigData]);

  // console.log("userConfigData", userConfigData)

  const defaultColDef = useMemo(() => {
    return {

      flex: 1,
      minWidth: 100,
      resizable: true,
      floatingFilter: true,
      width: 100,
      editable: false,
      filter: true
    };
  }, []);

  const sideBar = useMemo(() => {
    return {
      toolPanels: ["filters"],
    };
  }, []);

  const getRowId = useCallback((params) => {
    return params.data.id;
  }, []);

  const handleDateChange = (date, dateStrings) => {
    // console.log(dateStrings);
    setUserConfigApiData((prev) => ({
      ...prev,
      date: dateStrings,
    }));
  };
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <div className={profile.headingSection}>
        <Row className={profile.contantSection}>
          <div className="col-md-7">
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <FaUserCog />
              </span>
              View User Configuration
            </h5>
          </div>
          <div className={`col-md-5 ${profile.historyDateSection}`}>
            <DatePicker
              format="YYYY-MM-DD" // Specify the date format
              placeholder={"Date"}
              allowClear={true} // Set to true if you want to allow clearing the
              className={`${profile.datePicker} datepicker `}
              value={dayjs(userConfigApiData.date, "YYYY-MM-DD")}
              onChange={handleDateChange}
              disabledDate={(current) => {
                return current.isBefore(userdate.startOf("day")) || current > Date.now();
              }}
            />
            <div>
              <input
                type="submit"
                className={`basic-InfoBtn ${profile.basicInfoBtn}`}
                value="View"
                onClick={viewUserConfig}
              />
            </div>
          </div>
        </Row>
      </div>
      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        {userConfigData && (
          <AgGridReact
            ref={gridRef}
            className="ag-theme-alpine"
            columnDefs={columnDefs}
            rowData={userConfigData}
            defaultColDef={defaultColDef}
            tooltipShowDelay={0}
            tooltipHideDelay={10000}
            sideBar={sideBar}
            getRowId={getRowId}
          />
        )}
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
};

export default memo(UserConfigTable);
