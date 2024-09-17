import { DatePicker } from "antd";
import dayjs from "dayjs";
import { memo, useEffect, useRef, useState } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { AiFillAccountBook } from "react-icons/ai";
import { BsCalendar2EventFill } from "react-icons/bs";
import {
  GET_EXCHANGE_API,
  GET_USER_SETTINGS_API,
  UPLOAD_TRADEBOOK_API
} from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import profile from "../ProfilePage/ProfilePage.module.scss";

const ImportTradeBook = (props) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [traderBook, setTraderBook] = useState({
    event: "tradbook",
    data: {
      date: "",
      sender: "",
      file: "",
      headerstype: "default"
    },
  });
  const [userdate, setUserdate] = useState();

  const [exchangeApi, setExchangeApi] = useState([]);
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
  useEffect(() => {
    (async () => {
      try {
        // const apiCall = await GET_EXCHANGE_API();
        const apiCall = await Promise.all([
          GET_EXCHANGE_API(),
          GET_USER_SETTINGS_API(),
        ]);
        const [exchangeDate, userfromdate] = apiCall;
        if (exchangeDate) {
          setExchangeApi(exchangeDate.data.result);
        }
        if (userfromdate) {
          setUserdate(dayjs(userfromdate.data.result[0].date_range.fromdate));
        }
      } catch (error) {
        console.log("apiCall", error);
      }
    })();
  }, []);

  const handleUpload = (e) => {
    e.preventDefault();

    if (formRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
    } else {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Uploading trade file...",
      }));
      let formData = new FormData();
      // console.log("traderBook.data.date", traderBook.data.date);
      formData.append("date", traderBook.data.date);
      formData.append("sender", traderBook.data.sender);
      formData.append("file", traderBook.data.file);
      formData.append("event", "tradebook");
      formData.append("headerstype", traderBook.data.headerstype || "default")

      console.log(traderBook.data)
      console.log(formData)

      const uploadfile = new Promise((resolve, reject) => {
        resolve(UPLOAD_TRADEBOOK_API(formData));
      });

      uploadfile
        .then((res) => {
          console.log(res);
          if (res.status === 200) {
            setNotifyData((prev) => {
              return {
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                successFlag: true,
                successMsg: res.data.status,
              };
            });
          }
        })
        .catch((err) => {
          console.log(err);
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              confirmFlag: false,
              errorFlag: true,
              errorMsg: err.response?.data.reason,
              headerMsg: err.code,
            };
          });
        });
    }
    setValidated(true);
  };

  const handleChange = (e) => {
    setTraderBook((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [e.target.name]: e.target.name == 'file' ? e.target.files?.[0] : e.target.value,
      },
    }));
  };
  const handleDateChange = (date, dateStrings) => {
    setTraderBook((prev) => ({
      ...prev,
      data: {
        date: dateStrings,
      },
    }));
  };
  // console.log("exchangeApi", traderBook);
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <Form
        // noValidate
        ref={formRef}
        validated={validated}
        onSubmit={handleUpload}
        className={`${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        <Row className={profile.contantSection}>
          <div className="col-md-5">
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <AiFillAccountBook />
              </span>
              Import Trade
            </h5>
          </div>
          <Form.Group
            as={Col}
            md="2"
            className={`${profile.rmsDateSection} ${profile.historySingleItem}`}
          >
            <Form.Label className={profile.moblabel}>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsCalendar2EventFill />
              </span>
              Date
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <DatePicker
                onChange={handleDateChange}
                format="YYYY-MM-DD" // Specify the date format
                placeholder={"Date"}
                allowClear // Set to true if you want to allow clearing the
                className={profile.datePicker}
                disabledDate={(current) => {
                  return current.isBefore(userdate.startOf("day")) || current > Date.now();
                }}
                required

              // value={traderBook.data.date}
              // value={
              //   traderBook.data.date
              //     ? moment(traderBook.data.date, "YYYY-MM-DD")
              //     : null
              // }
              />

              <Form.Control.Feedback type="invalid">
                {/* {error.date} */}
                select date
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group as={Col} md="2" className={`${profile.rmsDataExchange} ${profile.historySingleItem}`} >
            <Form.Label className={profile.moblabel}>
              <span className={`label-icon ${profile.labelIcon}`}>  </span> Type
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <Form.Select
              name="headerstype"
              value={traderBook.data.headerstype}
              onChange={handleChange}
              aria-label="Floating label select example"
              required
            >
              <option value="default"> Default </option>
              <option value="mt5"> mt5 </option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please Select Type
            </Form.Control.Feedback>
          </Form.Group>

          {/* <Form.Group
            as={Col}
            md="2"
            className={`${profile.rmsDataExchange} ${profile.historySingleItem}`}
          >
            <Form.Label className={profile.moblabel}>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsCurrencyExchange />
              </span>
              Exchange
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <Form.Select
              name="exchange"
              value={traderBook.data.exchange}
              onChange={handleChange}
              aria-label="Floating label select example"
              required
            >
              <option value="" hidden>
                Select Exchange
              </option>
              {exchangeApi &&
                exchangeApi.map((val) => {
                  return (
                    <option key={val.id} value={val.exchange}>
                      {val.exchange}
                    </option>
                  );
                })}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please Select Exchange
            </Form.Control.Feedback>
          </Form.Group> */}
          {/* <Form.Group
            as={Col}
            md="2"
            className={`${profile.rmsDataExchange} ${profile.historySingleItem}`}
          >
            <Form.Label className={profile.moblabel}>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              Sender name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <Form.Control
              type="text"
              className="form-control"
              name="sender"
              placeholder="Enter sendername"
              onChange={handleChange}
              required
              value={traderBook.data.sender}
            />
            <Form.Control.Feedback type="invalid">
              enter sender name
            </Form.Control.Feedback>
          </Form.Group> */}
          <Form.Group as={Col} md="2" className={profile.historySingleItem}>
            <InputGroup hasValidation>
              <Form.Control
                type="file"
                name="file"
                onChange={handleChange}
                required
              />
              <Form.Control.Feedback type="invalid">
                Select File
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="col-md-1">
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Upload"
              // onClick={handleUpload}
              onClick={(e) => {
                e.preventDefault();
                setNotifyData((data) => ({
                  ...data,
                  confirmFlag: true,
                  confirmMsg: "Are you sure, You want to upload file?",
                  confirmAction: (e) =>
                    handleUpload(e)
                }))
              }}
            />
          </div>
        </Row>
        <h6
          onClick={() => props.toggleVisibility()}
          className={profile.hideShowtoggle}
        >
          {props.visibility ? "Hide " : "Show "}
          Trade History
        </h6>
      </Form>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
    </div>
  );
};

export default memo(ImportTradeBook);
