import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { memo, useEffect, useRef, useState } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
import { BsCalendar2EventFill } from "react-icons/bs";
import { FaUser, FaUserCog } from "react-icons/fa";
import {
  CREATE_USER_CONFIG_API,
  GET_GROUP_CONFIG_API,
  GET_USERID_MASTER,
  GET_USER_SETTINGS_API,
} from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import profile from "../ProfilePage/ProfilePage.module.scss";

const UserConfig = (props) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  // const { data, loading, error, makeApiCall } = useApi(CREATE_USER_CONFIG_API);

  // const options = Globalsettings.access_users.split(",").sort().map((el) => {
  //     return { label: el };
  // });

  const [userConfigDetails, setUserConfigDetails] = useState({
    event: "create",
    data: {
      Date: new Date().toISOString().split("T")[0],
      userid: "",
      group_config: "",
    },
  });
  const [userConfigApi, setUserConfigApi] = useState({
    userIds: [],
    groupname: [],
  });
  // const [userConfigApiData, setUserConfigApiData] = useState({
  //   date: new Date().toISOString().split("T")[0],
  // });
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
  //       userApiCall.data.result && setUserConfigApi(userApiCall.data.result);
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

      } catch (error) {

      }

      try {
        const groupApiData = await Promise.allSettled([
          GET_USERID_MASTER(),
          // GET_GROUP_CONFIG_API({ date: userConfigDetails.data.Date }),
          GET_GROUP_CONFIG_API({ date: new Date().toISOString().split("T")[0] }),
          GET_USER_SETTINGS_API(),
        ]);
        const [userIdData, groupConfigName, userfromdate] = groupApiData;
        // console.log({ userIdData, groupConfigName, userfromdate })
        // console.log(userIdData);
        if (userIdData.value) {
          // console.log(userIdData.value)
          setUserConfigApi((previous) => ({
            ...previous,
            userIds: userIdData.value.data?.result,
          }));
        }
        if (groupConfigName.value) {
          setUserConfigApi((previous) => ({
            ...previous,
            groupname: groupConfigName.value.data?.result.map(e => ({ value: e.id, label: e.configname })),
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
      // makeApiCall(CREATE_USER_CONFIG_API, userConfigDetails);

      const accessUserConfig = new Promise((resolve, reject) => {
        resolve(CREATE_USER_CONFIG_API(userConfigDetails));
      });
      accessUserConfig
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

  const handleUserConfig = (e, data) => {

    let name = null
    let value = null

    if (e) {
      name = e.target.name
      value = e.target.value
    } else {
      name = data.n
      value = data.v
    }

    setUserConfigDetails((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: !isNaN(+value) ? +value : value,
      },
    }));
  };
  const handleDatePickerChange = (date, dateStrings) => {
    setUserConfigDetails((prevState) => ({
      ...prevState,
      data: {
        ...prevState.data,
        Date: dateStrings,
      },
    }));
  };
  // console.log("userConfigApi", userConfigApi.groupname);
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <FaUserCog />
        </span>
        Set User Configuration
      </h5>
      <Form
        ref={formRef}
        validated={validated}
        onSubmit={handleSubmit}
        className={profile.basicInfoSetting}
      >
        <Row className="mb-3">
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
                value={dayjs(userConfigDetails.data.Date, "YYYY-MM-DD")}
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
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              UserId
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Select
                name="userid"
                value={userConfigDetails.data.userid}
                onChange={handleUserConfig}
                aria-label="Floating label select example"
                required
              >
                <option value="" hidden>
                  Select userId
                </option>
                {userConfigApi.userIds?.map((val, i) => {
                  return (
                    <option key={val.id} value={val.id}>
                      {val.userId}
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
              Group Config Name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Select
                name="group_config"
                // showSearch
                required
                configname
                value={userConfigDetails.data.group_config}
                onChange={e => handleUserConfig(null, { n: "group_config", v: e })}
                aria-label="Floating label select example"
                style={{ width: "100%" }}
                options={userConfigApi.groupname.sort((optionA, optionB) =>
                  optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
                ).map((val) => {
                  return {
                    label: val.label,
                    value: val.value,
                  };
                }).sort((a, b) =>
                  a.label.localeCompare(b.label)
                )}
                showSearch={true}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              // filterSort={(optionA, optionB) => {
              //   return (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())
              // }
              // }
              // options={userConfigApi.groupname}
              // options={userConfigApi.groupname.sort((optionA, optionB) =>
              //   optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
              // )}
              >
                {/* {userConfigApi.groupname.sort((optionA, optionB) =>
                  optionA.label.toLowerCase().localeCompare(optionB.label.toLowerCase())
                )?.map((val, i) => {
                  return (
                    <Option key={val.value} value={val.value}>

                      {console.log({ val })}{val.label}
                    </Option>
                  );
                })} */}
                {/* <Select.Option value="" hidden>
                  Select group config Name
                </Select.Option>
                {userConfigApi.groupname.splice(0, 100)?.map((val, i) => {
                  return (
                    <Select.Option key={val.id} value={val.id}>
                      {val.configname}
                    </Select.Option>
                  );
                })} */}

              </Select>
              <Form.Control.Feedback type="invalid">
                Please Select group config
              </Form.Control.Feedback>
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
                confirmMsg: "Are you sure, You want to apply user configuration?",
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
          user config data
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

export default memo(UserConfig);
