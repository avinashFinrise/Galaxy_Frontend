import { memo, useEffect, useState } from "react";
import { Form, Row } from "react-bootstrap";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LOGIN_USER_API } from "../../API/ApiServices";
import { LoginAction } from "../../Redux/RMSAction";
import { updateFavicon } from "../../UtilityFunctions/conditionalFavicon";
import loginBg from "../../assets/Img/loginBackground.png";
import useApi from "../CustomHook/useApi";
import useSocketConnect from "../CustomHook/useSocketConnect";
import { Notification } from "../DynamicComp/Notification";
import authlogin from "./Login.module.scss";
import TwoFAPage from "./TwoFAPage/TwoFAPage";

const Login = () => {
  const [isTwoFaOpen, setIsTwoFaOpen] = useState(false)
  const [loginData, setLoginData] = useState({
    event: "login",
    source: "web",
    data: {
      username: "",
      password: "",
      pwdvisibilty: false,
      rememberme: false
    },
  });
  const [rememberme, setRememberme] = useState(localStorage.getItem("rememberme") || null)
  useEffect(() => {
    // const rememberme = localStorage.getItem("rememberme") || null
    const userNamePass = localStorage.getItem('userNamePass') ? JSON.parse(localStorage.getItem('userNamePass')) : null

    if (rememberme && userNamePass) {
      setLoginData((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          username: userNamePass.username,
          password: userNamePass.password,
          rememberme: rememberme
        },
      }));
    }
  }, [])


  // let [modalDetails, setModalDetails] = useState({
  //   show: false,
  //   error: "",
  //   header: "",
  // });
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
  let navigate = useNavigate();
  let dispatch = useDispatch();
  // const { responseData, error, isLoading, sendPostRequest } = usePostApi();
  const { data, loading, error, makeApiCall } = useApi(LOGIN_USER_API);
  const { socketConnect } = useSocketConnect();

  const handleInputChange = (e) => {
    setLoginData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [e.target.name]: e.target.value,
      },
    }));
  };


  const login = async (e, otp) => {
    e.preventDefault();

    localStorage.setItem("rememberme", rememberme)
    if (rememberme) {
      localStorage.setItem("userNamePass", JSON.stringify({ username: loginData?.data?.username, password: loginData?.data?.password }))
    } else localStorage.removeItem("userNamePass")


    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: otp ? "verifying OTP" : "Loging user...",
    }));
    // makeApiCall(LOGIN_USER_API, loginData);
    const body = loginData
    if (otp) body.data["otp"] = Number(otp)

    const loginApi = new Promise((resolve, reject) => {
      resolve(LOGIN_USER_API(body))
    })
    loginApi.then(res => {
      const { data } = res
      // console.log(res)
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          successFlag: data.is2fa ? false : true,
          successMsg: data.status,
        };
      });

      if (data.is2fa) return setIsTwoFaOpen(true)

      dispatch(LoginAction(data, true));
      // navigate("/dashboard");
      navigate((['account'].includes(res.data.role)) ? "/account" : ['risk'].includes(res.data.role) ? "/risk" : "/dashboard");
      socketConnect();
      let userData = {
        accessgroups: data.accessgroups,
        accessusers: data.accessusers,
        isalreadyloggedin: data.isalreadyloggedin,
        lastlogin: data.lastlogin,
        role: data.role,
        username: data.username,
        company_name: data.company_name,
        accessToken: data.access_token
      }
      localStorage.setItem("data", JSON.stringify(userData));
      updateFavicon(true, data.company_name);

    }).catch(error => {
      setNotifyData((prev) => ({
        ...prev,
        loadingFlag: false,
        errorFlag: true,
        errorMsg: error.response?.data.reason || error.response?.data.result,
        headerMsg: error.code,
        activesession: error.response?.data?.isalreadyloggedin,
      }));

    })

  };

  // useEffect(() => {
  //   if (loading) {
  //     setNotifyData((data) => ({
  //       ...data,
  //       loadingFlag: true,
  //       loadingMsg: "Loging user...",
  //     }));
  //   }
  //   if (data?.httpstatus === 200) {
  //     // dispatch(LoginAction(true));
  //     // console.log("*****************", data);
  //     dispatch(LoginAction(data, true));
  //     // dispatch(AccessgroupsAction(data.accessgroups));
  //     navigate("/dashboard");
  //     socketConnect();
  //     localStorage.setItem("data", JSON.stringify(data));
  //     // localStorage.setItem("username", data.username);
  //     loginData?.data?.rememberme == true && localStorage.setItem("userNamePass", JSON.stringify({ username: loginData?.data?.username, password: loginData?.data?.password }))
  //     loginData?.data?.rememberme == false && localStorage.getItem("userNamePass") && localStorage.removeItem("userNamePass")
  //     setNotifyData((prev) => {
  //       return {
  //         ...prev,
  //         loadingFlag: false,
  //         successFlag: true,
  //         successMsg: data.status,
  //       };
  //     });
  //   } else if (error) {
  //     console.log("error", error);
  //     setNotifyData((prev) => {
  //       return {
  //         ...prev,
  //         loadingFlag: false,
  //         errorFlag: true,
  //         errorMsg: error.response?.data.reason,
  //         headerMsg: error.code,
  //         activesession: error.response?.data.isalreadyloggedin,
  //       };
  //     });
  //   }
  // }, [data, error, loading]);

  const togglePasswordVisibility = (previous) => {
    setLoginData((previous) => ({
      ...previous,
      data: {
        ...previous.data,
        pwdvisibilty: !previous.data.pwdvisibilty,
      },
    }));
  };

  return (
    <>
      {isTwoFaOpen ? <TwoFAPage callback={login} /> : (
        <div className={authlogin.authentication}>
          <Row className={authlogin.loginSection}>
            <div className="col-md-6 ps-0">
              {/* <div className={authlogin.logoSection}>
                <NavLink to="/" className={authlogin.logo}>
                  <img
                    src={mainlogo}
                    alt="mainlogo"
                    className={authlogin.responsiveimg}
                  />
                </NavLink>
              </div> */}
              <div className={authlogin.loginCardSection}>
                <div className={`${authlogin.loginCard} login-card`}>
                  <h3 className={authlogin.heading}>Login</h3>
                  <Form onSubmit={login}>
                    <Form.Group className={authlogin.userSetion}>
                      <Form.Label htmlFor="username" className="form-label">
                        Username
                      </Form.Label>
                      <Form.Control
                        required
                        name="username"
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Enter your username"
                        autoComplete="username"
                        value={loginData?.data?.username}
                        onChange={handleInputChange}
                      />
                      <span className={authlogin.userIcon}>
                        <FaUser />
                      </span>
                    </Form.Group>
                    <Form.Group className={authlogin.passwordSection}>
                      <Form.Label htmlFor="password"> Password</Form.Label>
                      <Form.Control
                        name="password"
                        required
                        type={loginData.data.pwdvisibilty ? "text" : "password"}
                        className="form-control"
                        id="password"
                        placeholder="Enter Your password "
                        autoComplete="current-password"
                        value={loginData?.data?.password}
                        onChange={handleInputChange}
                      />
                      <i
                        onClick={togglePasswordVisibility}
                        className={authlogin.adminPassHideShow}
                      >
                        {loginData.data.pwdvisibilty ? (
                          <>
                            <BsFillEyeFill className={authlogin.eyeIcon} />
                          </>
                        ) : (
                          <BsFillEyeSlashFill className={authlogin.eyeIcon} />
                        )}
                      </i>
                    </Form.Group>
                    <Form.Group className="mb-3 ">
                      <Form.Check
                        type="switch"
                        label="Remember me"
                        name="rememberme"
                        onChange={(e) => setRememberme(e.target.checked)}
                        checked={rememberme}
                      // defaultChecked={ localStorage.getItem("rememberme") == "true" ? true : false }
                      />
                    </Form.Group>
                    <Form.Group className={authlogin.customBtn}>
                      <button
                        type="submit"
                        value="Login"
                        className={authlogin.sigleCustomBtn}
                      >
                        Login
                      </button>
                    </Form.Group>
                  </Form>
                </div>
              </div>
            </div>

            <div className={`col-md-6 ${authlogin.backgroundSection}`}>
              <img src={loginBg} alt="" className={authlogin.backgroundBanner} />
            </div>
          </Row>

          {/* <InfoModal
        show={modalDetails.show}
        onHide={() => setModalDetails({ ...modalDetails, show: false })}
        modalDetails={modalDetails}
        loginData={loginData}
      /> */}

        </div>
      )}
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        loginData={loginData}
      />
    </>
  )
};

export default memo(Login);
