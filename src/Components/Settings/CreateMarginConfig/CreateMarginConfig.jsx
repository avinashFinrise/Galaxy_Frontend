import { useEffect, useRef, useState } from "react";
import { FaFileImport } from "react-icons/fa";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { Notification } from "../../DynamicComp/Notification";
import profile from "../ProfilePage/ProfilePage.module.scss";
import {
  GET_USER_SETTINGS_API,
  UPLOAD_TRADEBOOK_API,
} from "../../../API/ApiServices";
import { DatePicker } from "antd";
import { BsCalendar2EventFill, BsCurrencyExchange } from "react-icons/bs";
import dayjs from "dayjs";

const spanExchangeList = ["NSE", "MCX"]

const CreateMarginConfig = (props) => {
  const [spanFilevalidated, setSpanFileValidated] = useState(false);
  const spanFileRef = useRef();


  const [spanFile, setSpanFile] = useState({
    event: "spanfile",
    date: "",
    exchange: "",
    file: "",

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
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };
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




  const handleSpanFileChange = (e) => {
    setSpanFile((prev) => ({
      ...prev,

      [e.target.name]: e.target.name == 'file' ? e.target.files?.[0] : e.target.value,

    }));
  };

  const handleUpload = (e) => {
    e.preventDefault();

    if (spanFileRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
    } else {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Uploading span file...",
      }));
      let formData = new FormData();
      // console.log("spanFile.data.date", spanFile.data.date);
      formData.append("date", spanFile.date);
      formData.append("exchange", spanFile.exchange);
      formData.append("file", spanFile.file);
      formData.append("event", "spanfile");
      const uploadfile = new Promise((resolve, reject) => {
        resolve(UPLOAD_TRADEBOOK_API(formData));
      });
      uploadfile
        .then((res) => {
          // console.log(res);
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
    setSpanFileValidated(true);
  };

  const handleDateChange = (date, dateStrings) => {
    setSpanFile((prev) => ({
      ...prev,
      date: dateStrings,
    }));
  };
  // console.log(marginConfig);

  // console.log({ spanFile });

  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <Form
        // noValidate
        ref={spanFileRef}
        validated={spanFilevalidated}
        onSubmit={handleUpload}
        className={`${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        <Row className={profile.contantSection}>
          <div className="col-md-5">
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <FaFileImport />
              </span>
              Import Span File
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

              // value={span.data.date}
              // value={
              //   span.data.date
              //     ? moment(span.data.date, "YYYY-MM-DD")
              //     : null
              // }
              />

              <Form.Control.Feedback type="invalid">
                {/* {error.date} */}
                select date
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group as={Col} md="2" className={`${profile.rmsDataExchange} ${profile.historySingleItem}`}>
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
                value={spanFile.exchange}
                onChange={handleSpanFileChange}
                aria-label="Floating label select example"
                required
              >
                <option value="" hidden>
                  Select Exchange
                </option>
                <option value="NSE">NSE</option>
                <option value="MCX">MCX</option>
                {/* {spanExchangeList?.map((val) => {
                  return (
                    <option key={val.id} value={val.id}>
                      {val.exchange}
                    </option>
                  );
                })} */}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please Select Exchange.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="2" className={profile.historySingleItem}>
            <InputGroup hasValidation>
              <Form.Control
                type="file"
                name="file"
                onChange={handleSpanFileChange}
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
                  confirmMsg: "Are you sure, You want to upload span file?",
                  confirmAction: (e) =>
                    handleUpload(e)
                }))
              }}
            />
          </div>
        </Row>
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

export default CreateMarginConfig;
