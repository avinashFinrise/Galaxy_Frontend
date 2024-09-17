import { memo, useEffect, useRef, useState } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import {
  BsCalendar2EventFill,
  BsCurrencyExchange,
  BsFillCalendarXFill,
} from "react-icons/bs";
import { FaHandsHelping, FaShare, FaUser } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import { GiPayMoney, GiReceiveMoney, GiTwoCoins } from "react-icons/gi";
import { MdGroup, MdOutlineSecurity } from "react-icons/md";
// import Autocomplete from 'react-autocomplete';
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { AiOutlineCluster } from "react-icons/ai";
import {
  CREATE_GROUP_CONFIG_API,
  GET_CLUSTER_API,
  GET_EXCHANGE_API,
  GET_GROUP_API,
  GET_SECURITY_API,
  GET_USER_SETTINGS_API,
} from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import profile from "../ProfilePage/ProfilePage.module.scss";
// const today = dayjs();
// const formattedDate = today.format("YYYY-MM-DD");

const GroupConfig = (props) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();

  // const options = Globalsettings.access_users.split(",").sort().map((el) => {
  //     return { label: el };
  // });

  const [userdate, setUserdate] = useState();
  const [groupConfigApiData, setGroupConfigApiData] = useState({
    exchange: [],
    securityType: [],
    group: [],
    cluster: [],
    brokType: ["CR", "LOT"],
  });

  const [groupConfigDetails, setGroupConfigDetails] = useState({
    event: "create",
    data: {
      Date: new Date().toISOString().split("T")[0],
      configName: "",
      buyBrokRate: "",
      sellBrokRate: "",
      expiryBuyBrokRate: "",
      expirySellBrokRate: "",
      brokType: "",
      isUsdLive: false,
      usdRate: 1,
      uSDCost: "",
      clientSharingRate: "",
      brokerSharingRate: "",
      comSharingRate: "",
      group: "",
      exchange: "",
      security_type: "",
      cluster: "",
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


  useEffect(() => {
    (async () => {
      // setNotifyData((data) => ({
      //   ...data,
      //   loadingFlag: true,
      //   loadingMsg: "loading...",
      // }));
      try {
        const groupApiData = await Promise.all([
          GET_EXCHANGE_API(),
          GET_SECURITY_API(),
          GET_GROUP_API(),
          GET_CLUSTER_API(),
          GET_USER_SETTINGS_API(),
        ]);
        const [
          exchangeData,
          securitytData,
          groupData,
          clusterData,
          createUserdate,
        ] = groupApiData;
        if (exchangeData) {
          setGroupConfigApiData((previous) => ({
            ...previous,
            exchange: exchangeData.data.result,
          }));
        }
        if (securitytData) {
          setGroupConfigApiData((previous) => ({
            ...previous,
            securityType: securitytData.data.result,
          }));
        }
        if (groupData) {
          setGroupConfigApiData((previous) => ({
            ...previous,
            group: groupData.data.result,
          }));
        }
        if (clusterData) {
          setGroupConfigApiData((previous) => ({
            ...previous,
            cluster: clusterData.data.result,
          }));
        }

        if (createUserdate) {
          setUserdate(dayjs(createUserdate.data.result[0].date_range.fromdate));
        }
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, []);

  const handleCreateGroupConfg = async (e) => {
    e.preventDefault();

    if (formRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
      // setNotifyData((data) => ({ ...data, loadingFlag: true }));
      // setNotifyData((data) => ({
      //   ...data,
      //   errorFlag: true,
      //   errorMsg: "Please Fill All Fields",
      // }));
    } else {
      let groupname = groupConfigApiData.group
        .find((val) => val.id == groupConfigDetails.data.group)
        .groupName.toLowerCase();
      let clusterName = groupConfigApiData.cluster
        .find((val) => val.id == groupConfigDetails.data.cluster)
        .clustername.toLowerCase();
      let security_type = groupConfigApiData.securityType
        .find((val) => val.id == groupConfigDetails.data.security_type)
        .securitytype.toLowerCase();

      let exchange = groupConfigApiData.exchange
        .find((val) => val.id == groupConfigDetails.data.exchange)
        .exchange.toLowerCase();

      let configData = groupConfigDetails;
      // configData.data.configName = `${groupname}_${security_type}_${clusterName}_${exchange}_b-${configData.data.buyBrokRate}_s-${configData.data.sellBrokRate}_${configData.data.clientSharingRate}_${configData.data.brokerSharingRate}_${configData.data.comSharingRate}_${configData.data.usdRate}`;
      configData.data.configName = `${groupname}_${security_type}_${clusterName}_${exchange}_b-${configData.data.buyBrokRate}_s-${configData.data.sellBrokRate}_ExB-${configData.data.expiryBuyBrokRate}_ExS-${configData.data.expirySellBrokRate}_${configData.data.clientSharingRate}_${configData.data.brokerSharingRate}_${configData.data.comSharingRate}_${configData.data.usdRate}_${configData.data.uSDCost}_${configData.data.isUsdLive}`;
      setNotifyData((prev) => ({
        ...prev,
        loadingFlag: true,
        loadingMsg: "Creating group config...",
      }));
      const createGroupConfig = new Promise((resolve, reject) => {
        resolve(CREATE_GROUP_CONFIG_API(configData));
      });
      createGroupConfig
        .then((res) => {
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
  const handleChange = (e) => {
    setGroupConfigDetails((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [e.target.name]:
          e.target.name === "brokType" || e.target.name === "configName"
            ? e.target.value
            : +e.target.value,
      },
    }));
    if (e.target.type == "checkbox") {
      setGroupConfigDetails((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [e.target.name]: e.target.checked,
        },
      }));
    }
  };

  // const handleGroupChange = (e) => {
  //   let groupName = setGroupConfigDetails((previous) => ({
  //     ...previous,
  //     data: {
  //       ...previous.data,
  //       group: e.target.value,
  //     },
  //   }));
  //   let data = {
  //     event: "getconfigfilters",
  //     data: {
  //       filters: {
  //         groupname: [e.target.value],
  //       },
  //     },
  //   };

  //   const getCluster = new Promise((resolve, reject) => {
  //     resolve(GET_FILTERS_API(data));
  //   });
  //   getCluster
  //     .then((res) => {
  //       setGroupConfigApiData((previous) => ({
  //         ...previous,
  //         cluster: res.data.result,
  //       }));
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  const handleDateChange = (date, dateStrings) => {
    // console.log(dateStrings);
    setGroupConfigDetails((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        Date: dateStrings,
      },
    }));
  };
  // console.log(
  //   "groupConfigDetails groupConfigApiData",
  //   groupConfigDetails
  //   // groupConfigApiData
  // );
  const handleReset = () => {
    setGroupConfigDetails({
      event: "create",
      data: {
        Date: "",
        configName: "",
        buyBrokRate: "",
        sellBrokRate: "",
        expiryBuyBrokRate: "",
        expirySellBrokRate: "",
        brokType: "",
        isUsdLive: false,
        usdRate: 1,
        uSDCost: "",
        clientSharingRate: "",
        brokerSharingRate: "",
        comSharingRate: "",
        group: "",
        exchange: "",
        security_type: "",
        cluster: "",
      },
    });
  };
  // console.log("groupConfigDetails", groupConfigDetails);

  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <FaUsersGear />
        </span>
        Create Group Configuration
      </h5>
      <Form
        ref={formRef}
        validated={validated}
        onSubmit={handleCreateGroupConfg}
        className={profile.basicInfoSetting}
      >
        <Row className="mb-1">
          <Form.Group as={Col} md="3" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsCalendar2EventFill />
              </span>
              Date
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <DatePicker
                required
                onChange={handleDateChange}
                // defaultValue={dayjs(dayjs().format("YYYY-MM-DD"))}
                value={dayjs(groupConfigDetails.data.Date, "YYYY-MM-DD")}
                format="YYYY-MM-DD"
                placeholder={"Date"}
                disabledDate={(current) => {
                  return current.isBefore(userdate?.startOf("day")) || current > Date.now();
                }}
                className={profile.datePicker}
              />
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="9" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              Config Name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                readOnly
                type="text"
                placeholder="Enter Config Name"
                required
                name="configName"
                value={groupConfigDetails.data.configName.toLowerCase()}
              // onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter configname
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
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
                value={groupConfigDetails.data.group}
                onChange={handleChange}
                aria-label="Floating label select example"
                required
              // defaultValue={"Select group"}
              >
                <option value="" hidden>
                  Select group
                </option>
                {groupConfigApiData.group
                  // .slice() // Make a copy of the array to avoid mutating the original
                  // .sort((a, b) => a.groupName.localeCompare(b.groupName)) // Sort alphabetically
                  .map((val) => (
                    <option key={val.id} value={val.id}>
                      {val.groupName}
                    </option>
                  ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please Select group.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <AiOutlineCluster />
              </span>
              Cluster
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="cluster"
                value={groupConfigDetails.data.cluster}
                onChange={handleChange}
                aria-label="Floating label select example"
                required
              >
                <option value="" hidden>
                  Select cluster
                </option>
                {groupConfigApiData.cluster.map((val) => (
                  <option key={val.id} value={val.id}>
                    {val.clustername}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please Select cluster.
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
                value={groupConfigDetails.data.exchange}
                onChange={handleChange}
                aria-label="Floating label select example"
                // defaultValue={"Select exchange"}
                required
              >
                <option value="" hidden>
                  Select exchange
                </option>
                {groupConfigApiData.exchange.map((val) => (
                  <option key={val.id} value={val.id}>
                    {val.exchange}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please Select Exchange.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <MdOutlineSecurity />
              </span>
              Security Type
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="security_type"
                value={groupConfigDetails.data.security_type}
                onChange={handleChange}
                aria-label="Floating label select example"
                required
              >
                <option value="" hidden>
                  Select Security Type
                </option>
                {groupConfigApiData.securityType.map((val) => (
                  <option key={val.id} value={val.id}>
                    {val.securitytype}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please Select SecurityType.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <GiReceiveMoney />
              </span>
              Buy Brokerage
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter Buy Brokerage Rate"
                required
                name="buyBrokRate"
                value={groupConfigDetails.data.buyBrokRate}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter buyBrokRate
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <GiPayMoney />
              </span>
              Sell Brokerage
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter Sell Brokerage Rate"
                required
                name="sellBrokRate"
                value={groupConfigDetails.data.sellBrokRate}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter Sell Brokerage
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsFillCalendarXFill />
              </span>
              Expiry Buy Brokerage
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter Expiry Buy Brokerage"
                required
                name="expiryBuyBrokRate"
                value={groupConfigDetails.data.expiryBuyBrokRate}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter Expiry Buy Brokerage
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsFillCalendarXFill />
              </span>
              Expiry Sell Brokerage
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter  Expiry Sell Brokerage"
                required
                name="expirySellBrokRate"
                value={groupConfigDetails.data.expirySellBrokRate}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter Expiry Sell Brokerage
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="4" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <BsCurrencyExchange />
              </span>
              Brokerage Type
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="brokType"
                value={groupConfigDetails.data.brokType}
                onChange={handleChange}
                aria-label="Floating label select example"
                required
              >
                <option value="" hidden>
                  Select brokType
                </option>
                {/* <option value="CR">CR</option>
                <option value="LOT">LOT</option> */}
                {groupConfigApiData.brokType.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please Select Brokerage Type.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="4" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <GiTwoCoins />
              </span>
              USD Rate
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter usdRate"
                required
                name="usdRate"
                value={groupConfigDetails.data.usdRate}
                onChange={handleChange}
                disabled={groupConfigDetails.data.isUsdLive ? true : false}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter usdRate
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="4" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <GiTwoCoins />
              </span>
              USD Cost
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter uSDCost"
                required
                name="uSDCost"
                value={groupConfigDetails.data.uSDCost}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter uSDCost
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="4" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaShare />
              </span>
              Client Sharing Rate
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter clientSharingRate"
                required
                name="clientSharingRate"
                value={groupConfigDetails.data.clientSharingRate}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter client Sharing Rate
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="4" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaHandsHelping />
              </span>
              Broker Sharing Rate
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter brokerSharingRate"
                required
                name="brokerSharingRate"
                value={groupConfigDetails.data.brokerSharingRate}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter brokerSharingRate
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="4" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <GiTwoCoins />
              </span>
              Company Sharing Rate
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation className={profile.groupConfig}>
              <Form.Control
                type="number"
                placeholder="Enter comSharingRate"
                required
                name="comSharingRate"
                value={groupConfigDetails.data.comSharingRate}
                onChange={handleChange}
              />
              <Form.Control.Feedback type="invalid">
                Please Enter Company Sharing Rate
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <Form.Group as={Col} md="12" className="mb-3">
            <div className="d-flex">
              <Form.Check
                type="switch"
                label="USD Live"
                name="isUsdLive"
                onChange={handleChange}
                // checked={groupConfigDetails.data.isUsdLive && true}
                checked={groupConfigDetails.data.isUsdLive}
                className={profile.usdLive}
              />
            </div>
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
                confirmMsg: "Are you sure,  You want to create group configuration ?",
                confirmAction: (e) =>
                  handleCreateGroupConfg(e)
              }))
            }}
          // onClick={handleCreateGroupConfg}
          />
          <input
            type="reset"
            className={profile.basicDangerBtn}
            value="Reset"
            onClick={handleReset}
          />
        </div>
        <h6
          onClick={() => props.toggleVisibility()}
          className={profile.hideShowtoggle}
        >
          {props.visibility ? "Hide " : "Show "}
          Group config data
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
export default memo(GroupConfig);
