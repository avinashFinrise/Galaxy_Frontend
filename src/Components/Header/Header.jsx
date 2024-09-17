import { Badge } from "@mui/material";
import { DatePicker, Switch } from "antd";
import dayjs from "dayjs";
import { memo, useCallback, useEffect, useState } from "react";
import {
  Container,
  Form,
  Nav,
  NavDropdown,
  Navbar,
  Offcanvas,
} from "react-bootstrap";
import { CiStreamOff, CiStreamOn } from "react-icons/ci";
import { IoMdNotifications } from "react-icons/io";
import { LiaDownloadSolid } from "react-icons/lia";
import { RiFileExcel2Line } from "react-icons/ri";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { FaSave } from "react-icons/fa";
import {
  GET_COMPONENTSETTING_API,
  GET_USER_SETTINGS_API,
  LOGOUT_USER_API,
  POST_COMPONENTSETTING_API,
  POST_RESTARTSERVICE_API
} from "../../API/ApiServices";
import {
  ChangeThemeAction,
  DateAction,
  LoginAction,
  PinnedNavAction,
  ResetState,
  SocketDisconnectAction,
  ToggleDashboardMode,
  ToggleIsLiveAction
} from "../../Redux/RMSAction";
import { updateFavicon } from "../../UtilityFunctions/conditionalFavicon";
import { today } from "../../UtilityFunctions/getTodayDate";
import lightlogo from "../../assets/logo/cosmic-logo.png";

import mobilelog from "../../assets/logo/favicon-new.png";
import finriselogo from '../../assets/logo/finrise-logo.png';
import darklogo from "../../assets/logo/logo.png";

import spectraLogo from "../../assets/logo/Spectra-global-light.png";
import mobileSpectralog from "../../assets/logo/spctra-logo.png";
import spectradarkLogo from "../../assets/logo/spectra-globallogo.png";
import mobileSpectralight from "../../assets/logo/spectralogo-light.png";
import galaxylogo from "../../assets/logo/galaxy-logo.png";

import userImg from "../../assets/Icon/usericon1.png";
import useSocketConnect from "../CustomHook/useSocketConnect";
import AddWindowPopup from "../Dashboard/DashbordWindow/AddWindowPopup";
import { DownloadReport } from "../DownloadReport";
import { ModalPopup } from "../DynamicComp";
import { Notification } from "../DynamicComp/Notification";
import NotificationAlert from "../NotificationAlert/NotificationAlert";
import headerStyle from "./Header.module.scss";

const componentInfo = { componentname: "root", componenttype: "app" }

// function clearLocalStorageExcept(keysToKeep) {
//   for (var key in localStorage) {
//     if (localStorage.hasOwnProperty(key) && !keysToKeep.includes(key)) {
//       localStorage.removeItem(key);
//     }
//   }
// }

const { RangePicker } = DatePicker;

const Header = () => {
  const userControlSettings = useSelector(
    (state) => state.userControlSettings,
    shallowEqual
  );
  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );
  const notificationAlertData = useSelector(
    (state) => state?.isNotificationAlert,
    shallowEqual
  );

  useEffect(() => {
    console.log({ Changed: notificationAlertData })
  }, [notificationAlertData])
  // console.log("notificationAlertData", notificationAlertData.length);
  const [lastUpdatedDate, setLastUpdatedDate] = useState("connected");

  const dispatch = useDispatch();
  const isEditable = useSelector(s => s.isDashboardEditable)


  const [mode, setMode] = useState(() => {
    return localStorage.getItem("theme") || "body";
  });

  const [showWindowSetting, setShowWindowSetting] = useState(false);
  const [showDownloadReport, setShowDownloadReport] = useState(false);
  const [userData, setuserData] = useState({});
  const [userdate, setUserdate] = useState();
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  // const [notificationData, setNotificationData] = useState([])

  const { socketConnect, SocketDisconnect } = useSocketConnect();
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const [componentSetting, setComponentSetting] = useState(null)
  const ws = useSelector((state) => state.websocket, shallowEqual);
  const [isLive, setIsLive] = useState(true)



  const [isVisible, setIsVisible] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(true);

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
    setNotifyData((data) => ({ ...data, confirmFlag: false }))
  }
  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };
  const [dataDateRange, setDataDateRange] = useState({ fromdate: '', todate: "" })

  const onthemeChange = useCallback(({ target }) => {
    // console.log({ mode });
    const newMode = mode === "dark" ? "body" : "dark"


    // console.log("dddf", { componentSetting })
    const id = componentSetting[componentInfo.componenttype]?.id
    const body = {
      event:
        id ? "update" : "create",
      data: { ...componentInfo, setting: { theme: newMode }, }
    }
    if (id) body.data["id"] = id
    POST_COMPONENTSETTING_API(body)
    setMode(newMode);
    // console.log(newMode);
  }, [componentSetting, mode]);

  // console.log("mode", mode)

  useEffect(() => {
    (async () => {
      const getDate = await GET_USER_SETTINGS_API();
      // console.log(getDate.data.result[0].createddate);
      if (getDate.status == 200) {
        setUserdate(dayjs(getDate.data.result[0].date_range.fromdate));
      }

      const { data } = await GET_COMPONENTSETTING_API(componentInfo);
      setComponentSetting(data.result)

      const theme = data.result[componentInfo.componenttype]?.setting?.theme
      // console.log({ theme })
      if (theme) setMode(theme)
      // console.log(getDate.data.result[0].createddate);

    })();
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", mode);
    if (mode === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    dispatch(ChangeThemeAction(mode));
  }, [mode]);

  useEffect(() => {
    if (!ws.status) return;
    let date;
    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "netposition") {
        date = new Date();
        let currentHour = date.getHours();
        let currentMinute = date.getMinutes();
        let currentSeconds = date.getSeconds();

        let currentYear = date.getFullYear();
        let currentMonth = date.getMonth() + 1;
        let currentDate = date.getDate();
        setLastUpdatedDate(
          `${currentYear}-${currentMonth}-${currentDate} ${currentHour}:${currentMinute}:${currentSeconds}`
        );
      }

      if (newData.event == "remotelogout") {
        window.location.reload()
      }
    };
    // let interval = setInterval(() => {
    //   let currentHour = date.getHours();
    //   let currentMinute = date.getMinutes();

    //   let currentYear = date.getFullYear();
    //   let currentMonth = date.getMonth() + 1;
    //   let currentDate = date.getDate();
    //   setLastUpdatedDate(
    //     `${currentDate}/${currentMonth}/${currentYear}.${currentHour}:${currentMinute}`
    //   );
    // }, 60000);
    ws.connection.addEventListener("message", eventListener);
    // console.log("cursor: pointer;*****************", ws.status);

    return () => {
      // clearInterval(interval);
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  const logoutUser = async () => {
    const logoutApi = await LOGOUT_USER_API();
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "logout User...",
    }));
    if (logoutApi?.data?.httpstatus === 200) {
      setNotifyData((prev) => {
        return { ...prev, loadingFlag: false, confirmFlag: false };
      });
      dispatch(SocketDisconnectAction(false));
      dispatch(LoginAction(false));
      // if (!localStorage.getItem('rememberme') || localStorage.getItem('rememberme') == 'false') {
      // localStorage.removeItem("data");
      // localStorage.removeItem("theme");

      updateFavicon(false, null);
      let rememberme = localStorage.getItem('rememberme')
      if (rememberme) {
        for (var key in localStorage) {
          if (localStorage.hasOwnProperty(key) && !['rememberme', 'userNamePass'].includes(key)) {
            localStorage.removeItem(key);
          }
        }
        // clearLocalStorageExcept(['rememberme', 'userNamePass'])
      } else { localStorage.clear() }

      dispatch(ResetState())
      // window.location.reload();
      // }
    }
    else {
      setNotifyData((data) => ({ ...data, loadingFlag: false, confirmFlag: false, errorFlag: true, errorMsg: "error" }))
      // navigate("/")
    }
    // makeApiCall(LOGOUT_USER_API());
    // dispatch(LoginAction(false));
    // SocketDisconnect();
  };

  const handleRestartAllService = async (e, eventName) => {
    e.preventDefault();
    setNotifyData((prev) => ({
      ...prev,
      loadingFlag: true,
      loadingMsg: "Please Wait...",
    }));
    const restartData = new Promise((resolve, reject) => {
      resolve(POST_RESTARTSERVICE_API({ event: eventName }));
    });
    restartData
      .then((res) => {
        // console.log(res);
        setNotifyData({
          loadingFlag: false,
          successFlag: true,
          confirmFlag: false,
          successMsg: res.data.result
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  const windowCardSetting = () => setShowWindowSetting(p => !p)
  const downloadReport = () => setShowDownloadReport(p => !p)

  const closeOffcanvas = () => setShowOffcanvas(false);


  // const getMonday=()=>{
  //   const currentDate=new Date();
  //   const currentDayOfWeek=currentDate.getDay();
  //   const daysToMonday=(currentDayOfWeek===0)?6:(1-currentDayOfWeek);

  //   const mondayOfCurrentWeek=new Date(currentDate);
  //   mondayOfCurrentWeek.setDate(currentDate.getDate()+daysToMonday);

  //   const year=mondayOfCurrentWeek.getFullYear();
  //   const month=String(mondayOfCurrentWeek.getMonth()+1).padStart(2,'0');
  //   const day=String(mondayOfCurrentWeek.getDate()).padStart(2,'0');

  //   return `${year}-${month}-${day}`;
  // }

  // const yesterdayDate=()=>{
  //   const currentDate=new Date();
  //   const year=currentDate.getFullYear();
  //   const month=String(currentDate.getMonth()+1).padStart(2,'0');
  //   const day=String(currentDate.getDate()).padStart(2,'0');

  //   return `${year}-${month}-${day}`
  // }

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("data"));
    setuserData(userData);

    const fetchDate = new Promise((resolve, reject) => {
      resolve(GET_COMPONENTSETTING_API({ componentname: 'dateRange' }))
    })
    fetchDate.then(res => {
      let { fromdate } = res?.data?.result?.date?.setting
      if (res?.data?.result?.date?.setting?.fromdate) {
        setDataDateRange(res.data.result)
        dispatch(DateAction([res?.data?.result?.date?.setting?.fromdate, today()]))
      }
      // setDataDateRange(res.data.result)
    })
  }, []);
  const [navComponentSetting, setNavComponentSetting] = useState(null)
  const componentInfoNav = { componentname: "navbar", componenttype: "layout" }

  // useEffect(() => {}, []);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfoNav)
        setNavComponentSetting(data.result)

        const setting = data.result[componentInfoNav.componenttype]?.setting
        // console.log({ ress: setting })
        if (setting) {
          if (setting["isNavVisible"]) setIsNavVisible(setting["isNavVisible"])
        }
      } catch (error) {
        console.log({ error })
      }
    })()
  }, [])

  useEffect(() => {
    console.log("Called")
    if (navComponentSetting === null) return
    const id = navComponentSetting[componentInfoNav.componenttype]?.id
    // console.log({ id })

    const body = {
      event: id ? "update" : "create",
      data: {
        ...componentInfoNav,
        setting: { isNavVisible },
      },
    }
    dispatch(PinnedNavAction(isNavVisible))
    if (id) body.data["id"] = id;

    (async () => {
      try {
        const { data } = await POST_COMPONENTSETTING_API(body)
      } catch (error) {
        console.log({ error })
      }
    })()
  }, [isNavVisible])

  const handleDateChange = (date, dateString) => {
    dispatch(DateAction(dateString));
    const updateDate = new Promise((resolve, reject) => {
      let dataToSend = {
        data: {
          componentname: 'dateRange',
          componenttype: 'date',
          setting: { fromdate: dateString[0], todate: dateString[1] }
        },
        event: dataDateRange?.date?.id ? 'update' : 'create'
      };
      if (dataDateRange?.date?.id) dataToSend.data.id = dataDateRange.date.id
      // dataDateRange.date.id && dataToSend.data.id=dataDateRange.date.id
      resolve(POST_COMPONENTSETTING_API({ ...dataToSend }))
    })
    updateDate.then(res => console.log(res)).catch(err => console.log(err))

    // localStorage.setItem(
    //   "dateRange",
    //   JSON.stringify({ fromdate: dateString[0], todate: dateString[1] })
    // );
  };

  // useEffect(() => {
  //   (() => {
  //     const getNotice = new Promise((resolve, reject) => {
  //       resolve(GET_NOTIFICATION_API())
  //     })
  //     getNotice
  //       .then((res) => {
  //         setNotificationData(res?.data?.result?.reverse())
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   })();
  // }, [])


  // console.log("is_usermanagement", userControlSettings);

  // // userControlSettings.setting_control?.defaulttheme == "dark" &&
  // themeSetting == "dark"
  //   ? document.body.classList.add("dark")
  //   : document.body.classList.remove("dark");


  const formattedLastLogin = new Date(userData?.lastlogin).toLocaleString();



  const onMouseEnter = useCallback(() => setIsVisible(false));
  const onMouseLeave = useCallback(() => setIsVisible(true));
  useEffect(() => {
    const handleResize = () => {
      // Adjust this value according to your preferred breakpoint
      const isDesktop = window.innerWidth > 768;
      setIsVisible(isDesktop ? isVisible : false);
    };

    // Initial check on mount
    handleResize();

    // Add resize event listener to check on window resize
    window.addEventListener('resize', handleResize);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);
  const pinedNavBar = (props) => {
    setIsNavVisible((prev) => {
      const newState = props;
      // localStorage.setItem('pinNavbar', JSON.stringify(newState));
      return !prev;
    });
  };
  // useEffect(() => {
  //   // Load the visibility state from local storage on component mount
  //   const storedVisibility = localStorage.getItem('pinNavbar');
  //   if (storedVisibility !== null) {
  //     setIsNavVisible(JSON.parse(storedVisibility));
  //   }
  // }, []);


  const handleSaveNetmtm = async () => {
    setNotifyData((prev) => {
      return { ...prev, loadingFlag: true, loadingMsg: "Saving netposition..." };
    });
    try {
      const { data } = await POST_RESTARTSERVICE_API({ event: "save_netmtm" })
      // console.log("data", data)
      setNotifyData((prev) => {
        return { ...prev, loadingFlag: false, confirmFlag: false, successFlag: true, successMsg: data.result };
      });
    } catch (error) {
      console.log("error")
      setNotifyData((prev) => {
        return { ...prev, loadingFlag: false, confirmFlag: false, successFlag: false, errorFlag: true, errorMsg: "something went wrong" };
      });
    }
  }
  return (
    <div onMouseEnter={onMouseEnter}
    >
      {isVisible && !isNavVisible ?
        <div style={{ padding: '0.3rem' }}></div>
        :
        <Navbar
          expand="lg"
          onMouseLeave={onMouseLeave}
          collapseOnSelect
          className={`${headerStyle.headerMainSection} headerMainSection `}
          style={{
            transition: !isVisible ? "background-color 0.6s ease-in-out" : null,
          }}
        >
          <Container fluid className={headerStyle.constinerFluid}>
            <Navbar.Brand
              as={Link}
              to="/dashboard"
              className={headerStyle.brandSection}
            >
              {
                import.meta.env.VITE_REACT_APP_COMPANY == "spectra" ? <>
                  <img src={mode === "body" ? spectraLogo : spectradarkLogo} alt="spectra" className={headerStyle.spectraLogo} />
                  <img src={mode === "body" ? mobileSpectralight : mobileSpectralog} alt="spectra" className={headerStyle.mobResponsiveSpectraimg} />
                </>
                  :
                  import.meta.env.VITE_REACT_APP_COMPANY == "galaxy" ? <img src={galaxylogo} alt="galaxy" className={headerStyle.galaxylogo} />
                    :
                    userData?.company_name == 'cosmic' ?
                      <>
                        <img src={mode === "body" ? lightlogo : darklogo} alt="cosmiclogo" className={`${headerStyle.responsiveimg} `} />
                        <img src={mobilelog} alt="cosmiclogo" className={headerStyle.mobResponsiveimg} />
                      </>
                      : userData.company_name == "finrise" && <img src={finriselogo} alt="finriselogo" className={headerStyle.finriselogo} />
              }

            </Navbar.Brand>
            {/* <a href="http://192.168.15.63:5006/" >Hello</a> */}
            <div className={headerStyle.mobileMenuBtnSection}>
              <div className={headerStyle.menuSection}>
                <div className={`${headerStyle.datesection} dateSection`}>
                  <div className={headerStyle.datesinglesection}>
                    {/* <p>Select Date Range</p> */}
                    <RangePicker
                      onChange={handleDateChange}
                      format="YYYY-MM-DD"
                      defaultValue={[
                        dayjs(dateRange.fromdate),
                        dayjs(dateRange.todate),
                      ]}
                      disabledDate={(current) => {
                        // return userdate && current < userdate.startOf("day");
                        if (userdate && dayjs(userdate).isValid()) {
                          return current.isBefore(userdate.startOf("day")) || current > Date.now();
                        }
                        return false;
                      }}
                      disabled={[false, isLive]}

                      className={headerStyle.datepicker}
                    />
                  </div>
                </div>
                {/* <div> */}

                <Form.Check
                  type="checkbox"
                  id="default-checkbox"
                  label="Live"
                  className={headerStyle.livecheckbox}
                  checked={isLive}
                  onChange={(e) => {
                    if (!isLive) {
                      let date = [dateRange.fromdate, today()]
                      handleDateChange(e, date)
                    }
                    setIsLive(previous => !previous)
                    // if (!ws.status) {
                    //   socketConnect();
                    // } else {
                    //   dispatch(SocketDisconnectAction(!ws.status));
                    // }
                  }}
                />
                {/* </div> */}
              </div>

              <div className={headerStyle.blinkingSection}>
                <span>
                  {ws.status == true ? (
                    <span className={`${headerStyle.blinkCircle} blinkCircle`}>
                      <CiStreamOn />
                    </span>
                  ) : (
                    <span className={headerStyle.blinkCircle1}>
                      <CiStreamOff />
                    </span>
                  )}
                </span>
              </div>
              <Navbar.Toggle
                aria-controls={`offcanvasNavbar-expand-lg`}
                className={headerStyle.mobileMenuOpen}
                onClick={() => setShowOffcanvas(true)}
              />
            </div>
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-lg`}
              aria-labelledby={`offcanvasNavbarLabel-expand-lg`}
              placement="end"
              className={`${headerStyle.mobileMenuSection} mobileMenuSection`}
              show={showOffcanvas}
              onHide={closeOffcanvas}
            >
              <Offcanvas.Header closeButton className={headerStyle.canvasHeader}>
                <Offcanvas.Title
                  id={`offcanvasNavbarLabel-expand-lg`}
                  className=""
                ></Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body className={headerStyle.bodySection}>
                <Nav className={headerStyle.menuSection}>
                  <div className={`${headerStyle.datesection} dateSection`}>

                    <RangePicker
                      onChange={handleDateChange}
                      format="YYYY-MM-DD"
                      // defaultValue={[
                      //   dayjs(dataDateRange?.date?.setting?.fromdate),
                      //   dayjs(dataDateRange?.date?.setting?.todate),
                      // ]}
                      value={[
                        dayjs(dateRange.fromdate),
                        dayjs(dateRange.todate),
                      ]}
                      disabledDate={(current) => {
                        // return userdate && current < userdate.startOf("day");
                        if (userdate && dayjs(userdate).isValid()) {
                          return current.isBefore(userdate.startOf("day")) || current > Date.now();
                        }
                        return false;
                      }}
                      disabled={[false, isLive]}
                    />
                  </div>
                  <div>
                    <Form.Check
                      type="checkbox"
                      id="default-checkbox"
                      label="Live"
                      className={headerStyle.livecheckbox}
                      checked={isLive}
                      onChange={(e) => {
                        if (!isLive) {
                          let date = [dateRange.fromdate, today()]
                          handleDateChange(e, date)
                        }
                        dispatch(ToggleIsLiveAction(e.target.checked))
                        setIsLive(previous => !previous)
                        // if (!ws.status) {
                        //   socketConnect();
                        // } else {
                        //   dispatch(SocketDisconnectAction(!ws.status));
                        // }
                      }}
                    />
                  </div>
                </Nav>
                <div className={headerStyle.positionSection}>
                  <div className={headerStyle.menubar}>
                    <div className="d-flex flex-row align-items-center">
                      <div className={headerStyle.blinkingSection}>
                        <span>
                          {ws.status == true ? (
                            <span
                              className={`${headerStyle.blinkCircle} blinkCircle`}
                            >
                              <CiStreamOn />
                            </span>
                          ) : (
                            <span className={headerStyle.blinkCircle1}>
                              <CiStreamOff />
                            </span>
                          )}
                        </span>
                      </div>
                      {/* <div className={headerStyle.btnSection}>
                    <button
                      className={`${headerStyle.saveBtn} saveWorkspaceBtn`}
                    >
                      <span>Save Workspace</span>
                      <span className={headerStyle.icon}>
                        <LiaSaveSolid />
                      </span>
                    </button>
                  </div> */}

                      {userControlSettings &&
                        userControlSettings?.setting_control
                          ?.is_savearbmtm &&
                        <div className={headerStyle.btnSection}>
                          <button className={`headerBtn ${headerStyle.spreadBook}`} onClick={handleSaveNetmtm} >
                            Save arbMtm <span className={headerStyle.icon}><FaSave /></span>
                          </button>
                        </div>
                      }
                      {userControlSettings &&
                        userControlSettings?.page_control?.is_netposition && (
                          <div className={headerStyle.btnSection}>
                            <NavLink to="/netposition">
                              <button className={`headerBtn ${headerStyle.spreadBook}`}>
                                Netposition
                                <span className={headerStyle.icon}>
                                  <RiFileExcel2Line />
                                </span>
                              </button>
                            </NavLink>
                          </div>
                        )}
                      {userControlSettings &&
                        userControlSettings?.page_control?.is_spreadbook && (
                          <div className={headerStyle.btnSection}>
                            <NavLink to="/spreadbook">
                              <button className={`headerBtn ${headerStyle.spreadBook}`}>
                                SpreadBook
                                <span className={headerStyle.icon}>
                                  <RiFileExcel2Line />
                                </span>
                              </button>
                            </NavLink>
                          </div>
                        )}
                      <div className={headerStyle.btnSection}>
                        <button
                          className={headerStyle.downloadbtn}
                          onClick={downloadReport}
                        >
                          <span>
                            Report
                            <span className={headerStyle.icon}>
                              <LiaDownloadSolid />
                            </span>
                          </span>
                        </button>
                      </div>

                      <div className={`${headerStyle.dashDataInfo} dashDataInfo `}>
                        <span className={headerStyle.singleItem}>
                          <p>Data Available From</p>
                          {userdate && (
                            <p>{`${userdate.$y}-${userdate["$M"] + 1}-${userdate.$D}`}</p>
                          )}
                        </span>
                      </div>
                      <div
                        // style={{ borderRight: "1px solid #000", }}
                        style={{
                          borderRight:
                            mode == "body"
                              ? "1.5px solid #000"
                              : " 1.5px solid #939393",
                          height: "2rem",
                        }}
                      ></div>
                      <div className={`${headerStyle.dashDataInfo} dashDataInfo`}>
                        <span className={headerStyle.singleItem}>
                          <p>Last Update</p>
                          <p>{lastUpdatedDate}</p>
                        </span>
                      </div>
                      <div className={headerStyle.menuContentSection}>
                        <span className={headerStyle.usernameContent}>
                          {userData?.username}
                        </span>
                        <div className={`notification ${headerStyle.notification}  `}>
                          <div className={headerStyle.dashboardtab}>
                            <NavDropdown
                              title={
                                <div className={headerStyle.userProfilePhoto}>
                                  <img
                                    src={userImg}
                                    alt="user-profile"
                                    className={headerStyle.userImg}
                                  />
                                </div>
                              }
                              id="collasible-nav-dropdown"
                              className="nav-item "
                            >
                              <div
                                className={`${userData?.role?.toLowerCase() == 'admin' ? headerStyle.notificationCard : headerStyle.notifyCardAdmin} notificationCard`}

                              >
                                <NavDropdown.Item>
                                  <p className="fw-bold">
                                    {userData?.role?.toUpperCase()}
                                  </p>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                  <p className="fw-bold">
                                    {userData?.accessusers?.length} UserIDs
                                  </p>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                  Last Login:
                                  <p className="fw-bold">{formattedLastLogin}</p>
                                </NavDropdown.Item>
                                <NavDropdown.Item onClick={windowCardSetting}>
                                  Window Setting
                                </NavDropdown.Item>
                                {userControlSettings &&
                                  userControlSettings?.page_control
                                    ?.is_settings && (
                                    <NavDropdown.Item
                                      id="is_settings"
                                      as={Link}
                                      to="/setting"
                                    >
                                      Setting
                                    </NavDropdown.Item>
                                  )}

                                {/* <NavDropdown.Item as={Link} to="/tabulardash">
                              Tabular Dashboard
                            </NavDropdown.Item>

                                {/* {userData?.role?.toLowerCase() == "admin" && ( */}
                                {userControlSettings &&
                                  userControlSettings?.page_control
                                    ?.is_usermanagement && (
                                    <NavDropdown.Item
                                      as={Link}
                                      to="/usermanagement"
                                    >
                                      User Management
                                    </NavDropdown.Item>
                                  )
                                }
                                {/* )} */}
                                {/* <NavDropdown.Item
                                  as={Link}
                                  to="/arbaccount"
                                >
                                  ARB Account
                                </NavDropdown.Item> */}


                                <NavDropdown.Item onClick={onthemeChange}>
                                  Mode:
                                  <span className={headerStyle.toggle}>
                                    <input
                                      type="checkbox"
                                      id="toggle"
                                      checked={mode === "dark"}
                                      onChange={onthemeChange}
                                    />
                                    <label htmlFor="toggle"></label>
                                  </span>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                  <span>Window Resize: </span>
                                  <Switch className={headerStyle.windowResize} checked={isEditable} onChange={() => dispatch(ToggleDashboardMode())} />
                                </NavDropdown.Item>
                                <NavDropdown.Item
                                  onClick={(e) => setNotifyData((data) => ({ ...data, confirmFlag: true, confirmMsg: "Are you sure you want to Restart Netposition?", confirmAction: (e) => handleRestartAllService(e, "transfer_netposition_rec") }))}
                                >
                                  Restart Netposition
                                </NavDropdown.Item>
                                <NavDropdown.Item
                                  className={headerStyle.logout}
                                  onClick={(e) => setNotifyData((data) => ({ ...data, confirmFlag: true, confirmMsg: "Are you sure you want to logout?", confirmAction: (e) => logoutUser() }))}
                                >
                                  Logout
                                </NavDropdown.Item>
                              </div>
                            </NavDropdown>
                          </div>
                        </div>
                        {userData?.role?.toLowerCase() == 'admin' ?
                          <div
                            className={`notification setting ${headerStyle.notification} ${headerStyle.userSection}`}
                          >
                            <div className={headerStyle.dashboardtab}>
                              <NavDropdown
                                title={
                                  <span className={headerStyle.singleItem}>
                                    <Badge overlap="rectangular"
                                      badgeContent={notificationAlertData && notificationAlertData.length}
                                      className="notification-count">
                                      <IoMdNotifications />
                                    </Badge>
                                  </span>
                                }
                                id="collasible-nav-dropdown"
                                className="nav-item "
                              >
                                <div
                                  className={`${headerStyle.notificationCard} notificationCard`} style={{ height: notificationAlertData.length ? "500px" : "max-content" }}
                                >
                                  <NotificationAlert />
                                </div>
                              </NavDropdown>
                            </div>
                          </div>
                          : null
                        }

                      </div>
                    </div>
                  </div>
                </div>
              </Offcanvas.Body>


              {/* *************************************************************Mobile Section************************************************************* */}
              <Offcanvas.Body className={headerStyle.mobileBodySection}>
                <Nav className="" onClick={closeOffcanvas}>
                  <div className={headerStyle.userProfileSection}>
                    <div className={headerStyle.userProfilePhoto}>
                      <img
                        src={userImg}
                        alt="user-profile"
                        className={headerStyle.userImg}
                      />
                    </div>
                    <div
                      className={`${headerStyle.userProfileContent} userProfileContent`}
                    >
                      <p>
                        {userData?.username}
                      </p>
                      <p>
                        <span>({userData?.role})</span>
                      </p>
                      {/* <span>@{userData.username}</span> */}
                    </div>
                  </div>
                  <div>
                    {userControlSettings &&
                      userControlSettings?.setting_control
                        ?.is_savearbmtm && (
                        <div className={headerStyle.btnSection}>
                          <button className={headerStyle.spreadBook}>
                            Save arbMtm
                            <span className={headerStyle.icon}>
                              <FaSave />
                            </span>

                          </button>
                        </div>
                      )}
                    {userControlSettings &&
                      userControlSettings?.page_control?.is_netposition && (
                        <div className={headerStyle.btnSection}>
                          <button className={headerStyle.spreadBook}>
                            <NavLink to="/netposition">
                              Netposition
                              <span className={headerStyle.icon}>
                                <RiFileExcel2Line />
                              </span>
                            </NavLink>
                          </button>
                        </div>
                      )}


                    {userControlSettings &&
                      userControlSettings?.page_control?.is_spreadbook && (
                        <div className={headerStyle.btnSection}>
                          <button className={headerStyle.spreadBook}>
                            <NavLink to="/spreadbook"> SpreadBook</NavLink>
                            <span className={headerStyle.icon}>
                              <RiFileExcel2Line />
                            </span>
                          </button>
                        </div>
                      )}

                    <div className={headerStyle.btnSection}>
                      <button
                        className={headerStyle.downloadbtn}
                        onClick={downloadReport}
                      >
                        <span>
                          Report
                          <span className={headerStyle.icon}>
                            <LiaDownloadSolid />
                          </span>
                        </span>
                      </button>
                    </div>

                    <div className={`${headerStyle.dashDataInfo} dashDataInfo `}>
                      <span className={headerStyle.singleItem}>
                        <p>Last Login</p>
                        <p className={headerStyle.lastLogin}>
                          {formattedLastLogin}
                        </p>
                      </span>
                    </div>
                    <div className={`${headerStyle.dashDataInfo} dashDataInfo`}>
                      <span className={headerStyle.singleItem}>
                        <p>Data Available From </p>
                        {userdate && (
                          <p>{`${userdate.$y}-${userdate["$M"] + 1}-${userdate.$D}`}</p>
                        )}
                      </span>
                    </div>
                    <div className={`${headerStyle.dashDataInfo} dashDataInfo`}>
                      <span className={headerStyle.singleItem}>
                        <p>Last Update</p>
                        <p>{lastUpdatedDate}</p>
                      </span>
                    </div>
                    <div className={`${headerStyle.dashDataInfo} dashDataInfo`}>
                      <p className={headerStyle.totleUsersAllocated}>
                        Total users allocated :
                        <span> {userData?.accessusers?.length}</span>
                      </p>

                      {userControlSettings &&
                        userControlSettings?.page_control?.is_settings && (
                          <p className={`${headerStyle.setting} setting`}>
                            <NavLink to="/setting">Setting</NavLink>
                          </p>
                        )}
                      <p className={headerStyle.totleUsersAllocated}
                        onClick={(e) => setNotifyData((data) => ({ ...data, confirmFlag: true, confirmMsg: "Are you sure you want to logout?", confirmAction: (e) => logoutUser() }))}
                      >
                        Restart Netposition
                      </p>
                      {/* <p className={`${headerStyle.setting} setting`}>
                        <NavDropdown.Item
                          as={Link}
                          to="/arbaccount"
                        >
                          ARB Account
                        </NavDropdown.Item>
                      </p> */}



                      {/* {userData?.role?.toLowerCase() == "admin" && ( */}
                      {/* {userControlSettings &&
                    userControlSettings?.page_control?.is_usermanagement && (
                      <p className={`${headerStyle.setting} setting`}>
                        <NavLink to="/usermanagement">User Management</NavLink>
                      </p>
                    )} */}
                      {/* )} */}
                    </div>
                  </div>
                  <div
                    style={{ border: " 1px solid #CCCED2", marginTop: "1.5rem" }}
                  >
                  </div>
                  <div className={headerStyle.mobileBtnSection}>
                    <div className={headerStyle.modeSection}>
                      <p className={headerStyle.btnContent}> Mode :</p>
                      <div className={`toggle ${headerStyle.toggle}`}>
                        <input
                          type="checkbox"
                          id="toggle"
                          checked={mode === "dark"}
                          onChange={onthemeChange}
                        />
                        <label htmlFor="toggle"></label>
                      </div>
                    </div>

                    <div>
                      <button
                        className={`logoutBtn ${headerStyle.logoutBtn}`}
                        // onClick={logoutUser}
                        onClick={(e) => setNotifyData((data) => ({ ...data, confirmFlag: true, confirmMsg: "Are you sure you want to logout?", confirmAction: (e) => logoutUser() }))}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>

        </Navbar>

      }

      <ModalPopup
        fullscreen={false}
        size="xl"
        title={"Window Settings"}
        flag={showWindowSetting}
        close={windowCardSetting}
        component={<AddWindowPopup windowCardSetting={windowCardSetting} pinedNavBar={pinedNavBar} isNavVisible={isNavVisible} />}
      />

      <ModalPopup
        className={"mtmSymbolWisePop downloadReport"}
        fullscreen={false}
        title=""
        flag={showDownloadReport}
        close={downloadReport}
        component={
          <DownloadReport mode={mode} downloadReport={downloadReport} />
        }
      />
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
    </div >
  );
};

export default memo(Header);
