import { useRef, useState } from 'react'
import { BsCalendar2EventFill } from "react-icons/bs";
import { FaHandHoldingUsd } from "react-icons/fa";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import profile from "../ProfilePage/ProfilePage.module.scss";
import { DatePicker } from "antd";
import {
  CREATE_USDRATE_API,
} from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import { GiTwoCoins } from 'react-icons/gi';

function UsdRate(props) {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [errorMessage, setErrorMessage] = useState("Select Date");
  const [usdRate, setUsdRate] = useState({
    event: "create",
    data: {
      date: "",
      rate: 0,
    },
  });


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
  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log("check", formRef.current.checkValidity());

    if (formRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
    } else {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Uploading settlement file...",
      }));


      const uploadfile = new Promise((resolve, reject) => {
        resolve(CREATE_USDRATE_API(usdRate));
      });
      uploadfile
        .then((res) => {
          console.log(res);
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              confirmFlag: false,
              successFlag: true,
              successMsg: res.data.status,
            };
          });

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

    setUsdRate((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [e.target.name]: Number(e.target.value),
      },
    }));
  };

  const handleDateChange = (date, dateStrings) => {
    setUsdRate((prev) => ({
      ...prev,
      data: {
        date: dateStrings,
      },
    }));
  };

  // console.log({ usdRate });
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <Form
        ref={formRef}
        validated={validated}
        onSubmit={handleSubmit}

        className={`${profile.basicInfoSetting} ${profile.headingSection}`}
      >
        <Row className={profile.contantSection}>
          <div className="col-md-6">
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <FaHandHoldingUsd />
              </span>
              USD Rate
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
              />
              <Form.Control.Feedback type="invalid">
                Please Select Date
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group
            as={Col}
            md="2"
            className={`${profile.rmsDataExchange} ${profile.historySingleItem}`}
          >
            <Form.Label className={profile.moblabel}>
              <span className={`label-icon ${profile.labelIcon}`}>
                <GiTwoCoins />
              </span>
              Rate
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>

              <Form.Control
                type="number"
                className="form-control"
                name="rate"
                placeholder="Enter rate"
                onChange={handleChange}
                value={usdRate.data.rate}
              />
              <Form.Control.Feedback type="invalid">
                Please enter usd rate
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <div className="col-md-2">
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Create Rate"
              onClick={handleSubmit}
            // onClick={(e) => {
            //   e.preventDefault();
            //   setNotifyData((data) => ({
            //     ...data,
            //     confirmFlag: true,
            //     confirmMsg: "Are you sure, You want to create usd rate?",
            //     confirmAction: (e) =>
            //       handleSubmit(e)
            //   }))
            // }}
            />
          </div>
        </Row>
        <h6
          onClick={() => props.toggleVisibility()}
          className={profile.hideShowtoggle}
        >
          {props.visibility ? "Hide " : "Show "}
          USDRATE History
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
}

export default UsdRate