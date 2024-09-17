import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { Notification } from "../../DynamicComp/Notification";
import { BsCurrencyExchange } from "react-icons/bs";
import { FaHandshake, FaUser } from "react-icons/fa";

import { GiSandsOfTime, GiTwoCoins } from "react-icons/gi";
import profile from "../ProfilePage/ProfilePage.module.scss";
import { FaSackDollar } from 'react-icons/fa6';
import { CREATE_MARGINRATE_API, GET_EXCHANGE_API, GET_FILTERS_API } from '../../../API/ApiServices';

const MarginRate = (props) => {
  const [validated, setValidated] = useState(false);
  const [marginRateApi, setMarginRateApi] = useState({
    symbols: [],
    exchange: [],
  });
  const [marginRate, setMarginRate] = useState({
    event: "create",
    data: {
      symbol: "",
      exchange: "",
      margin_rate: '',
      exchange_id: ''
    },
  });
  const formRef = useRef();
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
    const exchangelist = new Promise((resolve, reject) => {
      resolve(GET_EXCHANGE_API())
    })
    exchangelist.then(res => {
      // console.log({ res });
      setMarginRateApi(prev => ({ ...prev, exchange: res.data.result }))
    }).catch(err => {
      console.log({ err });
    })
  }, [])
  const fetchSymbol = useCallback((value) => {
    const symbollist = new Promise((resolve, reject) => {
      resolve(GET_FILTERS_API({
        event: "getselectedfilters",
        data: {
          filters: {
            exchange: [value],
          },
        },
      }))
    })
    symbollist.then(res => {
      // console.log({ res });
      setMarginRateApi(prev => ({ ...prev, symbols: res.data.result.symbols }))
    }).catch(err => {
      console.log({ err });
    })
  }, [])

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
        resolve(CREATE_MARGINRATE_API(marginRate));
      });
      uploadfile
        .then((res) => {
          // console.log(res);
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
    const { name, value } = e.target;
    // setMarginRate((prev) => ({
    //   ...prev,
    //   data: {
    //     ...prev.data,
    //     [name]: value,
    //     // [e.target.name]:
    //     //   e.target.name === "exchange" ||
    //     //     e.target.name === "margin_rate"
    //     //     ? +e.target.value
    //     //     : e.target.value,
    //   },
    // }));
    if (name === "exchange") {
      const selectedExchange = marginRateApi.exchange.find(exchange => exchange.exchange === value);

      setMarginRate((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [name]: value,
          exchange_id: selectedExchange ? selectedExchange.id : '',
        },
      }));

      fetchSymbol(value);
    } else {
      setMarginRate((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [name]: value,
        },
      }));
    }

  };

  // console.log(marginRateApi, marginRate);

  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <FaSackDollar />
        </span>
        Margin Rate
      </h5>
      <Form
        ref={formRef}
        validated={validated}
        onSubmit={handleSubmit}
        className={profile.basicInfoSetting}
      >
        <Row className="mb-1">

          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsCurrencyExchange />
              </span>
              Exchange
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="exchange"
                value={marginRate.data.exchange}
                onChange={(e) => {
                  handleChange(e);
                  fetchSymbol(e.target.value);
                }}
                // onChange={handleChange}
                aria-label="Floating label select example"
                required
              >
                <option value="" hidden>
                  Select Exchange
                </option>
                {marginRateApi.exchange?.map((val) => {
                  return (
                    <option key={val.id} value={val.exchange}>
                      {val.exchange}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please Select Exchange.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaHandshake />
              </span>
              Symbol
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="symbol"
                value={marginRate.data.symbol}
                onChange={handleChange}
                aria-label="Floating label select example"
                required
              >
                <option value="" hidden>
                  Select Symbol
                </option>
                {/* {uniqueSymbols?.map((val) => {
                  return <option value={val}>{val}</option>;
                })} */}
                {marginRateApi.symbols?.map((val) => {
                  return (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  );
                })
                }
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select symbol
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <GiTwoCoins />
              </span>
              Margin_Rate
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="number"
                placeholder="Margin Rate"
                // pattern="[^\s]+"
                name="margin_rate"
                onChange={handleChange}
                // value={marginConfig.data.allowed}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please enter margin rate
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>



        </Row>
        <div className={profile.configBtnSection}>
          <input
            type="submit"
            className={`basic-InfoBtn ${profile.basicInfoBtn}`}
            value="Create"

            onClick={(e) => {
              e.preventDefault();
              setNotifyData((data) => ({
                ...data,
                confirmFlag: true,
                confirmMsg: "Are you sure, You want to create margin rate?",
                confirmAction: (e) =>
                  handleSubmit(e)
              }))
            }}
          />
        </div>
        <h6
          onClick={() => props.toggleVisibility()}
          className={profile.hideShowtoggle}
        >
          {props.visibility ? "Hide " : "Show "}
          Margin Rate data
        </h6>
      </Form>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
    </div>
  )
}

export default MarginRate