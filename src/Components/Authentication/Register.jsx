import { memo, useEffect, useState } from "react";
import { Form, Row } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import authReg from "./Register.module.scss";
import { FaLock, FaUser } from "react-icons/fa";
import { BsArrowLeft, BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { Notification } from "../DynamicComp/Notification";
import useApi from "../CustomHook/useApi";
import { GET_USER_ROLE, REGISTER_USER_API } from "../../API/ApiServices";
import { GrMail } from "react-icons/gr";

function Register() {
  const navigate = useNavigate();
  const { data, loading, error, makeApiCall } = useApi(REGISTER_USER_API);

  const [registerData, setRegisterData] = useState({
    event: "register",
    source: "web",
    data: {
      first_name: "",
      email: "",
      password: "",
      username: "",
      role: "",
      pwdvisibilty: false,
      cnfpwdvisibilty: false,
    },
  });
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  // console.log("registerData", registerData);
  const [userRole, setUserRole] = useState([]);
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
        const apiCall = await GET_USER_ROLE();
        // console.log("apiCall", apiCall);
        if (apiCall.data.result) setUserRole(apiCall.data.result);
      } catch (error) {
        console.log("error", error);
      }
    })();
  }, []);


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
    // if (!isValidPassword) {
    //   console.log("Invalid password. Please ensure it has at least 8 characters, one uppercase letter, one lowercase letter, and one digit.");
    // }
    return isValidPassword;
  };
  const handleInput = (e) => {
    const { name, value } = e.target;
    const isPassword = name === "password";
    const isConfirmPassword = name === "confirmPassword";
    if (isConfirmPassword) {
      // Check if the confirmation password matches the password
      setPasswordMatchError(value !== registerData.data.password);
    }
    // If the input is for password, perform validation
    if (isPassword) {
      const isValidPassword = validatePassword(value);
      setRegisterData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [e.target.name]: value,
        },
      }));

      // Set password match error only if the password is invalid
      setPasswordMatchError(!isValidPassword);
    } else {
      setRegisterData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [e.target.name]:
            e.target.name === "role" ? +e.target.value : e.target.value,
        },
      }));
    }
  };
  const [validated, setValidated] = useState(false);

  const register = (e) => {
    e.preventDefault();
    const isValidNewPassword = validatePassword(registerData.data.password);
    const isValidConfirmPassword = validatePassword(registerData.data.confirmPassword);
    setValidated(true);
    if (isValidNewPassword && isValidConfirmPassword && !passwordMatchError) {
      setNotifyData((prev) => ({
        ...prev,
        loadingFlag: true,
        loadingMsg: "Plaese Wait...",
      }));
      // setNotifyData((data) => ({
      //   ...data,
      //   loadingFlag: true,
      //   loadingMsg: "Plaese Wait",
      // }));

      const createUser = new Promise((resolve, reject) => {
        resolve(
          REGISTER_USER_API({
            event: "register",
            source: "web",
            data: {
              first_name: registerData.data.first_name,
              email: registerData.data.email,
              password: registerData.data.password,
              username: registerData.data.username,
              role: registerData.data.role,
            },
          })
        );
      });
      createUser
        .then((res) => {
          if (res.status === 201) {
            setNotifyData((prev) => {
              return {
                ...prev,
                loadingFlag: false,
                successFlag: true,
                successMsg: res.data.status,
              };
            });
            setRegisterData({
              event: "register",
              source: "web",
              data: {
                first_name: "",
                email: "",
                password: "",
                username: "",
                role: "",
              },
            });
          }
        })
        .catch((err) => {
          console.log("******************", err);
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
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
  };

  // //  GET USER ROLE
  // useEffect(() => {
  //   makeApiCall(GET_USER_ROLE);
  // }, []);
  // useEffect(() => {
  //   if (data?.httpstatus === 200 && !loading) {
  //     setUserRole(data?.result);
  //     console.log(data);
  //   }
  // }, [data]);

  // console.log(registerData);

  return (
    <>
      <div className={`container-fluid ${authReg.authentication} `}>
        <div className={authReg.backLink}>
          <NavLink to="/usermanagement">
            <span>
              <BsArrowLeft />
            </span>
            Back to usermanagement
          </NavLink>
        </div>
        <Row className={`${authReg.Loginpage} ${authReg.registerSection}`}>
          <div
            className={`register-section ${authReg.registerCard} ${authReg.LoginCard} `}
          >
            <h3 className={authReg.heading}>Create new account</h3>
            <Form noValidate validated={validated} onSubmit={register} className="">
              <Form.Group className="mb-3">
                <Form.Label htmlFor="first_name" className="form-label">
                  <FaUser className={authReg.labelIcon} /> First Name
                </Form.Label>
                <Form.Control
                  type="text"
                  className="form-control"
                  name="first_name"
                  placeholder="Enter firstname"
                  value={registerData.data.first_name}
                  onChange={handleInput}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="form-label">
                  <GrMail className={authReg.labelIcon} /> Email
                </Form.Label>
                <Form.Control
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter email"
                  value={registerData.data.email}
                  onChange={handleInput}
                />
              </Form.Group>

              <Form.Group className={`mb-3 ${authReg.passwordSection}`}>
                <Form.Label htmlFor="password" className="form-label">
                  <FaLock className={authReg.labelIcon} /> Password
                </Form.Label>
                <i
                  onClick={(e) => {
                    setRegisterData((previous) => ({
                      ...previous,
                      data: {
                        ...previous.data,
                        pwdvisibilty: !previous.data.pwdvisibilty,
                      },
                    }));
                  }}
                  className={authReg.adminPassHideShow}
                >
                  {registerData.data.pwdvisibilty ? (
                    <BsFillEyeFill className={authReg.eyeIcon} />
                  ) : (
                    <BsFillEyeSlashFill className={authReg.eyeIcon} />
                  )}
                </i>
                <Form.Control
                  type={registerData.data.pwdvisibilty ? "text" : "password"}
                  // className={`form-control ${passwordMatchError ? "is-invalid" : ""
                  //   }`}

                  name="password"
                  placeholder="Enter password "
                  value={registerData.data.password}
                  onChange={handleInput}
                  isInvalid={registerData.data.password && !validatePassword(registerData.data.password)}
                />
                {/* <Form.Control.Feedback type="invalid">
                  Password must have at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character.
                </Form.Control.Feedback> */}
                {/* <Form.Text className="text-muted">
                  Password must have at least 8 characters, one uppercase letter,
                  one lowercase letter, one digit, and one special character.
                </Form.Text> */}
                <Form.Control.Feedback type="invalid">
                  Password must have at least 8 characters, one uppercase letter,
                  one lowercase letter, one digit, and one special character.
                  {/* {passwordMatchError
                  
                    ? "Passwords do not match"
                    : "Password does not meet the criteria"} */}
                </Form.Control.Feedback>

              </Form.Group>
              <Form.Group className={`mb-4 ${authReg.passwordSection}`}>
                <Form.Label htmlFor="confirmPassword" className="form-label">
                  <FaLock className={authReg.labelIcon} /> Confirm Password
                </Form.Label>
                <i
                  onClick={(e) => {
                    setRegisterData((previous) => ({
                      ...previous,
                      data: {
                        ...previous.data,
                        cnfpwdvisibilty: !previous.data.cnfpwdvisibilty,
                      },
                    }));
                  }}
                  className={authReg.adminPassHideShow}
                >
                  {registerData.data.cnfpwdvisibilty ? (
                    <BsFillEyeFill className={authReg.eyeIcon} />
                  ) : (
                    <BsFillEyeSlashFill className={authReg.eyeIcon} />
                  )}
                </i>
                <Form.Control
                  type={registerData.data.cnfpwdvisibilty ? "text" : "password"}
                  className={`form-control ${passwordMatchError ? "is-invalid" : ""
                    }`}
                  name="confirmPassword"
                  value={registerData.data.confirmPassword}
                  placeholder="Enter Confirm password "
                  onChange={handleInput}
                />
                <Form.Control.Feedback type="invalid">
                  Password not match
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="username" className="form-label">
                  <FaUser className={authReg.labelIcon} /> Username
                </Form.Label>
                <Form.Control
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={registerData.data.username}
                  onChange={handleInput}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="role" className="form-label">
                  <FaUser className={authReg.labelIcon} /> Role
                </Form.Label>
                <Form.Select
                  name="role"
                  value={registerData.data.role}
                  onChange={handleInput}
                >
                  <option value="Select Role" hidden>
                    Select Role
                  </option>
                  {userRole.map((val) => (
                    // <option value={val.role}>{val.role.toUpperCase()}</option>
                    <option key={val.id} value={val.id}>
                      {val.role.toUpperCase()}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className={authReg.customBtn}>
                <Form.Control
                  type="submit"
                  value="Register"
                  className={authReg.sigleCustomBtn}
                  onClick={register}
                />
              </Form.Group>
            </Form>
          </div>
        </Row>
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </>
  );
}

export default memo(Register);
