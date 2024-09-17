import { memo, useEffect, useState } from "react";
import { LiaDownloadSolid } from "react-icons/lia";
import { SlSettings } from "react-icons/sl";
import { ModalPopup } from "../DynamicComp";
import EditSpreadBook from "./EditSpreadBook";
import {
  GET_SPREADBOOK_API,
  GET_USER_SETTINGS_API,
  SPREADBOOK_DOWNLOAD_API,
} from "../../API/ApiServices";
import { SpreadBookTable } from "../Tables";
import moment from "moment";
import { CSVLink } from "react-csv";
import sprdStyle from "./SpreadBook.module.scss";
import { DatePicker } from "antd";
import { Notification } from "../DynamicComp/Notification";


import { shallowEqual, useSelector } from "react-redux";
import dayjs from "dayjs";

const SpreadBook = () => {
  console.log("spreadbook=================>");
  const [showEditSpreadbook, setShowEditSpreadbook] = useState(false);
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const [editSpreadBook, setEditSpreadBook] = useState(
    localStorage.getItem("editSpreadBook")
      ? JSON.parse(localStorage.getItem("editSpreadBook"))
      : {
        inputvalue: "",
        flag: "allflag",
        inputvalueTo: "",
        compareByValue: "Equal",
      }
  );

  const [apiData, setApiData] = useState({
    event: "getspreadbook",
    data: {
      fromdate: "",
      todate: "",
      filters: {
        exchange: [],
        groupname: [],
        clustername: [],
        userid: [],
      },
    },
  });

  // console.log({ apiData })

  const [spreadbookData, setSpreadbookData] = useState([]);
  const [downloadFull, setDownloadFull] = useState([]);
  const [fullSpreadBook, setFullSpreadBook] = useState([]);
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

  const [userdate, setUserdate] = useState();
  useEffect(() => {
    (async () => {
      const getDate = await GET_USER_SETTINGS_API();
      if (getDate) setUserdate(dayjs(getDate.data.result[0].date_range.fromdate));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (apiData.data.fromdate !== "" && apiData.data.todate !== "") {
          setNotifyData((data) => ({ ...data, loadingFlag: true, loadingMsg: "Fetching Data...", }));

          const apicall = await SPREADBOOK_DOWNLOAD_API(apiData);
          setSpreadbookData(apicall.data.result);
          setNotifyData((prev) => ({ ...prev, loadingFlag: false, successFlag: true, successMsg: "fetch success" }));
        }
      } catch (error) {
        setNotifyData((prev) => ({ ...prev, loadingFlag: false, errorFlag: true, errorMsg: error?.response?.data?.reason, headerMsg: error.code, }));
      }
    })();
  }, [apiData]);
  // console.log(apiData);
  const editstateLocalstorage = localStorage.getItem("editSpreadBook")
    ? JSON.parse(localStorage.getItem("editSpreadBook"))
    : {
      inputvalue: "",
      flag: "allflag",
    };

  const filterSpreadBook = (filterEdited) => {
    // console.log("filterSpreadBook called", filterEdited)
    // if (editSpreadBook?.flag == "flagonly" && editSpreadBook?.inputvalue != "" && editSpreadBook?.compareByValue != "") {
    //   filterEdited && localStorage.setItem("editSpreadBook", JSON.stringify(editSpreadBook));

    const finalData = []

    fullSpreadBook.forEach(row => {
      const value1 = Math.abs(row?.disparity);
      const inputvaluegiven = Math.abs(editSpreadBook?.inputvalue);
      const toinputvaluegiven = Math.abs(editSpreadBook?.inputvalueTo);

      let rowToAdd = true

      if (editSpreadBook.flag == "allflag") {
        setDownloadFull(fullSpreadBook);
        filterEdited && localStorage.setItem("editSpreadBook", JSON.stringify(editSpreadBook));
        rowToAdd = true
      } else {
        if (editSpreadBook.compareByValue === "Greater Than (>)") {
          rowToAdd = value1 > inputvaluegiven;
        } else if (editSpreadBook.compareByValue === "Less Than (<)") {
          rowToAdd = value1 < inputvaluegiven;
        } else if (editSpreadBook.compareByValue === "Equal") {
          rowToAdd = value1 === inputvaluegiven;
        } else if (editSpreadBook.compareByValue === "Between") {
          rowToAdd = value1 > inputvaluegiven && value1 < toinputvaluegiven;
        } else {
          // Handle other cases or set a default result if needed.
          rowToAdd = false; // Default to false if compareByValue doesn't match any known condition.
        }
      }

      // row["id"] = `${row.userid}-${row.referenceno}-${row.sender}`
      if (rowToAdd) finalData.push(row)
    })

    // console.log({ finalData })
    setDownloadFull(finalData)

  }

  const getSpreadbookData = async () => {
    setNotifyData((data) => ({ ...data, loadingFlag: true, loadingMsg: "Fetching spreadbook Data..." }));

    try {
      const apicall = await GET_SPREADBOOK_API();

      if (apicall.status == 200) {
        setFullSpreadBook(apicall.data.result);
        setNotifyData((prev) => ({ ...prev, loadingFlag: false }));
      }
      filterSpreadBook()

    } catch (error) {
      console.log(error);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          // confirmFlag: false,
          errorFlag: true,
          errorMsg: "something went wrong",
          headerMsg: error.code,
        };
      });
    }
  }

  useEffect(() => {
    getSpreadbookData();
  }, [dateRange]);






  const csvReports = {
    filename: "SpreadBook.csv",
    data: spreadbookData,
  };
  const csvfullSpreadbookReports = {
    filename: "FullSpreadBook.csv",
    data: downloadFull,
  };
  const downloadButtonReset = () => {
    setApiData({
      event: "spreadbook",
      data: {
        fromdate: "",
        todate: "",
        filters: {
          exchange: [],
          groupname: [],
          clustername: [],
          userid: [],
        },
      },
    });
  };
  const handleDatePickerChange = (dates, dateStrings) => {
    const [fromDate, toDate] = dateStrings;

    setApiData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        fromdate: fromDate,
        todate: toDate,
      },
    }));
  };



  // console.log("spreadDownload", spreadbookData);
  useEffect(() => {
    filterSpreadBook(true)
    // try {
    //   localStorage.setItem("editSpreadBook", JSON.stringify(editSpreadBook));
    // } catch (e) {
    //   // Handle potential errors, e.g., if localStorage is full or blocked
    //   console.error("Error saving to localStorage:", e);
    // }
    // setDownloadFull(
    //   downloadFull.filter(
    //     (obj) =>
    //       Math.abs(obj?.disparity) == Math.abs(editSpreadBook?.inputvalue)
    //   )
    // );


  }, [editSpreadBook, fullSpreadBook]);


  const spreadBookEditSetting = () => setShowEditSpreadbook(p => !p);

  return (
    <div
      className={`container-fluid ${sprdStyle.spreadBookSection} spreadBookSection`}
    >
      <div className={sprdStyle.spreadBookHeader}>
        <div className={sprdStyle.dateContent}>
          <div className={`${sprdStyle.datesection} dateSection`}>
            <DatePicker.RangePicker
              format="YYYY-MM-DD" // Specify the date format
              placeholder={["Start Date", "End Date"]}
              allowClear // Set to true if you want to allow clearing the
              className={`${sprdStyle.datePicker} datepicker `}
              value={
                apiData.data.fromdate && apiData.data.todate
                  ? [
                    moment(apiData.data.fromdate, "YYYY-MM-DD"),
                    moment(apiData.data.todate, "YYYY-MM-DD"),
                  ]
                  : null
              }
              disabledDate={(current) => {
                // return userdate && current < userdate.startOf("day");
                if (userdate && dayjs(userdate).isValid()) {
                  return current.isBefore(userdate.startOf("day"));
                }
                return false;
              }}
              onChange={handleDatePickerChange}
            />
          </div>

          <div className={sprdStyle.exportBtn}>
            <CSVLink {...csvReports}>
              <button
                onClick={() => {
                  downloadButtonReset();
                }}
              >
                Export
                <span className={sprdStyle.icon}>
                  <LiaDownloadSolid />
                </span>
                {/* {csvLinks} */}
              </button>
            </CSVLink>
          </div>
        </div>
        <div className={sprdStyle.downloadSection}>
          <CSVLink {...csvfullSpreadbookReports}>
            <button className={sprdStyle.downFullSpreadBook}>
              <span>
                Download Full SpreadBook
                <span className={sprdStyle.icon}>
                  <LiaDownloadSolid />
                </span>
              </span>
            </button>
          </CSVLink>
          {/* <button className={sprdStyle.downVisibalSpreadBook}>
            <span>
              Download Visible SpreadBook
              <span className={sprdStyle.icon}>
                <LiaDownloadSolid />
              </span>
            </span>
          </button> */}
          <div
            className={sprdStyle.spreadBookSetting}
            onClick={spreadBookEditSetting}
          >
            <SlSettings />
          </div>
        </div>
      </div>
      <div style={{ marginTop: "1rem" }}>
        <SpreadBookTable tableData={downloadFull} getSpreadbookData={getSpreadbookData} />
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
      <ModalPopup
        fullscreen={true}
        title={"Edit SpreadBook"}
        flag={showEditSpreadbook}
        close={spreadBookEditSetting}
        component={
          <EditSpreadBook
            editSpreadBook={editSpreadBook}
            setEditSpreadBook={setEditSpreadBook}
          />
        }
      />
    </div>
  );
};

export default memo(SpreadBook);
