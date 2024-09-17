import { useEffect, useRef, useState } from "react";
import { FaHandshake, FaRegChartBar, FaUser } from "react-icons/fa";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import { Notification } from "../../DynamicComp/Notification";
import {
    CREATE_MARGIN_CONFIG_API,
    GET_CLUSTER_API,
    GET_EXCHANGE_API,
    GET_FILTERS_API,
    GET_GROUP_API,
    GET_USERID_MASTER,
    GET_USER_SETTINGS_API,
} from "../../../API/ApiServices";
import { DatePicker } from "antd";
import { BsCalendar2EventFill, BsCurrencyExchange } from "react-icons/bs";
import dayjs from "dayjs";
import { GiSandsOfTime } from "react-icons/gi";
import profile from "../ProfilePage/ProfilePage.module.scss";




const LimitAllotment = (props) => {
    const [validated, setValidated] = useState(false);
    const formRef = useRef();
    const [marginConfig, setMarginConfig] = useState({
        event: "create",
        data: {
            date: new Date().toISOString().split("T")[0],
            userid: "",
            // clustername: "",
            symbol: "",
            // margintype: "",
            allowed: "",
            userid_id: "",
            // group: "",
            // cluster: "",
            exchange: "",
        },
    });
    const [marginConfigApi, setMarginConfigApi] = useState({
        userIds: [],
        clusters: [],
        symbols: [],
        groupname: [],
        exchange: [],
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
            try {
                const groupApiData = await Promise.all([
                    GET_USERID_MASTER(),
                    GET_CLUSTER_API(),
                    // GET_NETPOSITION_API({
                    //   event: "getallsymbols",
                    //   data: {},
                    // }),
                    GET_FILTERS_API({
                        event: "getselectedfilters",
                        data: {
                            filters: {
                                exchange: [],
                                groupname: [],
                                symbol: [],
                            },
                        },
                    }),
                    GET_GROUP_API(),
                    GET_EXCHANGE_API(),
                    GET_USER_SETTINGS_API(),
                ]);
                const [
                    userIdData,
                    clusterData,
                    symbolData,
                    groupData,
                    exchangeData,
                    userfromdate,
                ] = groupApiData;
                // console.log(
                //   // userIdData,
                //   // clusterData,
                //   symbolData
                //   // groupData,
                //   // exchangeData
                // );
                if (userIdData) {
                    setMarginConfigApi((previous) => ({
                        ...previous,
                        // data: {
                        //   ...previous.data,
                        userIds: userIdData.data.result,
                        // },
                    }));
                }
                if (clusterData) {
                    setMarginConfigApi((previous) => ({
                        ...previous,
                        // data: {
                        //   ...previous.data,
                        clusters: clusterData.data.result,
                        // },
                    }));
                }
                if (symbolData) {
                    // console.log(symbolData);
                    setMarginConfigApi((previous) => ({
                        ...previous,
                        // data: {
                        //   ...previous.data,
                        symbols: symbolData.data.result.symbols,
                        // },
                    }));
                }
                if (groupData) {
                    setMarginConfigApi((previous) => ({
                        ...previous,
                        // data: {
                        //   ...previous.data,
                        groupname: groupData.data.result,
                        // },
                    }));
                }
                if (exchangeData) {
                    setMarginConfigApi((previous) => ({
                        ...previous,
                        // data: {
                        //   ...previous.data,
                        exchange: exchangeData.data.result,
                        // },
                    }));
                }
                if (userfromdate) {
                    setUserdate(dayjs(userfromdate.data.result[0].date_range.fromdate));
                }
            } catch (error) {
                console.log("error", error);
            }
        })();
    }, []);
    const uniqueSymbols = [
        ...new Set(marginConfigApi?.symbols?.map((val) => val)),
    ];
    const handleMarginAllotment = async (e) => {
        e.preventDefault();
        if (formRef.current.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setNotifyData((data) => ({ ...data, confirmFlag: false }));
        } else {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "Creating Margin config....",
            }));
            const createMarginConfig = new Promise((resolve, reject) => {
                resolve(CREATE_MARGIN_CONFIG_API(marginConfig));
            });
            createMarginConfig
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
        // makeApiCall(CREATE_GROUP_CONFIG_API(groupConfigDetails));
    };
    const handleDatePickerChange = (date, dateStrings) => {
        setMarginConfig((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                date: dateStrings,
            },
        }));
    };
    const handleChange = (e) => {
        setMarginConfig((prev) => ({
            ...prev,
            data: {
                ...prev.data,
                // [e.target.name]: e.target.value,
                [e.target.name]:
                    e.target.name === "allowed" ||
                        e.target.name === "group" ||
                        e.target.name === "exchange"
                        ? +e.target.value
                        : e.target.value,
            },
        }));
    };
    // console.log("marginConfigApi", marginConfigApi)
    return (
        <div className={`basic-forminfo ${profile.basicInfo}`}>
            <h5 className={profile.basicHeading}>
                <span className={profile.icons}>
                    <GiSandsOfTime />
                </span>
                Create Limit Allotment
            </h5>
            <Form
                ref={formRef}
                validated={validated}
                onSubmit={handleMarginAllotment}
                className={profile.basicInfoSetting}
            >
                <Row className="mb-1">
                    <Form.Group as={Col} md="6" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <BsCalendar2EventFill />
                            </span>
                            Date
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <InputGroup
                            hasValidation
                        // className={profile.userConfigUserId}
                        >
                            <DatePicker
                                onChange={handleDatePickerChange}
                                format="YYYY-MM-DD"
                                placeholder={"Date"}
                                // renderExtraFooter={() => "extra footer"}
                                allowClear
                                // defaultValue={dayjs(dayjs().format("YYYY-MM-DD"))}
                                value={dayjs(marginConfig.data.date, "YYYY-MM-DD")}
                                disabledDate={(current) => {
                                    return current.isBefore(userdate.startOf("day")) || current > Date.now();
                                }}
                                className={profile.datePicker}
                            />
                            <Form.Control.Feedback type="invalid">
                                Please select date
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
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
                                value={marginConfig.data.exchange}
                                onChange={handleChange}
                                aria-label="Floating label select example"
                                required
                            >
                                <option value="" hidden>
                                    Select Exchange
                                </option>
                                {marginConfigApi.exchange?.map((val) => {
                                    return (
                                        <option key={val.id} value={val.id}>
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
                    {marginConfig.data.exchange &&
                        (
                            marginConfigApi.exchange.find(
                                (exchange) => exchange.id === +marginConfig.data.exchange
                            ) && (
        ["NSEFO", "MCX"].includes(marginConfigApi.exchange.find(
            (exchange) => exchange.id === +marginConfig.data.exchange
        ).exchange) || marginConfigApi.exchange.find(
            (exchange) => exchange.id === +marginConfig.data.exchange
        ).currency !== "INR"
    )
) && (
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
                                        value={marginConfig.data.symbol}
                                        onChange={handleChange}
                                        aria-label="Floating label select example"
                                        required
                                    >
                                        <option value="" hidden>
                                            Select Symbol
                                        </option>
                                        {(+marginConfig.data.exchange=="14"? ["NA",...uniqueSymbols]:uniqueSymbols)?.map((val) => {
                                            return <option value={val}>{val}</option>;
                                        })}
                                    </Form.Select>
                                    <Form.Control.Feedback type="invalid">
                                        Please select symbol
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        )}
                    <Form.Group as={Col} md="6" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaUser />
                            </span>
                            userId
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Select
                                name="userid"
                                value={`${marginConfig.data.userid_id}_${marginConfig.data.userid}`}
                                onChange={(e) => {
                                    let splitStrings = e.target.value.split("_");
                                    const id = +splitStrings[0];
                                    const name = splitStrings[1];
                                    setMarginConfig((previous) => ({
                                        ...previous,
                                        data: {
                                            ...previous.data,
                                            userid_id: id,
                                            userid: name,
                                        },
                                    }));
                                }}
                                required
                                aria-label="Floating label select example"
                            >
                                <option value="" hidden>
                                    Select userId
                                </option>
                                {marginConfigApi?.userIds.map((val) => {
                                    return (
                                        <option key={val.id} value={`${val.id}_${val.userId}`}>
                                            {val.userId}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please select userid
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                    {/* <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <AiOutlineCluster />
              </span>
              Cluster Name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="clustername"
                value={`${marginConfig.data.cluster}_${marginConfig.data.clustername}`}
                onChange={(e) => {
                  let splitStrings = e.target.value.split("_");
                  const id = +splitStrings[0];
                  const name = splitStrings[1];
                  setMarginConfig((previous) => ({
                    ...previous,
                    data: {
                      ...previous.data,
                      cluster: id,
                      clustername: name,
                    },
                  }));
                }}
                aria-label="Floating label select example"
              >
                <option value="select clustername" hidden>
                  Select ClusterName
                </option>
                {marginConfigApi?.data?.clusters.map((val) => {
                  return (
                    <option key={val.id} value={`${val.id}_${val.clustername}`}>
                      {val.clustername}
                    </option>
                  );
                })}
              </Form.Select>

              <Form.Control.Feedback type="invalid">
                Please select clustername
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group> */}

                    {/* <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsCurrencyExchange />
              </span>
              Margin Type
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="margintype"
                value={marginConfig.data.margintype}
                onChange={handleChange}
                aria-label="Floating label select example"
              >
                <option value="CR">CR</option>
                <option value="LOT">LOT</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select margintype
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group> */}
                    <Form.Group as={Col} md="6" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaRegChartBar />
                            </span>
                            Allowed
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="text"
                                placeholder="Enter Allowed"
                                // pattern="[^\s]+"
                                // onChange={handleErrorMessage}
                                name="allowed"
                                onChange={handleChange}
                                value={marginConfig.data.allowed}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Enter Allowed
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    {/* <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <MdGroup />
              </span>
              Group
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="group"
                value={marginConfig.data.group}
                onChange={handleChange}
                aria-label="Floating label select example"
                // defaultValue={"Select cluster"}
              >
                <option value="Select group" hidden>
                  Select group
                </option>
                {marginConfigApi?.data?.groupname.map((val) => {
                  return (
                    <option key={val.id} value={val.id}>
                      {val.groupName}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select group.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group> */}
                </Row>
                <div className={profile.configBtnSection}>
                    <input
                        type="submit"
                        className={`basic-InfoBtn ${profile.basicInfoBtn}`}
                        value="Create"
                        // onClick={handleMarginAllotment}
                        // onClick={(e) => {
                        //     e.preventDefault();
                        //     console.log("craete user conf")
                        // }}
                        onClick={(e) => {
                            e.preventDefault();
                            setNotifyData((data) => ({
                                ...data,
                                confirmFlag: true,
                                confirmMsg: "Are you sure, You want to create margin configuration?",
                                confirmAction: (e) =>
                                    handleMarginAllotment(e)
                            }))
                        }}
                    />
                </div>
                <h6
                    onClick={() => props.toggleVisibility()}
                    className={profile.hideShowtoggle}
                >
                    {props.visibility ? "Hide " : "Show "}
                    Limit Allotment data
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

export default LimitAllotment