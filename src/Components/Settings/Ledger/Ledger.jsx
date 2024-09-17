import { DatePicker } from "antd";
import dayjs from "dayjs";
import { memo, useEffect, useRef, useState } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { BsCalendar2EventFill } from "react-icons/bs";
import { FaUser, FaUserCog } from "react-icons/fa";
import {
    CREATE_GROUP_API,
    GET_CLUSTER_API,
    GET_USER_SETTINGS_API,
    POST_UPDATE_LEDGER_API
} from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import profile from "../ProfilePage/ProfilePage.module.scss";

const Ledger = (props) => {
    const [validated, setValidated] = useState(false);
    const formRef = useRef();
    // const { data, loading, error, makeApiCall } = useApi(CREATE_USER_CONFIG_API);

    // const options = Globalsettings.access_users.split(",").sort().map((el) => {
    //     return { label: el };
    // });
    const [userIdMaster, setUserIdMaster] = useState([])
    const [ledgerDetails, setLedgerDetails] = useState({
        event: "create",
        data: {
            date: new Date().toISOString().split("T")[0],
            basecurrency: "",
            clustername: "",
            debcred: "",
            amount: "",
            particular: "",
            alternate_group: "",
            alternate_groupname: "",
        },
    });
    const [ledgerApi, setLedgerApi] = useState({
        clusterMaster: [],
        groupname: [],
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

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };
    const CloseConfirm = () => {
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    // useEffect(() => {
    //   (async () => {

    //     try {
    //       const userApiCall = await GET_USER_CONFIG_API();
    //       userApiCall.data.result && setLedgerApi(userApiCall.data.result);
    //     } catch (error) {
    //       console.log("error", error);

    //     }
    //   })();
    // }, []);

    useEffect(() => {
        (async () => {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "loading...",
            }));


            try {
                const groupApiData = await Promise.allSettled([
                    // GET_FILTERS_API({ event: "getallfilters" }),
                    GET_CLUSTER_API(),
                    // GET_GROUP_API(),
                    GET_USER_SETTINGS_API(),
                    CREATE_GROUP_API({ "event": "getalternatename" })
                ]);
                const [clusterMaster, userfromdate, alternetGroups] = groupApiData;
                // console.log({ clusterMaster, userfromdate, alternetGroups })
                // console.log(clusterMaster);
                if (alternetGroups.value) {
                    setLedgerApi(p => ({ ...p, alternetGroupName: alternetGroups.value.data.result }))
                }
                if (clusterMaster.value) {
                    setLedgerApi((previous) => ({
                        ...previous,
                        clusterMaster: clusterMaster.value.data?.result,
                    }));
                }
                if (userfromdate.value) {
                    setUserdate(dayjs(userfromdate.value.data?.result[0].date_range.fromdate));
                }

                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                    };
                });
            } catch (error) {
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                        errorFlag: true,
                        errorMsg: error.response?.data.result,
                        headerMsg: error.code,
                    };
                });
            }
        })();
    }, []);

    const handleSubmit = async (e) => {
        // console.log("submitdata", e);

        e.preventDefault();
        if (formRef.current.checkValidity() === false) {
            e.preventDefault();
            e.stopPropagation();
            setNotifyData((data) => ({ ...data, confirmFlag: false }));
        } else {
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: true,
                loadingMsg: "Applying user config...",
            }));

            // const createLedgerPost= POST_UPDATE_LEDGER_API(ledgerDetails)


            // makeApiCall(CREATE_USER_CONFIG_API, ledgerDetails);
            const ledgerData = {
                ...ledgerDetails, data: {
                    ...ledgerDetails.data,
                    alternate_group: ledgerDetails.data.alternetGroupName.split("-").length > 1 ? +ledgerDetails.data.alternetGroupName.split("-")[1] : "",
                    alternate_groupname: ledgerDetails.data.alternetGroupName.split("-").length > 1 ? ledgerDetails.data.alternetGroupName.split("-")[0] : "",
                    clustername: ledgerDetails.data.clustername.split("-").length > 1 ? ledgerDetails.data.clustername.split("-")[0] : "",
                    cluster: ledgerDetails.data.clustername.split("-").length > 1 ? +ledgerDetails.data.clustername.split("-")[1] : "",
                    amount: +ledgerDetails.data?.amount,
                    // userid: ledgerDetails.data.userid.split("-").length > 1 ? ledgerDetails.data.userid.split("-")[0] : "",
                    // userid_id: ledgerDetails.data.userid.split("-").length > 1 ? +ledgerDetails.data.userid.split("-")[1] : ""
                }
            }

            delete ledgerData.data.alternetGroupName
            // console.log(ledgerDetails);


            // console.log({ ledgerData });
            const createLedgerPost = POST_UPDATE_LEDGER_API(ledgerData)
            // const createLedgerPost = null

            createLedgerPost
                .then((res) => {
                    // console.log(res);
                    if (res.status === 200) {
                        setNotifyData((prev) => {
                            return {
                                ...prev,
                                loadingFlag: false,
                                successFlag: true,
                                confirmFlag: false,
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
                            errorFlag: true,
                            confirmFlag: false,
                            errorMsg: err.response?.data.reason,
                            headerMsg: err.code,
                        };
                    });
                });
        }
        setValidated(true);
    };

    const handleUserConfig = async (e) => {
        setLedgerDetails((prev) => ({
            ...prev,
            data: {
                ...prev.data,
                [e.target.name]: e.target.value,
            },
        }));
    };

    const handleDatePickerChange = (date, dateStrings) => {
        setLedgerDetails((prevState) => ({
            ...prevState,
            data: {
                ...prevState.data,
                date: dateStrings,
            },
        }));
    };
    // console.log("ledgerApi", ledgerDetails);
    return (
        <div className={`basic-forminfo ${profile.basicInfo}`}>
            <h5 className={profile.basicHeading}>
                <span className={profile.icons}>
                    <FaUserCog />
                </span>
                Ledger
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
                                value={dayjs(ledgerDetails.data.date, "YYYY-MM-DD")}
                                // disabledDate={(current) => {
                                //   return current.isBefore(userdate.startOf("day")) || current > Date.now();
                                // }}
                                disabledDate={(current) => {
                                    if (userdate && dayjs(userdate).isValid()) {
                                        return current.isBefore(userdate.startOf("day")) || current > Date.now();
                                    }
                                    return false;
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
                            {/* <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span> */}
                            currency
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Select
                                name="basecurrency"
                                value={ledgerDetails.data.basecurrency}
                                onChange={handleUserConfig}
                                aria-label="Floating label select example"
                                required
                            >
                                <option value="" hidden>
                                    Select currency
                                </option>
                                {["USD", "INR"]?.map((val, i) => {
                                    return (
                                        <option key={val} value={val}>
                                            {val}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please Select currency
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>



                    <Form.Group as={Col} md="6" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaUser />
                            </span>
                            Cluster name
                            {ledgerDetails.data.clustername == "" && <span className={profile.mendatory}>*</span>}
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Select
                                name="clustername"
                                value={ledgerDetails.data.clustername}
                                onChange={handleUserConfig}
                                aria-label="Floating label select example"
                                required
                            >
                                <option value="" >
                                    Select clustername
                                </option>
                                {ledgerApi.clusterMaster?.map((val, i) => {
                                    return (
                                        <option key={`${val.clustername}-${val.id}`} value={`${val.clustername}-${val.id}`}>
                                            {val.clustername}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please Select UserId
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} md="6" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaUser />
                            </span>
                            Alternet Group Name
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Select
                                name="alternetGroupName"
                                required
                                value={ledgerDetails.data.alternetGroupName}
                                onChange={handleUserConfig}
                                aria-label="Floating label select example"
                            >
                                <option value="" >
                                    Select Alternet group Name
                                </option>
                                {ledgerApi.alternetGroupName?.map((val, i) => {
                                    return (
                                        <option key={`${val?.alternate_name}-${val?.id}`} value={`${val?.alternate_name}-${val?.id}`}>
                                            {val?.alternate_name}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please Select groupname
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    {/* <Form.Group as={Col} md="6" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaUser />
                            </span>
                            Group Name
                            {ledgerDetails.data.clustername == "" && <span className={profile.mendatory}>*</span>}
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Select
                                name="groupname"
                                required={ledgerDetails.data.clustername == ""}
                                value={ledgerDetails.data.groupname}
                                onChange={handleUserConfig}
                                aria-label="Floating label select example"
                            >
                                <option value="" >
                                    Select group Name
                                </option>
                                {ledgerApi.groupname?.map((val, i) => {
                                    return (
                                        <option key={val.id} value={val.id}>
                                            {val.groupName}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please Select groupname
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group> */}

                    <Form.Group as={Col} md="6" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaUser />
                            </span>
                            Debcred
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Select
                                name="debcred"
                                required
                                value={ledgerDetails.data.debcred
                                }
                                onChange={handleUserConfig}
                                aria-label="Floating label select example"
                            >
                                <option value="" hidden>
                                    Select Debit/Credit
                                </option>
                                {["debit", "credit"]?.map((val, i) => {
                                    return (
                                        <option key={val} value={val}>
                                            {val}
                                        </option>
                                    );
                                })}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">
                                Please Debit/Credit
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>

                    <Form.Group as={Col} md="6" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaUser />
                            </span>
                            Amount
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="number"
                                name="amount"
                                value={ledgerDetails.data.amount}
                                onChange={handleUserConfig}
                                placeholder="Amount"

                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group as={Col} md="12" className="mb-3">
                        <Form.Label>
                            <span className={`label-icon ${profile.labelIcon}`}>
                                <FaUser />
                            </span>
                            Particulars
                            <span className={profile.mendatory}>*</span>
                        </Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="textarea"
                                name="particular"
                                value={ledgerDetails.data.particular}
                                onChange={handleUserConfig}
                                placeholder="particular"

                            />
                        </InputGroup>
                    </Form.Group>

                </Row>
                <div className={profile.configBtnSection}>
                    <input
                        type="submit"
                        className={`basic-InfoBtn ${profile.basicInfoBtn}`}
                        value="Apply"
                        // onClick={handleSubmit}
                        onClick={(e) => {
                            e.preventDefault();
                            setNotifyData((data) => ({
                                ...data,
                                confirmFlag: true,
                                confirmMsg: "Are you sure, You want to apply Ledger?",
                                confirmAction: (e) =>
                                    handleSubmit(e)
                            }))
                        }}
                    // onClick={(e) => {
                    //     e.preventDefault();
                    //     console.log("craete user conf")
                    // }}
                    />
                </div>
                <h6
                    onClick={() => props.toggleVisibility()}
                    className={profile.hideShowtoggle}
                >
                    {props.visibility ? "Hide " : "Show "}
                    View Ledger
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

export default memo(Ledger);
