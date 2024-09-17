import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import profile from "../ProfilePage/ProfilePage.module.scss";
import {
  GET_EXCHANGE_API,
  GET_UPDATESETTLEMENT_API,
  GET_USER_SETTINGS_API,
  UPDATESETTLEMENT_API,
} from "../../../API/ApiServices";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { DatePicker } from "antd";
import { AgGridReact } from "ag-grid-react";
import { Notification } from "../../DynamicComp/Notification";
import dayjs from "dayjs";
import { BsCalendar2EventFill, BsCurrencyExchange } from "react-icons/bs";
import { FaHandsHelping } from "react-icons/fa";
// import { FaCloudUploadAlt, BsCalendar2EventFill, BsCurrencyExchange } from "react-icons/bs";

const ViewSettlement = () => {
  const [settlementApiData, setSettlementApiData] = useState({
    event: "getnetposition",
    data: {
      fromdate: "",
      todate: "",
      filters: {
        exchange: [],
        symbol: [],
      },
    },
  });
  const [changedSettlement, setChangedSettlement] = useState([])
  const [groupConfigApiData, setGroupConfigApiData] = useState({
    exchange: [],
    // securityType: [],
    // group: [],
    // cluster: [],
    // brokType: ["CR", "LOT"],
  });
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [dateAndExchange, setDateAndExchange] = useState({
    date: "",
    exchange: ""
  })
  const [userdate, setUserdate] = useState();
  const [settlementData, setSettlementData] = useState([]);

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
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };
  const viewSettlement = async (e) => {
    e.preventDefault();

    if (formRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
      // setNotifyData((data) => ({
      //   ...data,
      //   errorFlag: true,
      //   errorMsg: "Please Fill All Fields",
      // }));
    } else {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Fetching settlement Data...",
      }));
      try {
        console.log("dateAndExchange", dateAndExchange);
        const apicall = await GET_UPDATESETTLEMENT_API(dateAndExchange);
        console.log("download", apicall);
        if (apicall) {
          setSettlementData(apicall.data.result);
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              confirmFlag: false,
              successFlag: true,
              successMsg: apicall.data.status,
              // successMsg: "fetch success",
            };
          });
        }

        // setSettlementApiData({
        //   event: "getsettlementrate",
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
            confirmFlag: false,
            errorFlag: true,
            errorMsg: error.response?.data.reason,
            headerMsg: error.code,
          };
        });
      }
    }
    setValidated(true);
  };

  useEffect(() => {
    (async () => {
      const groupApiData = await Promise.all([
        GET_EXCHANGE_API(),
        GET_USER_SETTINGS_API()
      ])
      const [
        exchangeData,
        getDate

      ] = groupApiData;
      // const getDate = await GET_USER_SETTINGS_API();
      // console.log(getDate.data.result[0].createddate);
      if (getDate) {
        setUserdate(dayjs(getDate.data.result[0].date_range.fromdate));
      }
      if (exchangeData) {
        setGroupConfigApiData((previous) => (
          {
            ...previous,
            exchange: exchangeData.data.result
          }
        ))
      }
    })();
  }, []);

  const handleDateChange = (date, dateStrings) => {
    // console.log(dateStrings);
    setDateAndExchange((prev) => ({
      ...prev,

      date: dateStrings,

    }));
  };
  const handleChange = (e) => {
    console.log("e", e);
    // const [fromDate, toDate] = dateString;
    // console.log("dateStrings", e, dateString);
    setDateAndExchange((prevState) => ({
      ...prevState,
      exchange: e.target.value
    }));
  };
  // settlementData.forEach((item) => {
  //   settlementData.length > 0
  //     ? Object.keys(item).forEach((key) => {
  //         console.log(`${key}`);
  //       })
  //     : null;
  // });

  const columnDefs = useMemo(() => {
    // return [
    //   { field: "basecurrency", headerName: "basecurrency" },
    //   { field: "digits", headerName: "digits" },
    //   { field: "divider", headerName: "divider" },
    //   { field: "exchange", headerName: "exchange" },
    //   { field: "expirydate", headerName: "expirydate" },
    //   { field: "lotsize", headerName: "lotsize" },
    //   { field: "multiplier", headerName: "multiplier" },
    //   { field: "opttype", headerName: "opttype" },
    //   { field: "scripcode", headerName: "scripcode" },
    //   { field: "security desc.", headerName: "security desc." },
    //   { field: "securitytype", headerName: "securitytype" },
    //   { field: "settlecurrency", headerName: "settlecurrency" },
    //   { field: "settlement_price", headerName: "settlement_price" },
    //   { field: "strikeprice", headerName: "strikeprice" },
    //   { field: "symbol", headerName: "symbol" },
    //   { field: "ticksize", headerName: "ticksize" },
    //   { field: "token", headerName: "token" },
    // ];
    let columns = [];
    //   if (settlementData.length > 0) {
    //     for (let key in settlementData[0]) {
    //       columns.push({
    //         field: key,
    //         headerName: key.toUpperCase(),
    //         sortable: true,
    //         filter: true,
    //       });
    //     }
    //   }
    //   return columns;
    // }, [settlementData]);
    if (settlementData.length > 0) {
      for (let key in settlementData[0]) {
        let existingColumnIndex = columns.findIndex((col) => col.field === key);
        if (existingColumnIndex > -1) {
          if (key === "settlementrate") {
            columns[existingColumnIndex] = {
              ...columns[existingColumnIndex],
              editable: true,
              headerName: key.toUpperCase(),
              cellEditor: "agNumberCellEditor",
              valueFormatter: (params) => params.value,
              cellEditorParams: {

                // precision: 2,
              },
            }
          }
        }
        else {
          if (key == "settlementrate") {
            columns.push({
              field: key,
              editable: true,
              headerName: key.toUpperCase(),
              cellEditor: "agNumberCellEditor",
              valueFormatter: (params) => params.value,
              cellEditorParams: {
                // min: 1,
                // max: 100,
                // precision: 2,
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
  }, [settlementData]);


  const gridRef = useRef();
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
    return params.data.token;
  });
  useEffect(() => {
    console.log("setChangedSettlement", changedSettlement);
  }, [changedSettlement])

  // console.log(settlementData);
  const onCellValueChanged = async (params) => {
    // const clientLimit = params;
    console.log("changedRow", params.data);
    let { date, token, settlementrate, ...paramsobjectCopy } = { ...params.data }
    setChangedSettlement(prev => ([
      ...prev,
      {
        "date": date,
        "token": token,
        "settlementrate": settlementrate

      }]
    ))
    console.log("paramsobjectCopy", date, token, settlementrate);
    // setNotifyData((data) => ({
    //   ...data,
    //   loadingFlag: true,
    //   loadingMsg: "updating settlement Data...",
    // }))
    // try {
    //   const settlementUpdatePost = await UPDATESETTLEMENT_API({
    //     event: "update",
    //     data: {
    //       "date": date,
    //       "token": token,
    //       "settlementrate": settlementrate

    //     }
    //   })
    //   console.log("settlementUpdatePost", settlementUpdatePost);
    //   setNotifyData((prev) => {
    //     return {
    //       ...prev,
    //       loadingFlag: false,
    //       // confirmFlag: false,
    //       successFlag: true,
    //       successMsg: settlementUpdatePost.data.status,
    //       // successMsg: "fetch success",
    //     };
    //   });
    // } catch (error) {
    //   console.log("error", error);
    //   setNotifyData((prev) => {
    //     return {
    //       ...prev,
    //       loadingFlag: false,
    //       // confirmFlag: false,
    //       errorFlag: true,
    //       errorMsg: error.response?.data.reason,
    //       headerMsg: error.code,
    //     };
    //   });
    // }
  }
  const updateSettlement = async () => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "updating settlement Data...",
    }))
    try {
      const settlementUpdatePost = await UPDATESETTLEMENT_API({
        event: "update",
        date: dateAndExchange?.date,
        data: changedSettlement
      })
      setChangedSettlement([])
      // console.log("settlementUpdatePost", settlementUpdatePost);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          confirmFlag: false,
          successFlag: true,
          successMsg: settlementUpdatePost.data.status,
          // successMsg: "fetch success",
        };
      });
    } catch (error) {
      console.log("error", error);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          confirmFlag: false,
          errorFlag: true,
          errorMsg: error.response?.data.reason,
          headerMsg: error.code,
        };
      });
    }
  }
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <Form
        ref={formRef}
        validated={validated}
        onSubmit={viewSettlement}
        className={`${profile.basicInfoSetting} ${profile.headingSection}`}

      >
        <Row className={profile.contantSection}>
          <div className="col-md-4">
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <FaHandsHelping />
              </span>
              View Settlement
            </h5>
          </div>
          {/* <div className={`col-md-4 ${profile.historyDateSection}`}> */}
          <Form.Group as={Col} md="3" className={`${profile.rmsDataExchange} ${profile.historySingleItem}`}>
            <Form.Label className={profile.moblabel}>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsCalendar2EventFill />
              </span>
              Date
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <DatePicker
                required
                name="date"
                format="YYYY-MM-DD" // Specify the date format
                placeholder="Select Date"
                allowClear // Set to true if you want to allow clearing the
                className={`${profile.datePicker} datepicker `}
                value={
                  dateAndExchange.date
                    ?
                    dayjs(dateAndExchange.date, "YYYY-MM-DD")
                    : null
                }

                disabledDate={(current) => {
                  // return userdate && current < userdate.startOf("day");
                  if (userdate && dayjs(userdate).isValid()) {
                    return current.isBefore(userdate.startOf("day")) || current > Date.now();
                  }
                  return false;
                }}
                onChange={handleDateChange}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="3" className={`${profile.rmsDataExchange} ${profile.historySingleItem}`}>
            <Form.Label className={profile.moblabel}>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsCurrencyExchange />
              </span>
              Exchange
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="exchange"
                value={dateAndExchange.exchange}
                onChange={handleChange}
                aria-label="Floating label select example"
                // defaultValue={"Select exchange"}
                required
              >
                <option value="" hidden>
                  Select exchange
                </option>
                {groupConfigApiData.exchange.map((val) => (
                  <option key={val.exchange} value={val.exchange}>
                    {val.exchange}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please Select Exchange.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className={`col-md-1 ${profile.viewSettlementBtn}`}>
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="View"
              onClick={viewSettlement}
            />
          </div>
          <div className={`col-md-1 ${profile.viewSettlementBtn}`}>
            <input
              type="button"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Update"
              // onClick={updateSettlement}
              onClick={(e) => {
                e.preventDefault();
                setNotifyData((data) => ({
                  ...data,
                  confirmFlag: true,
                  confirmMsg: "Are you sure, You want to update settlement?",
                  confirmAction: (e) =>
                    updateSettlement(e)
                }))
              }}
            />
          </div>
        </Row>
        {/* </div> */}

      </Form>
      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      // className={` ${profile.marginTable} `}
      >
        {settlementData && (
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={settlementData}
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
        CloseConfirm={CloseConfirm}
      />
    </div >
  );
};

export default memo(ViewSettlement);
