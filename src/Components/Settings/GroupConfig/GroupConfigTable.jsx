import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaUsersGear } from "react-icons/fa6";
import { Notification } from "../../DynamicComp/Notification";
import useApi from "../../CustomHook/useApi";
import { GET_GROUP_CONFIG_API, GET_USER_SETTINGS_API } from "../../../API/ApiServices";
import profile from "../ProfilePage/ProfilePage.module.scss";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { DatePicker } from "antd";
import { Row } from "react-bootstrap";
import dayjs from "dayjs";

const GroupConfigTable = () => {
  const { data, loading, error, makeApiCall } = useApi(GET_GROUP_CONFIG_API);
  let excludeColumns = [];
  const [groupConfigData, setGroupConfigData] = useState([]); //group table
  const [groupConfigApiData, setGroupConfigApiData] = useState({
    date: new Date().toISOString().split("T")[0],
  });
  const [userdate, setUserdate] = useState();

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

  const gridRef = useRef();

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
    (async () => {
      const getDate = await GET_USER_SETTINGS_API();
      // console.log(getDate.data.result[0].createddate);
      if (getDate)
        setUserdate(dayjs(getDate.data.result[0].date_range.fromdate));
    })();
  }, []);

  const viewGroupConfig = async (e) => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching group config Data...",
    }));
    try {
      const apicall = await GET_GROUP_CONFIG_API(groupConfigApiData);
      // console.log("apicall", apicall);
      if (apicall) {
        setGroupConfigData(apicall.data.result);
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

  const numberformatter = Intl.NumberFormat("en-US", {
    // style: "currency",
    // currency: "INR",
    maximumFractionDigits: 0,
  });

  let myValueFormatter = (p) => numberformatter.format(p.value);

  const getRowId = useCallback((params) => {
    return params.data.id;
  });
  const sideBar = useMemo(() => {
    return {
      toolPanels: ["filters"],
    };
  }, []);

  const columnCreation = useMemo(() => {
    let columns = [];
    for (let key in groupConfigData[0]) {
      columns.push({
        field: key,
        headerName: key.toUpperCase(),
        sortable: true,
        filter: true,
      });
    }
    return columns;
  }, [groupConfigData]);
  const handleDateChange = (date, dateStrings) => {
    // console.log(dateStrings);
    setGroupConfigApiData((prev) => ({
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
                <FaUsersGear />
              </span>
              View Group Configuration
            </h5>
          </div>
          <div className={`col-md-5 ${profile.historyDateSection}`}>
            <DatePicker
              format="YYYY-MM-DD" // Specify the date format
              placeholder={"Date"}
              allowClear={true} // Set to true if you want to allow clearing the
              className={`${profile.datePicker} datepicker `}
              value={dayjs(groupConfigApiData.date, "YYYY-MM-DD")}
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
                onClick={viewGroupConfig}
              />
            </div>
          </div>
        </Row>
      </div>
      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        {groupConfigData && (
          <AgGridReact
            className="ag-theme-alpine"
            getRowId={getRowId}
            ref={gridRef}
            rowData={groupConfigData}
            columnDefs={columnCreation}
            sideBar={sideBar}
          />
          // <GridComponent
          //   tableData={groupConfigData}
          //   excludeColumns={excludeColumns}
          //   groupData={[]}
          // />
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

export default GroupConfigTable;
