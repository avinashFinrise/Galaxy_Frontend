import { memo, useRef, useState } from "react";
import { Form, Row, Col } from "react-bootstrap";
import { IoKeySharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Notification } from "../DynamicComp/Notification";
// import { DeleteStateAction } from '../../Redux/RMSAction';
import { CHANGE_PWD_API } from "../../API/ApiServices";
import useApi from "../CustomHook/useApi";
import profile from "./ProfilePage/ProfilePage.module.scss";
import { LoginAction, SocketDisconnectAction } from "../../Redux/RMSAction";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";

const ChangePwd = (props) => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { data, loading, error, makeApiCall } = useApi(CHANGE_PWD_API);
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  const [validated, setValidated] = useState(false);
  const formRef = useRef("");
  const [changePwdDetails, setChangePwdDetails] = useState({
    event: "change_password",
    data: {
      current_password: "",
      new_password: "",
      cunfirm_password: "",
      current_pwdvisibilty: false,
      new_pwdvisibilty: false,
      cnfpwdvisibilty: false,
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
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };


  const onChangePWD = async (e) => {
    e.preventDefault();
    const isValidNewPassword = validatePassword(changePwdDetails.data.new_password);
    const isValidConfirmPassword = validatePassword(changePwdDetails.data.cunfirm_password);

    setValidated(true);
    if (formRef.current.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      setNotifyData((data) => ({ ...data, confirmFlag: false }));
    } else if (isValidNewPassword && isValidConfirmPassword && !passwordMatchError) {
      setNotifyData((prev) => ({
        ...prev,
        loadingFlag: true,
        loadingMsg: "loading...",
      }));
      const updatePwd = new Promise((resolve, reject) => {
        // resolve(CHANGE_PWD_API(changePwdDetails));
        resolve(
          CHANGE_PWD_API({
            event: "change_password",
            data: {
              current_password: changePwdDetails.data.current_password,
              new_password: changePwdDetails.data.new_password,
              cunfirm_password: changePwdDetails.data.cunfirm_password,
            },
          })
        );
      });
      updatePwd
        .then((res) => {
          console.log(res);
          if (res?.data.httpstatus === 200) {
            setNotifyData((prev) => {
              return {
                ...prev,
                loadingFlag: false,
              };
            });
            dispatch(SocketDisconnectAction(false));
            dispatch(LoginAction(false));
            // navigate("/");
            localStorage.clear();
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
    } else {
      setNotifyData((prev) => ({
        ...prev,
        loadingFlag: false,
        confirmFlag: false,
        errorFlag: true,
        errorMsg: "Invalid passwords or password mismatch.",
        headerMsg: "Error",
      }));
    }
    // setValidated(true);
  };

  // console.log("changePwdDetails******", changePwdDetails);
  // const handleSubmit = (event) => {
  //   const form = event.currentTarget;
  //   if (form.checkValidity() === false) {
  //     event.preventDefault();
  //     event.stopPropagation();
  //   }
  //   setValidated(true);
  // };

  // const onChangePWD = async (e) => {
  //   e.preventDefault();
  //   if (formRef.current.checkValidity() === false) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     setNotifyData((data) => ({ ...data }));
  //   } else {
  //     makeApiCall(CHANGE_PWD_API, changePwdDetails);
  //   }
  //   setValidated(true);
  // };
  const validatePassword = (password) => {
    // Your password validation criteria
    // For example, you can enforce a minimum length and certain character types
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    // const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    const isValidPassword =
      password.length >= minLength && hasUppercase && hasLowercase && hasDigit;

    return isValidPassword;
  };
  const handleChangePwdInput = (e) => {
    const { name, value } = e.target;
    const isPassword = name === "new_password";
    const isConfirmPassword = name === "cunfirm_password";
    if (isConfirmPassword) {
      // Check if the confirmation password matches the password
      setPasswordMatchError(value !== changePwdDetails.data.new_password);
    }
    if ((isPassword || isConfirmPassword) && !validatePassword(value)) {
      setChangePwdDetails((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [e.target.name]: e.target.value,
        },
      }));
    } else {
      setChangePwdDetails((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [e.target.name]: e.target.value,
        },
      }));
    }
  };

  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <IoKeySharp />
        </span>
        Change Password
      </h5>
      <Form
        // noValidate
        ref={formRef}
        validated={validated}
        onSubmit={onChangePWD}
        className={profile.basicInfoSetting}
      >
        <Row className="mb-3">
          <Form.Group
            as={Col}
            md="12"
            className={`mb-3 ${profile.inputGroupSection}`}
          // controlId="validationCurrentPwd"
          >
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaLock />
              </span>
              Current Password
              <span className={profile.mendatory}>*</span>
            </Form.Label>

            <Form.Control
              type={
                changePwdDetails.data.current_pwdvisibilty ? "text" : "password"
              }
              name="current_password"
              id="current_password"
              placeholder="Current Password"
              required
              onChange={handleChangePwdInput}
              value={changePwdDetails.data.current_password}

            />
            <i
              onClick={(e) => {
                setChangePwdDetails((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    current_pwdvisibilty: !previous.data.current_pwdvisibilty,
                  },
                }));
              }}
              className={profile.userPassHideShow}
            >
              {changePwdDetails.data.current_pwdvisibilty ? (
                <BsFillEyeFill className={profile.eyeIcon} />
              ) : (
                <BsFillEyeSlashFill className={profile.eyeIcon} />
              )}
            </i>
            <Form.Control.Feedback type="invalid">
              Please provide a valid current password.
            </Form.Control.Feedback>
            {/* </InputGroup> */}
          </Form.Group>
          <Form.Group
            as={Col}
            md="12"
            className={`mb-3 ${profile.inputGroupSection}`}
          // controlId="validationNewPwd"
          >
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaLock />
              </span>
              New Password
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <Form.Control
              required
              type={
                changePwdDetails.data.new_pwdvisibilty ? "text" : "password"
              }
              name="new_password"
              placeholder="New Password"
              onChange={handleChangePwdInput}
              value={changePwdDetails.data.new_password}
              isInvalid={changePwdDetails.data.new_password && !validatePassword(changePwdDetails.data.new_password)}
            />
            <i
              onClick={(e) => {
                setChangePwdDetails((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    new_pwdvisibilty: !previous.data.new_pwdvisibilty,
                  },
                }));
              }}
              className={profile.userPassHideShow}
            >
              {changePwdDetails.data.new_pwdvisibilty ? (
                <BsFillEyeFill className={profile.eyeIcon} />
              ) : (
                <BsFillEyeSlashFill className={profile.eyeIcon} />
              )}
            </i>
            <Form.Control.Feedback type="invalid">
              Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group
            as={Col}
            md="12"
            className={`mb-3 ${profile.inputGroupSection}`}
          // controlId="validationConfrmPwd"
          >
            <Form.Label>
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaLock />
              </span>
              Confirm password
              <span className={profile.mendatory}>*</span>
            </Form.Label>
            <Form.Control
              type={changePwdDetails.data.cnfpwdvisibilty ? "text" : "password"}
              name="cunfirm_password"
              placeholder="Confirm password"
              required
              onChange={handleChangePwdInput}
              value={changePwdDetails.data.cunfirm_password}
              className={`form-control ${passwordMatchError ? "is-invalid" : ""}`}
            />
            <i
              onClick={(e) => {
                setChangePwdDetails((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    cnfpwdvisibilty: !previous.data.cnfpwdvisibilty,
                  },
                }));
              }}
              className={profile.userPassHideShow}
            >
              {changePwdDetails.data.cnfpwdvisibilty ? (
                <BsFillEyeFill className={profile.eyeIcon} />
              ) : (
                <BsFillEyeSlashFill className={profile.eyeIcon} />
              )}
            </i>
            <Form.Control.Feedback type="invalid">
              Please provide a valid Confirm password
            </Form.Control.Feedback>
          </Form.Group>
        </Row>
        <div>
          <input
            type="submit"
            className={`basic-InfoBtn ${profile.basicInfoBtn}`}
            value="Change"
            onClick={(e) => {
              e.preventDefault();
              setNotifyData((data) => ({
                ...data,
                confirmFlag: true,
                confirmMsg: "Are you sure, You want to change password?",
                confirmAction: (e) =>
                  onChangePWD(e)
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
    </div>
  );
};

export default memo(ChangePwd);
