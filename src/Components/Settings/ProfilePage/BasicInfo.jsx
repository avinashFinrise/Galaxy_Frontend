import { memo, useEffect, useRef, useState } from "react";
import { Form, Row, Col, InputGroup } from "react-bootstrap";
import {
  FaAddressCard,
  FaTelegramPlane,
  FaUser,
} from "react-icons/fa";
import { FaUserGear } from "react-icons/fa6";
import { Notification } from "../../DynamicComp/Notification";
import {
  BASIC_PROFILE_API,
  GET_BASIC_PROFILE_API,
  ToggleIsTwoFa_API,
} from "../../../API/ApiServices";
import profile from "./ProfilePage.module.scss";
import { AiFillEdit } from "react-icons/ai";
import { TelegramPopup } from "../../DynamicComp";
import Active2FA from "../Active2FA/Active2FA";

const BasicInfo = () => {

  const [profileDetails, setProfileDetails] = useState({
    event: "update_user",
    data: {
      id: "",
      email: "",
      first_name: "",
      username: "",
      role: "",
      userId: '',
      otp_enabled: false,
      is2fa: "",
      telegramid: ""
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

  const [validated, setValidated] = useState(false);
  const formRef = useRef("");
  const [edttoggle2fa, setEdtToggle2fa] = useState(false);
  const editToggle2fa = () => {
    edttoggle2fa ? setEdtToggle2fa(false) : setEdtToggle2fa(true);
  }
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

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
        const apiData = await GET_BASIC_PROFILE_API();

        // console.log(apiData.data.result)
        if (apiData) {
          setProfileDetails((previous) => ({
            ...previous,
            data: {
              ...previous.data,
              id: apiData.data.result.id,
              email: apiData.data.result.email,
              first_name: apiData.data.result.first_name,
              username: apiData.data.result.username,
              role: apiData.data.result.rolename,
              is2fa: apiData.data.result.is2fa,
              telegramid: apiData.data.result.telegramid
            },
          }));
        }

      } catch (error) {
        console.log(error);
      }
    })();
  }, []);


  // console.log({ profileDetails })

  const handleUpdateBasicInfo = (e) => {
    // e.preventDefault();
    // makeApiCall(BASIC_PROFILE_API(profileDetails));
    e.preventDefault();
    const createGroupConfig = new Promise((resolve, reject) => {
      resolve(
        BASIC_PROFILE_API({
          event: "update_user",
          data: {
            id: profileDetails.data.id,
            email: profileDetails.data.email,
            first_name: profileDetails.data.first_name,
            username: profileDetails.data.username,
            role: profileDetails.data.rolename,
            otp_enabled: false,
          },
        })
      );
    });
    createGroupConfig
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              confirmFlag: false,
              successFlag: true,
              successMsg: res.data.result,
            };
          });
        }
      })
      .catch((err) => {
        console.log("******************", err);
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
  };


  const update2fa = async () => {

  }

  const handleprofileInput = async (e) => {
    setProfileDetails((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [e.target.name]: e.target.value,
      },
    }));
    if (e.target.type == "checkbox") {
      try {
        setProfileDetails((prev) => ({ ...prev, data: { ...prev.data, [e.target.name]: e.target.checked } }));
        const { data } = await ToggleIsTwoFa_API({ is_2fa: e.target.checked })
        // setProfileDetails((prev) => ({ ...prev, data: { ...prev.data, [e.target.name]: !profileDetails.data.is2fa } }));
      } catch (error) {
        console.log({ error })
      }
    }
  };


  // console.log({ data: profileDetails.data })


  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <FaAddressCard />
        </span>
        Basic Info
      </h5>

      <Form
        noValidate
        validated={validated}
        onSubmit={handleSubmit}
        className={profile.basicInfoSetting}
      >
        <Row className="mb-3">
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              Id
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="numer"
                name="id"
                value={profileDetails.data.id}
                // onChange={handleprofileInput}
                placeholder="id"
                readOnly
              />
            </InputGroup>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              First Name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <InputGroup hasValidation>
              <Form.Control
                type="text"
                name="first_name"
                value={profileDetails.data.first_name}
                onChange={handleprofileInput}
                placeholder="First Name"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please enter your first name.
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>


          <Form.Group as={Col} md="6" className="mb-3">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUser />
              </span>
              User Name
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <Form.Control
              required
              type="text"
              name="username"
              value={profileDetails.data.username}
              onChange={handleprofileInput}
              placeholder="username"
            />
            <Form.Control.Feedback type="invalid">
              Please enter valid username
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" className="mb-3 ">
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaUserGear />
              </span>
              Role
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            {/* <Form.Select
              name="role"
              // value={profileDetails.data.role}
              onChange={handleprofileInput}
              aria-label="Floating label select example"
              // defaultValue={profileDetails.data.rolename}
            >
              {roles.map((role, i) => (
                <option
                  key={role.id}
                  value={role.id}
                  selected={
                    profileDetails.data.rolename === role.role && role.role
                  }
                  // selected={profileDetails.data.role === i + 1}
                >
                  {role.role}
                </option>
              ))}
            </Form.Select> */}
            <Form.Control
              type="text"
              name="role"
              value={profileDetails.data.role}
              onChange={handleprofileInput}
              readOnly
              required
            // isInvalid
            />
            {/* <Form.Control.Feedback type="invalid">
              Please enter role.
            </Form.Control.Feedback> */}
          </Form.Group>


          {/* <Form.Group
            as={Col}
            md="1"
            className={`mb-3 ${profile.teligramEditIcon}`}
          >
            <Form.Label> Otp</Form.Label>
            <Form.Check
              type="switch"
              // label="Opt"n
              name="otp_enabled"
              className={profile.enableOpt}
              onChange={handleprofileInput}
              checked={profileDetails.data.otp_enabled}
            />
          </Form.Group> */}
          <Form.Group as={Col}
            md="5"
            controlId="validationCustomTelegramId"
            className={`mb-3 ${profile.telegramId}`}
          >
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaTelegramPlane />
              </span>
              Telegram Id
              <span className={profile.mendatory}>
                *
              </span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Telegram Id"
              value={profileDetails.data?.telegramid}
              readOnly
              required
            />
            <Form.Control.Feedback
              type="invalid"
            >
              Please provide a valid telegramId
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col}
            md="1"
            className={`mb-3 ${profile.teligramEditIcon}`}
          >
            <Form.Label></Form.Label>
            <span
              className={profile.basicInfoEditbtn}
              onClick={editToggle2fa}
            >
              <span style={{ textAlign: 'center' }}>
                <AiFillEdit />
              </span>
            </span>
          </Form.Group>

          <Form.Group
            as={Col}
            md="8"
            className={` ${profile.teligramEditIcon} `}
          >
            <Form.Check
              type="switch"
              label=" 2FA"
              name="is2fa"
              className={profile.enable2fa}
              onChange={handleprofileInput}
              checked={profileDetails.data.is2fa}
            />
          </Form.Group>
        </Row>
        <div>
          <input
            type="submit"
            className={`basic-InfoBtn ${profile.basicInfoBtn}`}
            value="Update"
            // onClick={handleUpdateBasicInfo}
            onClick={(e) => {
              e.preventDefault();
              setNotifyData((data) => ({
                ...data,
                confirmFlag: true,
                confirmMsg: "Are you sure, You want to update your profile? ",
                confirmAction: (e) => handleUpdateBasicInfo(e)
              }))
            }}
          />
        </div>
      </Form>

      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
      <TelegramPopup flag={edttoggle2fa} Close={editToggle2fa} component={<Active2FA />} />
    </div>
  );
};

export default memo(BasicInfo);
