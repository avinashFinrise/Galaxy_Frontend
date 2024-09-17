import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiFillAccountBook } from "react-icons/ai";
import profile from "../ProfilePage/ProfilePage.module.scss";
import {
  DOWNLOAD_REPORT,
  GET_USER_SETTINGS_API,
} from "../../../API/ApiServices";
import { DatePicker } from "antd";
import moment from "moment";
import { Row } from "react-bootstrap";
import { Notification } from "../../DynamicComp/Notification";
import { AgGridReact } from "ag-grid-react";
import dayjs from "dayjs";

const ViewTradeBook = () => {
  const [tradeApiData, setTradeApiData] = useState({
    event: "gettradebook",
    data: {
      fromdate: "",
      todate: "",
      filters: {
        exchange: [],
        userid: [],
        symbol: [],
      },
    },
  });
  const [userdate, setUserdate] = useState();
  const [tradeBookData, settradeBookData] = useState([]);
  const gridRef = useRef();
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
  const viewTradeBook = async (e) => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching tradeBook Data...",
    }));
    try {
      const apicall = await DOWNLOAD_REPORT(tradeApiData);
      // console.log("apicall", apicall);
      if (apicall) {
        settradeBookData(apicall.data.result);
      }

      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          // confirmFlag: false,
          successFlag: true,
          successMsg: "data fetch successfull",
          // successMsg: "fetch success",
        };
      });
      // setTradeApiData({
      //   event: "",
      //   data: {
      //     fromdate: "",
      //     todate: "",
      //   },
      // });
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
  useEffect(() => {
    (async () => {
      const getDate = await GET_USER_SETTINGS_API();
      // console.log(getDate.data.result[0].createddate);
      if (getDate)
        setUserdate(dayjs(getDate.data.result[0].date_range.fromdate));
    })();
  }, []);
  const handleDatePickerChange = (dates, dateStrings) => {
    const [fromDate, toDate] = dateStrings;
    setTradeApiData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        fromdate: fromDate,
        todate: toDate,
      },
    }));
  };
  // tradeBookData.forEach((item) => {
  //   tradeBookData.length > 0
  //     ? Object.keys(item).forEach((key) => {
  //         console.log(`${key}`);
  //       })
  //     : null;
  // });

  const columnDefs = useMemo(() => {
    // return [
    //   { field: "id", headerName: "ID" },
    //   { field: "createddate", headerName: "createddate" },
    //   { field: "updateddate", headerName: "updateddate" },
    //   { field: "date", headerName: "date" },
    //   { field: "time", headerName: "time" },
    //   { field: "tradenum", headerName: "tradenum" },
    //   { field: "userId", headerName: "userId" },
    //   { field: "ctclid", headerName: "ctclid" },
    //   { field: "accountcode", headerName: "accountcode" },
    //   { field: "membercode", headerName: "membercode" },
    //   { field: "exchange", headerName: "exchange" },
    //   { field: "segment", headerName: "segment" },
    //   { field: "token", headerName: "token" },
    //   { field: "opttype", headerName: "opttype" },
    //   { field: "expirydate", headerName: "expirydate" },
    //   { field: "strikeprice", headerName: "strikeprice" },
    //   { field: "symbol", headerName: "symbol" },
    //   { field: "buysellflag", headerName: "buysellflag" },
    //   { field: "tradeqty", headerName: "tradeqty" },
    //   { field: "tradeprice", headerName: "tradeprice" },
    //   { field: "maintradeid", headerName: "maintradeid" },
    //   { field: "securitytype", headerName: "securitytype" },
    //   { field: "sender", headerName: "sender" },
    // ];
    let columns = [];
    if (tradeBookData.length > 0) {
      for (let key in tradeBookData[0]) {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          sortable: true,
          filter: true,
        });
      }
    }
    return columns;
  }, [tradeBookData]);
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
  // console.log(
  //   "tradebook",
  //   tradeBookData.length > 0 ? Object.keys(tradeBookData[0]) : null
  // );
  // console.log("tradeBookData", tradeBookData);
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <div className={profile.headingSection}>
        <Row className={profile.contantSection}>
          <div className="col-md-5">
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <AiFillAccountBook />
              </span>
              View TradeBook
            </h5>
          </div>
          <div className={`col-md-7 ${profile.historyDateSection}`}>
            <DatePicker.RangePicker
              format="YYYY-MM-DD" // Specify the date format
              placeholder={["Start Date", "End Date"]}
              allowClear={true} // Set to true if you want to allow clearing the
              className={`${profile.datePicker} datepicker `}
              value={
                tradeApiData.data.fromdate && tradeApiData.data.todate
                  ? [
                    moment(tradeApiData.data.fromdate, "YYYY-MM-DD"),
                    moment(tradeApiData.data.todate, "YYYY-MM-DD"),
                  ]
                  : null
              }
              disabledDate={(current) => {
                // return userdate && current < userdate.startOf("day");
                if (userdate && dayjs(userdate).isValid()) {
                  return current.isBefore(userdate.startOf("day")) || current > Date.now();
                }
                return false;
              }}
              onChange={handleDatePickerChange}
            />
            <div>
              <input
                type="submit"
                className={`basic-InfoBtn ${profile.basicInfoBtn}`}
                value="View"
                onClick={viewTradeBook}
              />
            </div>
          </div>
        </Row>
      </div>

      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        {tradeBookData && (
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={tradeBookData}
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
      />
    </div>
  );
};

export default memo(ViewTradeBook);
