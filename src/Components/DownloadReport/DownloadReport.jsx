import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import React, { useEffect, useMemo, useState } from "react";
import { Form, InputGroup, Row } from "react-bootstrap";
import { CSVLink } from "react-csv";
import { shallowEqual, useSelector } from "react-redux";
import {
  CUSTOM_REPORT,
  DOWNLOAD_BANKOFFICE_REPORT,
  DOWNLOAD_REPORT,
  GET_CLUSTER_API,
  GET_EXCHANGE_API,
  GET_FILTERS_API,
  GET_USER_SETTINGS_API,
} from "../../API/ApiServices";
import cosmicLogo from "../../assets/logo/cosmic-logo.png";
import { Notification } from "../DynamicComp/Notification";
import repoStyle from "./DownloadReport.module.scss";
import NewReportForm from "./components/NewReportForm";
import TableChart from "./components/TableChart";
import { downloadNewReport } from "./components/handleNewReport";

const reportOptions = [
  { title: "Net Position Summary", value: "getnetposition" },
  { title: "TradeBook", value: "gettradebook" },
  { title: "Ledger", value: "getledger" },
  { title: "SpreadBook", value: "getspreadbook" },
  { title: "Settlement Rates", value: "getsettlementrate" },
  { title: "Custom Report", value: "getcustomreport" },
  { title: "Spectra Report", value: "newReport" },
  { title: "Back Office", value: "getbackofficetradebook" },
];

const reportOptionTitle = {
  "TradeBook": "is_report",
  "Ledger": "is_report",
  "SpreadBook": "is_report",
  "Settlement Rates": "is_report",
  "Custom Report": "is_report",
  "Spectra Report": "is_report",
  "Back Office": "is_report"
};


const DownloadReport = () => {
  const [withGraph, setWithGraph] = useState(false)
  const [graphdata, setGraphData] = useState({})
  const userControlSettings = useSelector(
    (state) => state.userControlSettings,
    shallowEqual
  );
  const [userdate, setUserdate] = useState();

  const [apiReportData, setApiReportData] = useState({
    event: "",
    data: {
      fromdate: "",
      todate: "",
      filters: {
        exchange: [],
        groupname: [],
        clustername: [],
        userid: [],
        symbol: [],
      },
    },
  });

  const [customReport, setCustomReport] = useState({
    fromdate: "",
    todate: "",
    account: [],
    exchange: [],
    username: [],
    clusterid: [],
    group_wise: [],

  })
  const [filterOption, setfilterOption] = useState({
    exchange: [],
    groupname: [],
    clustername: [],
    userid: [],
    symbol: [],
  });
  const [filterOptionCustomReport, setfilterOptionCustomReport] = useState({
    exchange: [],
    groupname: [],
    clustername: [],
    userid: [],
    symbol: [],
    group_wise: ["userid", "groupname", "symbol"]
  });
  const [downloadType, setDownloadType] = useState("singleDownload")
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
          GET_FILTERS_API({ event: "getallfilters" }),
          GET_USER_SETTINGS_API(),
          GET_EXCHANGE_API(),
          GET_CLUSTER_API()

        ]);
        const [filterData, userfromdate, exchangeMaster, clusterMaster] = userApiCall;
        // console.log(GET_FILTERS_API);
        // userApiCall.data.result &&
        if (filterData) {
          setfilterOption((previous) => ({
            ...previous,
            exchange: filterData.data.result.exchange,
            groupname: filterData.data.result.groupname,
            clustername: filterData.data.result.clustername,
            userid: filterData.data.result.userid,
            symbol: filterData.data.result.symbols,
          }));
        }
        if (userfromdate) {
          setUserdate(dayjs(userfromdate.data.result[0].date_range.fromdate));
        }
        if (exchangeMaster) {
          setfilterOptionCustomReport((previous) => ({
            ...previous,
            exchange: exchangeMaster.data.result,

          }));
        }
        if (clusterMaster) {
          setfilterOptionCustomReport((previous) => ({
            ...previous,
            clustername: clusterMaster.data.result,

          }));
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
  let downloadData = [];
  const [handleDownReport, setHandleDownReport] = useState({
    filename: `${apiReportData.event}${apiReportData.data.fromdate}${apiReportData.data.todate}`,
    data: downloadData,
  });
  const [validate, setValidate] = useState(false);

  const downloadRepo = async () => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching  Data...",
    }));
    try {
      if (
        apiReportData.event === "gettradebook" &&
        apiReportData.data.filters.exchange.length === 0
      ) {
        // Display an error message and prevent the API call
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            errorFlag: true,
            errorMsg: "Exchange filter is required for 'gettradebook' event",
          };
        });
      } else {
        try {
          const customReportData = (["company", "cosmicmtm"].includes(customReport.account)) ? ({ ...customReport, username: localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data"))?.accessgroups?.userid_id : [] }) : customReport
          let apicall;
          if (apiReportData.event == "getbackofficetradebook") {
            apicall = await DOWNLOAD_BANKOFFICE_REPORT(apiReportData)
          } else apicall = apiReportData.event !== 'getcustomreport' ? await DOWNLOAD_REPORT(apiReportData) : await CUSTOM_REPORT(customReportData)

          console.log({ apicall })

          const usdData = []
          const inrData = []

          apicall.data.result.forEach(e => {
            e.basecurrency === 'USD' && usdData.push(e)
            e.basecurrency === "INR" && inrData.push(e)
          })

          console.log({ usdData, inrData })

          let finaldata = {}
          if (inrData.length) finaldata["INR"] = inrData;
          if (usdData.length) finaldata["USD"] = usdData;
          setGraphData(finaldata)

          // console.log("apicall", apicall);
          // console.log("apicall.data.result", apicall.data.result);
          if (apicall.data.result) {
            downloadData = apicall.data.result;
            const updatedHandleDownReport = {
              filename: `${apiReportData.event
                .toLowerCase()
                .replace(/\b\w/g, (s) => s.toUpperCase())}${apiReportData.data.fromdate
                }${apiReportData.data.todate}`,
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

  async function makeAPICall(element) {
    try {

      // const customReportData = { ...customReport, username: [element] }
      const customReportData = { ...customReport, username: [element?.Id] }
      const response = await CUSTOM_REPORT(customReportData);
      const data = await response.data.result;
      console.log(`API response for ${element}:`, data);
      if (data) {

        const usdData = []
        const inrData = []

        data.forEach(e => {
          e.basecurrency === 'USD' && usdData.push(e)
          e.basecurrency === "INR" && inrData.push(e)
        })

        let finaldata = {}
        if (inrData.length) finaldata["INR"] = inrData;
        if (usdData.length) finaldata["USD"] = usdData;
        // setGraphData(finaldata)


        const updatedHandleDownReport = {
          filename: `${apiReportData.event
            .toLowerCase()
            .replace(/\b\w/g, (s) => s.toUpperCase())}${customReport.fromdate
            }${customReport.todate}`,
          data: finaldata,
        };
        await downloadPDF(updatedHandleDownReport, element)

        updatedHandleDownReport.data = data
        setHandleDownReport(updatedHandleDownReport); // Update the handleDownReport
        // setNotifyData((prev) => {
        //   return {
        //     ...prev,
        //     loadingFlag: false,
        //     successFlag: true,
        //     successMsg: "fetch success",
        //   };
        // });
        // setValidate(!validate);
        return true
      }
      return false

      // You can do something with the API response for each element here
    } catch (error) {

      console.error(`Error making API call for `);
      console.log(error)
      console.error(`Error making API call for `);

      return false
    }
  }
  async function makeAPICallsForArray(handleDownReportprop) {
    const userIDOrgroup = customReport.account == "client" ? "userId" : customReport.account == "group" ? "groupname" : localStorage.getItem("data") ? "userid_id" : ""
    setNotifyData((prev) => ({ ...prev, loadingFlag: true, errorFlag: false, errorMsg: "Downloading", loadingMsg: "Dowinloading Reports!!!" }));
    const delayBetweenCalls = 400;

    const arrayOfUserIDOrGroupName = customReport.account == "client" ? filterOptionCustomReport.userid : customReport.account == "group" ? filterOptionCustomReport.groupname : localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data"))?.accessgroups?.userid_id : []
    const filteredArray = arrayOfUserIDOrGroupName.filter(item => {
      return customReport?.username.includes(item.Id);
    });
    let downloadedReportsCount = 1
    const failedReportsUserids = []
    for (const element of filteredArray) {

      setNotifyData((prev) => ({ ...prev, loadingMsg: `generating ${element[userIDOrgroup]} Reports!!! (${downloadedReportsCount}/${filteredArray.length})` }));
      const success = await makeAPICall(element);
      if (!success) {
        failedReportsUserids.push(element[userIDOrgroup])
        // setNotifyData((prev) => ({ ...prev, loadingMsg:  }));

      }
      await new Promise((resolve) => setTimeout(resolve, delayBetweenCalls));
      downloadedReportsCount++
      // setGraphData({})

    }
    console.log({ failedReports: failedReportsUserids })
    setNotifyData((prev) => ({ ...prev, loadingFlag: false, headerMsg: `Failed Reports (${failedReportsUserids?.length})`, errorFlag: failedReportsUserids.length ? true : false, errorMsg: failedReportsUserids.join(", ") }));
  }


  useEffect(() => {
    if (handleDownReport?.data.length > 0) {
      console.log("datechngedincondeition");
      setValidate(false);
      if (apiReportData.event == "getcustomreport") {

        setHandleDownReport({
          filename: `${apiReportData.event
            .toLowerCase()
            .replace(/\b\w/g, (s) => s.toUpperCase())}${customReport.fromdate
            }${customReport.todate}`,
          data: [],
        });
      }
      else {
        setHandleDownReport({
          filename: `${apiReportData.event
            .toLowerCase()
            .replace(/\b\w/g, (s) => s.toUpperCase())}${apiReportData.data.fromdate
            }${apiReportData.data.todate}`,
          data: [],
        });
      }


    }
    // }
  }, [apiReportData, customReport]);

  const onClickCsvDownload = (handleDownReportprop) => {
    downloadRepo();

    if (
      handleDownReportprop.filename &&
      handleDownReportprop &&
      handleDownReportprop.data.length > 0
    ) {
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          successFlag: true,
          successMsg: `Downloaded ${handleDownReportprop?.filename} CSV`,
        };
      });
    }
  };


  function generateSelectedIdsWithLabels(customReport, filterOptionCustomReport) {
    const selectedIdsWithLabels = {
      fromdate: customReport.fromdate,
      todate: customReport.todate,
      account: customReport.account,
      group_wise: customReport.group_wise,
    };

    if (customReport.account === "client" && customReport.username.length > 0) {
      selectedIdsWithLabels.username = customReport.username.map(id => {
        const user = filterOptionCustomReport.userid.find(user => user.Id === id);
        return { id, userid: user ? user.userId : null };
      });
    } else if (customReport.account === "group" && customReport.username.length > 0) {
      selectedIdsWithLabels.username = customReport.username.map(id => {
        const group = filterOptionCustomReport.groupname.find(group => group.Id === id);
        return { id, groupname: group ? group.groupname : null };
      });
    }

    if (customReport.exchange.length > 0) {
      selectedIdsWithLabels.exchange = customReport.exchange.map(id => {
        const exchange = filterOptionCustomReport.exchange.find(ex => ex.id === id);
        return { id, exchange: exchange ? exchange.exchange : null };
      });
    }

    return selectedIdsWithLabels;
  }
  const loadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = url;
    });
  };

  // Function to resize an image
  const resizeImage = (img, width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  };


  const [headerText, setHeaderText] = useState("")
  const downloadPDF = async (handleDownReportprop, element) => {

    let data = null
    if (handleDownReportprop) data = handleDownReportprop?.data;
    else data = graphdata

    console.log({ data, graphdata })

    const result = generateSelectedIdsWithLabels(customReport, filterOptionCustomReport);
    // const pdf = new jsPDF({
    //   orientation: 'landscape',
    //   unit: 'mm',
    //   format: 'a4',
    // });
    const pdf = new jsPDF('l', 'mm', [300, 400]);
    const logoImage = await loadImage(cosmicLogo);
    const resizedLogo = resizeImage(logoImage, 300, 300);
    let content = {
      startY: 40,
    };
    // pdf.addImage(resizedLogo, 'PNG', (pdf.internal.pageSize.height + 20) / 2, 10, 70, 18);
    pdf.setTextColor("#5A5A5A");
    pdf.setFont("helvetica", "bold");
    pdf.autoTable(content);
    // Declare headerText and tradeDateText at the beginning
    let headerText;
    let tradeDateText;

    // Set headerText based on conditions
    if (apiReportData?.event == "getcustomreport" && downloadType == "singleDownload") {
      if (result?.account == "company") {
        headerText = "COMPANY"
      } else {

        headerText = (result?.username?.map(obj => `${obj.userid || obj.groupname}`)?.toString())

      }

    } else if (apiReportData?.event == "getcustomreport" && downloadType == "batchDownload") {
      if (result?.account == "company") {
        headerText = "COMPANY"
      } else {
        headerText = `${element.userId || element?.groupname}`;
      }

    }

    else {
      headerText = `${apiReportData?.data?.userid || apiReportData?.data?.groupname}`;

    }
    setHeaderText(headerText)
    if (result?.account == "company") {
      pdf.text(`${headerText} REPORT`, (pdf.internal.pageSize.height + 20) / 2, 35);
    }
    else if (result?.account == "group") { pdf.text(`${headerText.toUpperCase()} GROUP REPORT`, (pdf.internal.pageSize.height + 24) / 2, 35) }
    else {
      pdf.text(`${headerText} CLIENT REPORT`, (pdf.internal.pageSize.height + 20) / 2, 35);
    }
    pdf.setFontSize(12);

    // Set tradeDateText based on conditions
    tradeDateText = apiReportData?.event == "getcustomreport" ? `${result.fromdate} - ${result.todate}` : `${apiReportData.data.fromdate} - ${apiReportData.data.todate}`;
    const currentDate = dayjs();
    const formattedDate = currentDate.format('YYYY-MM-DD HH:mm:ss');
    pdf.text(`Report Date :${formattedDate}`, pdf.internal.pageSize.height - 0, 42, 0, 0);
    pdf.text(`Trade Date :${tradeDateText}`, pdf.internal.pageSize.height - 0, 50, 0, 0);
    const exchangeReportText = apiReportData?.event == "getcustomreport" ? `${result?.exchange?.map(obj => `${obj.exchange}`)?.toString()}` : `${apiReportData?.data?.exchange}`
    pdf.text(`${exchangeReportText} Report`, 15, 45)

    // Filter data for USD and generate PDF


    Object.keys(data).map((curr, index) => {
      generateTable(pdf, data[curr], curr, index === 0, index === Object.keys(data).length - 1)
    })
    // if (usdData?.length > 0) generateTable(pdf, usdData, 'USD', true)
    // if (inrData?.length > 0) generateTable(pdf, inrData, 'INR');

    // Save the PDF with a specific filename{
    console.log("Downloading PDF")
    pdf.save(`${headerText}-${tradeDateText}.pdf`);
  };

  const generateTable = (pdf, tableData, currency, withTopMargin, isLastElement) => {

    const columns = Object.keys(tableData[0]);
    // const startY = currency == "USD" ? 50 : pdf.autoTable.previous ? pdf.autoTable.previous.finalY + 200 : 50; // Set a default value if undefined
    const startY = withTopMargin ? pdf.autoTable.previous.finalY + 20 : 0
    // const rows = tableData.map((item) => {
    //   return Object.values(item).map((value, index) => {
    //     // Format numeric values with toFixed(2)
    //     return index !== 0 && !isNaN(value) ? parseFloat(value).toFixed(2) : value;
    //   });
    // });
    const rows = tableData.map((item) => {
      return Object.values(item).map((value, index) => {
        // Format numeric values with toFixed(6) for columns with "rate" in their name
        return index !== 0 && !isNaN(value) && value != 0
          ? columns[index].toLowerCase().includes("rate")
            ? parseFloat(value).toFixed(6)
            : parseFloat(value).toFixed(2)
          : value;
      });
    });

    const totals = {};
    columns.forEach((column, columnIndex) => {
      if (columnIndex !== 0 && !isNaN(tableData[0][column])) {
        // Skip the first column and non-numeric columns
        totals[column] = tableData.reduce((sum, item) => sum + (parseFloat(item[column]) || 0), 0);
      }
    });

    let isFooterRow = false;
    const totalRow = columns.map((key) => (key === columns[0] ? 'Total' : totals[key] !== undefined ? totals[key].toFixed(2) : ''));

    pdf.text(`${currency} Report`, 15, startY + 10); // Adjust the starting position

    pdf.autoTable({
      head: [columns.map(header => header.toUpperCase())],
      body: [...rows, totalRow],
      startY: startY + 20, // Adjust the starting position
      didParseCell: (data) => {
        if (data.row.index === data.table.body.length - 1) {
          isFooterRow = true;
        }
        if (isFooterRow) {
          data.cell.styles.fillColor = '#cce5ff'; // Set your desired background color
          data.cell.styles.fontStyle = 'bold';
        } else {
          if (!isNaN(data.cell.raw)) data.cell.styles.textColor = data.cell.raw > 0 ? "green" : data.cell.raw < 0 && "red"

        }
      },
      styles: { valign: 'middle', fontSize: customReport.account == "company" ? 6 : 8 },
      headStyles: { fontSize: customReport.account == "company" ? 5 : 7 },
      columnStyles: {
        0: { minCellWidth: 15 }, // Adjust the width of the first column
      },
    });

    let currentPage = pdf.internal.getNumberOfPages()
    console.log({ withGraph })
    if (withGraph && downloadType == "singleDownload") {
      const graphCanvas = document.getElementById(`${currency}-Graph`);
      // const canvasImage = graphCanvas.toDataURL('image/jpeg', 1.0);
      // console.log(canvasImage)

      if (graphCanvas) {
        currentPage += 1
        pdf.addPage()
        pdf.setPage(currentPage)
        pdf.addImage(graphCanvas, 'PNG', 15, 15, 370, 130, "", "NONE",);
      }
    }
    if (!isLastElement) {
      pdf.addPage()
      pdf.setPage(currentPage + 1)
    }
  };
  const handleChange = (e) => {
    if (e.target.id === "event") {
      setApiReportData((prev) => ({
        ...prev,
        [e.target.name]: e.target.value,
      }));
    }
    if (e.target.id === "downloadType") {
      // setApiReportData((prev) => ({
      //   ...prev,
      //   [e.target.name]: e.target.value,
      // }));
      setDownloadType(e.target.value)

    }
  };
  const handleFilterChange = (selectValue, filterName) => {
    console.log(selectValue, filterName);
    setApiReportData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        filters: {
          ...prev.data.filters,
          [filterName]: selectValue,
        },
      },
    }));
  };

  const handleOptionsForCustomReport = async (selectValue, filterName) => {
    console.log(selectValue, filterName);
    if (selectValue?.includes("selectAll")) {
      if (filterName == "clusterid") {
        selectValue = filterOptionCustomReport?.clustername?.map((val) => val.id);
      }
      if (filterName == "username" && customReport.account === "client") {
        // if (customReport.account === "client") {

        selectValue = filterOptionCustomReport?.userid?.map((val) => val.Id);
        // }
      }
      if (filterName == "username" && customReport.account === "group") {
        // if (customReport.account === "group") {
        selectValue = filterOptionCustomReport?.groupname?.map((val) => val.Id);
        // }
      }
    }
    setCustomReport(previous => ({
      ...previous,
      [filterName]: selectValue
    }))
    if (filterName == "exchange") {
      console.log("selectValue", selectValue);
      const userApiCall = await Promise.all([
        GET_FILTERS_API({
          "event": "downloadreportfilter",
          "data":
          {
            "filters": {
              "exchange": selectValue
            }
          }
        }),


      ])
      const [filterData] = userApiCall;
      console.log("afterexchange", filterData);

      setfilterOptionCustomReport((previous) => ({
        ...previous,
        userid: filterData.data.result.userid,
        groupname: filterData.data.result.group

      }));
    }



  };


  const handleDatePickerChange = (dates, dateStrings) => {
    // dates[0] is the selected 'from' date, and dates[1] is the selected 'to' date
    const [fromDate, toDate] = dateStrings;

    // Update the state with the selected date range
    setApiReportData((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        fromdate: fromDate,
        todate: toDate,
      },
    }));

    setCustomReport(previous => ({
      ...previous,
      fromdate: fromDate,
      todate: toDate
    }))
  };


  const downloadButtonReset = () => {
    setApiReportData({
      event: "",
      data: {
        fromdate: "",
        todate: "",
        filters: {
          exchange: [],
          groupname: [],
          clustername: [],
          userid: [],
          symbol: [],
        },
      },
    });
  };
  // console.log(
  //   // "apiReportData",
  //   // apiReportData,
  //   " handleDownReport",
  //   handleDownReport,
  //   "downloadData",
  //   downloadData,
  //   "filterOption",
  //   filterOption
  // );

  const accounts = ['client', 'company', 'group', "cosmicmtm"];
  const groupWise = ['symbol', 'userid', 'groupname', 'clustername', 'basecurrency'];

  // console.log('customReport', customReport);

  let clusterOptions = useMemo(() => {
    let cluster = filterOptionCustomReport?.clustername?.map((val) => {
      // console.log(val.clustername);
      return {
        label: val?.clustername,
        value: val?.id,
        // value: val?.id?.toString(),
      };
    });
    cluster?.unshift({ label: "Select All", value: "selectAll" });
    return cluster;
  }, [filterOptionCustomReport?.clustername]);
  let useridOptions = useMemo(() => {
    let userids = filterOptionCustomReport?.userid?.map((val) => {
      // console.log(val.clustername);
      return {
        label: val?.userId,
        value: val?.Id,
        // value: val?.id?.toString(),
      };
    });
    userids?.unshift({ label: "Select All", value: "selectAll" });
    return userids;
  }, [filterOptionCustomReport?.userid]);
  let groupnameOptions = useMemo(() => {
    let groupnames = filterOptionCustomReport?.groupname?.map((val) => {
      // console.log(val.clustername);
      return {
        label: val?.groupname,
        value: val?.Id,
        // value: val?.id?.toString(),
      };
    });
    groupnames?.unshift({ label: "Select All", value: "selectAll" });
    return groupnames;
  }, [filterOptionCustomReport?.groupname]);




  // console.log({ reportOptions: userControlSettings?.page_control })
  const curouselComFiltered = reportOptions.filter(item => {
    const controlSetting = reportOptionTitle[item.title];
    return controlSetting ? userControlSettings?.page_control?.[controlSetting] : true;
  });

  const toFilter = ["tradebook", "netposition", "ledger", "margin"]
  const filteredObject = toFilter.reduce((obj, key) => ({ ...obj, [key]: true }), {});
  const [newReportFormData, setNewReportFormData] = useState({ exchange: [], groupname: [], username: [], ...filteredObject })
  const [groupOrProductWise, setgroupOrProductWise] = useState("group")

  return (
    <div className={`download-section ${repoStyle.downLoadSection}`}>
      <div>
        <Form.Group className={repoStyle.downloadReportSelect}>
          <InputGroup hasValidation>
            <Form.Select
              name="event"
              id="event"
              onChange={handleChange}
              aria-label="Floating label select example"
              value={apiReportData.event}
            >
              <option value="select Report" hidden>Select Report</option>
              {curouselComFiltered.map(e => <option value={e.value}>{e.title}</option>)}
              {/* <option value="newReport">New Report</option> */}
            </Form.Select>
          </InputGroup>
        </Form.Group>

        {apiReportData.event == "newReport" && <Form.Group className={repoStyle.downloadReportSelectToggle}>
          <Form.Check
            type="radio"
            name="wise"
            checked={groupOrProductWise == "group"}
            id="group"
            onChange={(e) => setgroupOrProductWise(e.target.id)}
            label="Group wise"
          ></Form.Check>
          <Form.Check
            type="radio"
            name="wise"
            id="user"
            checked={groupOrProductWise == "user"}
            onChange={(e) => setgroupOrProductWise(e.target.id)}
            label="User wise"
          >

          </Form.Check>


        </Form.Group>}
      </div>
      {apiReportData?.event == "getcustomreport" && <div>
        <Form.Group className={repoStyle.downloadType}>
          <InputGroup hasValidation>
            <Form.Select
              name="downloadType"
              id="downloadType"
              onChange={handleChange}
              aria-label="Floating label select example"
              value={downloadType}
            >
              <option value="select Report" hidden>
                Select Report
              </option>
              <option value="singleDownload">Single Download</option>
              <option value="batchDownload">Batch Download</option>
              {/* <option value="getledger">Ledger</option> */}
              {/* <option value="profitloss">Profit / Loss</option> */}
              {/* <option value="getspreadbook">SpreadBook</option>
              <option value="getsettlementrate">Settlement Rates</option>
              <option value="getcustomreport">Custom Report</option> */}
            </Form.Select>
          </InputGroup>
        </Form.Group>
      </div>}
      <div>
        <div className={repoStyle.downdReportsection}>
          <div className={`${repoStyle.datesinglesection} dateSection`}>
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
                apiReportData.data.fromdate && apiReportData.data.todate
                  ? [
                    dayjs(apiReportData.data.fromdate, "YYYY-MM-DD"),
                    dayjs(apiReportData.data.todate, "YYYY-MM-DD"),
                  ]
                  : null
              }
              // renderExtraFooter={() => "extra footer"}
              allowClear // Set to true if you want to allow clearing the
              className={`${repoStyle.datePicker} datepicker `}
            />
          </div>

          <Row className="mb-3">
            {apiReportData.event == "getnetposition" ||
              apiReportData.event == "gettradebook" ||
              apiReportData.event == "getbackofficetradebook" ||
              apiReportData.event == "getsettlementrate" ? (
              <Form.Group
                className="col-12 mb-3"
              // rules={
              //   apiReportData.event == "gettradebook"
              //     ? selectValidationRules
              //     : null
              // }
              >
                <Select
                  mode="multiple"
                  name="exchange"
                  allowClear
                  value={apiReportData.data.filters.exchange}
                  // value={
                  //   apiReportData.event == "gettradebook"
                  //     ? alert("please enter value")
                  //     : apiReportData.data.filters.exchange
                  // }
                  style={{ width: "100%" }}
                  placeholder="Please select Exchange"
                  onChange={(selectedValues) =>
                    handleFilterChange(selectedValues, "exchange")
                  }
                  options={filterOption?.exchange?.map((val) => {
                    return {
                      label: val,
                      value: val,
                    };
                  })}
                />
              </Form.Group>
            ) : (
              ""
            )}

            {apiReportData.event == "getnetposition" ||
              apiReportData.event == "getledger" ? (
              <Form.Group className="col-12 mb-3">
                <Select
                  mode="multiple"
                  name="groupname"
                  allowClear
                  value={apiReportData.data.filters.groupname}
                  style={{ width: "100%" }}
                  placeholder="Please select groupname"
                  onChange={(selectedValues) =>
                    handleFilterChange(selectedValues, "groupname")
                  }
                  options={filterOption?.groupname?.map((val) => {
                    return {
                      label: val,
                      value: val,
                    };
                  })}
                  className="antdSelect"
                />
              </Form.Group>
            ) : (
              ""
            )}

            {apiReportData.event == "getnetposition" ? (
              <Form.Group className="col-12 mb-3">
                <InputGroup hasValidation>
                  <Select
                    mode="multiple"
                    name="clustername"
                    allowClear
                    style={{ width: "100%" }}
                    value={apiReportData.data.filters.clustername}
                    placeholder="Please select clustername"
                    onChange={(selectedValues) =>
                      handleFilterChange(selectedValues, "clustername")
                    }
                    options={filterOption?.clustername?.map((val) => {
                      return {
                        label: val,
                        value: val,
                      };
                    })}
                    className="antdSelect"
                  />
                </InputGroup>
              </Form.Group>
            ) : (
              ""
            )}

            {["getnetposition", "gettradebook", "getledger", "getspreadbook", "getbackofficetradebook"].includes(apiReportData.event) ? (
              <Form.Group className="col-12 mb-3">
                <Select
                  mode="multiple"
                  name="userid"
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Please select userid"
                  value={apiReportData.data.filters.userid}
                  onChange={(selectedValues) =>
                    handleFilterChange(selectedValues, "userid")
                  }
                  options={filterOption?.userid?.map((val) => {
                    return {
                      label: val,
                      value: val,
                    };
                  })}
                  className="antdSelect"
                />
              </Form.Group>
            ) : null}

            {["getnetposition", "gettradebook", "getsettlementrate", "getbackofficetradebook"].includes(apiReportData.event) ? (
              <Form.Group className="col-12 mb-3">
                <Select
                  mode="multiple"
                  name="symbol"
                  allowClear
                  value={apiReportData.data.filters.symbol}
                  style={{ width: "100%" }}
                  placeholder="Please select symbol"
                  onChange={(selectedValues) =>
                    handleFilterChange(selectedValues, "symbol")
                  }
                  options={filterOption?.symbol?.map((val) => {
                    return {
                      label: val,
                      value: val,
                    };
                  })}
                  className="antdSelect"
                />
              </Form.Group>
            ) : (
              ""
            )}

            {apiReportData.event == "getcustomreport" ? (
              <div>
                <Form.Group className="col-12 mb-3">
                  <Select
                    mode="single"
                    name="account"
                    allowClear
                    value={customReport.account}
                    style={{ width: "100%" }}
                    placeholder="Please select Account"
                    onChange={(selectedValues) =>
                      handleOptionsForCustomReport(selectedValues, "account")
                    }
                    options={accounts.map((val) => {
                      return {
                        label: val,
                        value: val,
                      };
                    })}
                    showSearch={true}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className="antdSelect"
                  />
                </Form.Group>

                <Form.Group className="col-12 mb-3">
                  <Select
                    mode="multiple"
                    name="exchange"
                    allowClear
                    value={customReport.exchange}
                    style={{ width: "100%" }}
                    placeholder="Please select Exchange"
                    onChange={(selectedValues) =>
                      handleOptionsForCustomReport(selectedValues, "exchange")
                    }
                    options={filterOptionCustomReport?.exchange?.map((val) => {
                      return {
                        label: val.exchange,
                        value: val.id,
                      };
                    }).sort((a, b) =>
                      a.label.localeCompare(b.label)
                    )}
                    showSearch={true}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className="antdSelect"
                  />
                </Form.Group>
                {customReport.account == "group" && <Form.Group className="col-12 mb-3">
                  <Select
                    mode="multiple"
                    name="cluster"
                    allowClear
                    value={customReport.clusterid}
                    style={{ width: "100%" }}
                    placeholder="Please select Cluster"
                    onChange={(selectedValues) =>
                      handleOptionsForCustomReport(selectedValues, "clusterid")
                    }
                    options={clusterOptions.sort((a, b) => {
                      if (a.label === "Select All") {
                        return -1; // "Select All" comes first
                      } else if (b.label === "Select All") {
                        return 1; // "Select All" comes first
                      } else {
                        return a.label.localeCompare(b.label);
                      }
                    })}
                    showSearch={true}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className="antdSelect"
                  />
                </Form.Group>}

                {customReport?.account !== "company" && customReport?.account !== "cosmicmtm" && <Form.Group className="col-12 mb-3">
                  <Select
                    mode="multiple"
                    name="username"
                    allowClear
                    value={customReport.username}
                    style={{ width: "100%" }}
                    placeholder="Please select IDS/Group"
                    onChange={(selectedValues) =>
                      handleOptionsForCustomReport(selectedValues, "username")
                    }
                    options={
                      customReport.account === "client"
                        ? useridOptions.sort((a, b) => {
                          if (a.label === "Select All") {
                            return -1; // "Select All" comes first
                          } else if (b.label === "Select All") {
                            return 1; // "Select All" comes first
                          } else {
                            return a.label.localeCompare(b.label);
                          }
                        })
                        : customReport.account === "group"
                          ? groupnameOptions.sort((a, b) => {
                            if (a.label === "Select All") {
                              return -1; // "Select All" comes first
                            } else if (b.label === "Select All") {
                              return 1; // "Select All" comes first
                            } else {
                              return a.label.localeCompare(b.label);
                            }
                          })
                          : []
                    }
                    showSearch={true}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className="antdSelect"
                  />
                </Form.Group>}
                {customReport?.account !== "cosmicmtm" && <Form.Group className="col-12 mb-3">
                  <Select
                    mode="single"
                    name="group_wise"
                    allowClear
                    value={customReport.group_wise}

                    style={{ width: "100%" }}
                    placeholder="Please select groupwise"
                    onChange={(selectedValues) =>
                      handleOptionsForCustomReport(selectedValues, "group_wise")
                    }
                    options={filterOptionCustomReport.group_wise?.map((val) => {
                      return {
                        label: val,
                        value: val,
                      };
                    })}
                    showSearch={true}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    className="antdSelect"
                  />
                </Form.Group>}
                {downloadType === "singleDownload" && <Form.Group className="col-12 mb-3">
                  <Select
                    mode="single"
                    allowClear
                    value={withGraph}
                    style={{ width: "100%" }}
                    placeholder="With Graph"
                    onChange={(selectedValues) => setWithGraph(selectedValues)}
                    options={[{ label: "With Graph", value: true }, { label: "Without Graph", value: false }]}
                    className="antdSelect"
                  />
                </Form.Group>}
              </div>
            ) : ""}

            {apiReportData.event == "newReport" && <NewReportForm toFilter={toFilter} wise={groupOrProductWise} data={newReportFormData} setData={setNewReportFormData} exchangeOptions={filterOptionCustomReport.exchange} />}

          </Row>

          {downloadType !== "batchDownload" && <div className={repoStyle.btnSection}>
            {validate ? (<div>
              <CSVLink {...handleDownReport}>
                <button
                  onClick={() => {
                    downloadButtonReset();
                  }}
                >
                  DOWNLOAD CSV
                </button>
              </CSVLink>
              {apiReportData?.event == "getcustomreport" && <button onClick={() => downloadPDF()}>Download PDF</button>}
            </div>
            ) : (
              <button onClick={() => apiReportData.event == "newReport" ? downloadNewReport(newReportFormData, [apiReportData.data.fromdate, apiReportData.data.todate], setNotifyData, groupOrProductWise) : onClickCsvDownload(handleDownReport)}>
                Download
              </button>
            )}
          </div>}
          {downloadType == "batchDownload" &&
            <div className={repoStyle.btnSection}>

              <button onClick={() => makeAPICallsForArray(handleDownReport)}>
                Fetch & Download
              </button>

            </div>
          }
        </div>
      </div>
      {withGraph && <TableChart data={graphdata} title={headerText} wise={customReport.group_wise} />}
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
};

export default React.memo(DownloadReport);
