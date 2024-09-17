import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react'
import { DOWNLOAD_LIMIT_REPORT, GET_FILTERS_API, GET_GROUP_API, GET_USERID_MASTER, GET_USER_SETTINGS_API } from '../../API/ApiServices';
import { Form } from 'react-bootstrap';
import repoStyle from "../../Components/DownloadReport/DownloadReport.module.scss";
import { Notification } from '../../Components/DynamicComp/Notification';
import { CSVLink } from 'react-csv';
// import repoStyle from "./DownloadReport.module.scss";
const DownloadRiskReport = ({downloadReport,riskData}) => {
  const [apiReportData, setApiReportData] = useState({
    start_date: "",
    end_date: "",
    group_name:[],
    user_id:[]

  })
  const [filterOption, setfilterOption] = useState({

    groupname: [],

    userid: [],

  });
  const [userdate, setUserdate] = useState();
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
  let downloadData = [];
  const [handleDownReport, setHandleDownReport] = useState({
    filename: `limit data ${apiReportData.start_date}${apiReportData.end_date}`,
    data: downloadData,
  });
  const [validate, setValidate] = useState(false);
  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };
  const [groupOrProductWise, setgroupOrProductWise] = useState("group")

  const handleDatePickerChange = (dates, dateStrings) => {
    // dates[0] is the selected 'from' date, and dates[1] is the selected 'to' date
    const [fromDate, toDate] = dateStrings;

    // Update the state with the selected date range
    setApiReportData((prevState) => ({
      ...prevState,

      start_date: fromDate,
      end_date: toDate,

    }));

    // setCustomReport(previous => ({
    //   ...previous,
    //   fromdate: fromDate,
    //   todate: toDate
    // }))
  };
  useEffect(() => {
    (async () => {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Fetching all filters Data...",
      }));
      try {
        // const userApiCall = await GET_FILTERS_API({ event: "getallfilters" });
        const userApiCall = await Promise.all([
          // GET_FILTERS_API({ event: "getallfilters" }),

          GET_USER_SETTINGS_API(),
          GET_USERID_MASTER(),
          GET_GROUP_API()
          //   GET_EXCHANGE_API(),
          //   GET_CLUSTER_API()

        ]);
        const [ userfromdate,userMaster,groupMaster] = userApiCall;
        // console.log(GET_FILTERS_API);
        // userApiCall.data.result &&
        if (userMaster) {
          console.log({userMaster});
          setfilterOption((previous) => ({
            ...previous,
            // exchange: filterData.data.result.exchange,
            // groupname: filterData.data.result.groupname,
            // clustername: filterData.data.result.clustername,
            userid: userMaster.data.result,
            // symbol: filterData.data.result.symbols,
          }));
        }
        if(groupMaster){
          console.log({groupMaster})
          setfilterOption((previous) => ({
            ...previous,
            // exchange: filterData.data.result.exchange,
            groupname: groupMaster.data.result,
            // clustername: filterData.data.result.clustername,
            // userid: userMaster.data.result,
            // symbol: filterData.data.result.symbols,
          }));

        }
        if (userfromdate) {
          setUserdate(dayjs(userfromdate.data.result[0].date_range.fromdate));
        }


        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
          };
        });
      } catch (error) {
        console.log("error", error);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            // confirmFlag: false,
            errorFlag: true,
            errorMsg: "filter data not found  ",
            headerMsg: error.code,
          };
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (handleDownReport?.data.length > 0) {
      console.log("datechngedincondeition");
      setValidate(false);
      
        setHandleDownReport({
          filename: `${`Limit`
            .toLowerCase()
            .replace(/\b\w/g, (s) => s.toUpperCase())}${apiReportData.start_date
            }${apiReportData.end_date}`,
          data: [],
        });
      }


    
    
  }, [apiReportData]);

  const downloadRepo = async () => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching  Data...",
    }));
    try {
      if (apiReportData.start_date==="" || apiReportData.end_date ==="") {
        // Display an error message and prevent the API call
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            errorFlag: true,
            errorMsg: "Please Select Date Range",
          };
        });
      } else {
        try {
          let apicall = await DOWNLOAD_LIMIT_REPORT(apiReportData)
          // console.log({ apicall });
          if (apicall.data) {
            downloadData = apicall.data;
            const convertToCSV = (data) => {
              const array = [Object.keys(data[0])].concat(data);
            
              return array
                .map(row => {
                  return Object.values(row)
                    .map(value => (typeof value === 'string' ? `"${value}"` : value))
                    .toString();
                })
                .join('\n');
            };
            const csvData = convertToCSV(downloadData);
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
            const updatedHandleDownReport = {
              filename: `${`LIMIT `
                .toLowerCase()
                .replace(/\b\w/g, (s) => s.toUpperCase())}${apiReportData.start_date
                }_${apiReportData.end_date}`,
              data: downloadData,
            };
            setHandleDownReport(updatedHandleDownReport); // Update the handleDownReport
            setNotifyData((prev) => {
              return {
                ...prev,
                loadingFlag: false,
                successFlag: true,
                successMsg: "fetch success",
              };
            });
            const link = document.createElement('a');
        link.href = url;
        link.download = updatedHandleDownReport.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        downloadButtonReset()
            setValidate(!validate);

          }
        } catch (error) {
          console.log("error", error);
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              errorFlag: true,
              // errorMsg: error.response?.data.reason,
              errorMsg: error.response?.data.reason,
              headerMsg: error.code,
            };
          })
        }
      }
    } catch (error) {
      console.log("error", error);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          errorFlag: true,
          // errorMsg: error.response?.data.reason,
          errorMsg: error.response?.data.reason,
          headerMsg: error.code,
        };
      });
    }
  };

  const handleFilterChange = (selectValue, filterName) => {
    if (selectValue?.includes("selectAll")) {
      
      if (filterName == "user_id") {
        // if (customReport.account === "client") {

        selectValue = filterOption?.userid?.map((val) => val?.userId);
        // }
      }
      if (filterName == "group_name") {
        // if (customReport.account === "group") {
        selectValue = filterOption?.groupname?.map((val) => val.groupName);
        // }
      }
    }
    if (selectValue?.includes("selectAllTodays")) {
      
      if (filterName == "user_id") {
        // if (customReport.account === "client") {

        selectValue = riskData?.map((val) => val.user_id);
        // }
      }
      // if (filterName == "group_name") {
      //   // if (customReport.account === "group") {
      //   selectValue = filterOption?.groupname?.map((val) => val);
      //   // }
      // }
    }
    // console.log(selectValue, filterName);
    setApiReportData((prev) => ({
      ...prev,


      [filterName]: selectValue,

    }));
  };
  const downloadButtonReset = () => {
    if (handleDownReport &&
      handleDownReport.filename &&
      handleDownReport.data.length > 0
    ) {
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          successFlag: true,
          successMsg: `Downloaded ${handleDownReport?.filename} CSV`,
        };
      });
    
    setApiReportData({
      start_date: "",
      end_date: "",
      group_name:[],
      user_id:[]
  
    });
    setValidate(false);}
  };
  let useridOptions = useMemo(() => {
    let userids = filterOption?.userid?.map((val) => {
      // console.log(val.clustername);
      return {
        label: val.userId,
        value: val.userId
        // value: val?.id?.toString(),
      };
    });
    userids?.unshift({ label: "Select All", value: "selectAll" });
    userids?.unshift({ label: "Select All Todays", value: "selectAllTodays" });
    return userids;
  }, [filterOption?.userid]);
  let groupnameOptions = useMemo(() => {
    let groupnames = filterOption?.groupname?.map((val) => {
      // console.log(val.clustername);
      return {
        label: val.groupName,
        value: val.groupName
        // value: val?.id?.toString(),
      };
    });
    groupnames?.unshift({ label: "Select All", value: "selectAll" });
    return groupnames;
  }, [filterOption?.groupname]);

  return (
    <div className={`download-section ${repoStyle.downLoadSection}`}>
      <Form.Group className={repoStyle.downloadReportSelectToggle}>
        <Form.Check
          type="radio"
          name="wise"
          checked={groupOrProductWise == "group"}
          id="group"
          onChange={(e) => {
            setApiReportData({
              start_date: "",
              end_date: "",
              group_name:[],
              user_id:[]
          
            });
            setValidate(false)
            setgroupOrProductWise(e.target.id)}}
          label="Group wise"
        ></Form.Check>
        <Form.Check
          type="radio"
          name="wise"
          id="user"
          checked={groupOrProductWise == "user"}
          onChange={(e) => {
            setApiReportData({
              start_date: "",
              end_date: "",
              group_name:[],
              user_id:[]
          
            });
            setValidate(false)
            setgroupOrProductWise(e.target.id)}}
          label="User wise"
        >
        </Form.Check>
      </Form.Group>
      <div className={repoStyle.downdReportsection}>
        <div className={`${repoStyle.datesinglesection} dateSection `}>
          <p>Select Date Range</p>
          <DatePicker.RangePicker
            onChange={handleDatePickerChange}
            format="YYYY-MM-DD" // Specify the date format
            placeholder={["Start Date", "End Date"]}
            // value={[apiReportData.data.fromdate, apiReportData.data.todate]}
            // defaultValue={`${apiReportData.data.fromdate}${apiReportData.data.todate}`}
            disabledDate={(current) => {
              // return userdate && current < userdate.startOf("day");
              if (userdate && dayjs(userdate).isValid()) {
                return current.isBefore(userdate.startOf("day")) || current > Date.now();
              }
              return false;
            }}
            value={
              apiReportData.start_date && apiReportData.end_date
                ? [
                  dayjs(apiReportData.start_date, "YYYY-MM-DD"),
                  dayjs(apiReportData.end_date, "YYYY-MM-DD"),
                ]
                : null
            }
            // renderExtraFooter={() => "extra footer"}
            allowClear // Set to true if you want to allow clearing the
            className={`${repoStyle.datePicker} datepicker `}
          />
        </div>


        {groupOrProductWise == "group" && <Form.Group className="col-12 mb-3">
          <Select
            mode="multiple"
            name="group_name"

            allowClear
            value={apiReportData?.group_name}
            style={{ width: "100%" }}
            placeholder="Please select groupname"
            onChange={(selectedValues) =>
              handleFilterChange(selectedValues, "group_name")
            }
            options={groupnameOptions.sort((a, b) => {
              if (a.label === "Select All") {
                return -1; // "Select All" comes first
              } else if (b.label === "Select All") {
                return 1; // "Select All" comes first
              } else {
                return a.label.localeCompare(b.label);
              }
            })}
            className="antdSelect"
          />
        </Form.Group>}

        {groupOrProductWise == "user" && <Form.Group className="col-12 mb-3">
          <Select
            mode="multiple"
            name="user_id"
            allowClear
            style={{ width: "100%" }}
            placeholder="Please select userid"
            value={apiReportData?.user_id}
            onChange={(selectedValues) =>
              handleFilterChange(selectedValues, "user_id")
            }
            options={useridOptions.sort((a, b) => {
              if (a.label === "Select All") {
                return -1; // "Select All" comes first
              } else if (b.label === "Select All") {
                return 1; // "Select All" comes first
              } else if (a.label === "Select All Todays") {
                return -1; // "Select All Todays" comes second, unless compared to "Select All"
              } else if (b.label === "Select All Todays") {
                return 1; // "Select All Todays" comes second, unless compared to "Select All"
              } else {
                return a.label.localeCompare(b.label);
              }
            })}
            className="antdSelect"
          />
        </Form.Group>}
        <div className={repoStyle.btnSection}>
          {/* {validate ? (<div>
              <CSVLink {...handleDownReport}>
                <button
                  onClick={() => {
                    downloadButtonReset();
                  }}
                >
                  DOWNLOAD CSV
                </button>
              </CSVLink>
            </div>
            ) : ( */}
          <button
            onClick={() => downloadRepo()}
          >
           DOWNLOAD CSV
          </button>
            {/* )} */}
        </div>
        
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  )
}

export default DownloadRiskReport