import { memo, useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import profile from "../ProfilePage/ProfilePage.module.scss";
import {
  GET_EXCHANGE_API,
  GET_USER_SETTINGS_API,
  UPLOAD_TRADEBOOK_API,
} from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import dayjs from "dayjs";

const ImportSettlement = (props) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [errorMessage, setErrorMessage] = useState("Select Date");
  const [imprtsettlement, setImprtsettlement] = useState({
    event: "settlement",
    data: {
      date: "",
      exchange: "",
      file: "",
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
  useEffect(() => {
    (async () => {
      try {
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
      setNotifyData((data) => ({ ...data }));
    } else {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Uploading settlement file...",
      }));
      let formData = new FormData();
      // console.log("imprtsettlement.data.date", imprtsettlement.data.date);
      formData.append("date", imprtsettlement.data.date);
      // formData.append("exchange", imprtsettlement.data.exchange);
      // formData.append("file", imprtsettlement.data.file);
      formData.append("event", "settlement");

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
                // confirmFlag: false,
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
              // confirmFlag: false,
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
    setImprtsettlement((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleDateChange = (date, dateStrings) => {
    setImprtsettlement((prev) => ({
      ...prev,
      data: {
        date: dateStrings,
      },
    }));
  };
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <Form
        ref={formRef}
        validated={validated}
        onSubmit={handleUpload}
        // onSubmit={(e) => handleSubmit(e)}
        // onSubmit={(e) => {
        //   e.preventDefault();
        //   setNotifyData((data) => ({
        //     ...data,
        //     confirmFlag: true,
        //     confirmMsg: "Are you sure, You want to update imprtsettlement ?",
        //     confirmAction: (e) => handleSubmit(e),
        //   }));
        // }}
        className={`${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        {/* <Row className={profile.contantSection}>
          <div className="col-md-7">
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <FaCloudUploadAlt />
              </span>
              Settlement
            </h5>
          </div>
          <Form.Group
            as={Col}
            md="2"
            controlId="validationCustomDate"
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
                  return current.isBefore(userdate, "day");
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errorMessage}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group> */}
        {/* <Form.Group
            as={Col}
            md="2"
            controlId="validationCustomExchange"
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
              value={imprtsettlement.data.exchange}
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
          </Form.Group>
          <Form.Group
            as={Col}
            md="2"
            controlId="validationCustomSettkementFile"
            className={profile.historySingleItem}
          >
            <InputGroup hasValidation>
              <Form.Control
                type="file"
                name="file"
                onChange={handleChange}
                value={imprtsettlement.data.file}
                required
                // className={profile.fileSelect}
              />
              <Form.Control.Feedback type="invalid">
                Select File
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group> */}
        {/* <div className="col-md-2">
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Generate Settlement File"
              onClick={handleUpload}
            />
          </div>
        </Row> */}
        <h6
          onClick={() => props.toggleVisibility()}
          className={profile.hideShowtoggle}
        >
          {props.visibility ? "Hide " : "Show "}
          Settlement History
        </h6>
      </Form>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
};

export default memo(ImportSettlement);
