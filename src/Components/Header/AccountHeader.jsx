import { memo, useCallback, useEffect, useState } from "react";
import {
    Container,
    Nav,
    Navbar,
    Offcanvas,
} from "react-bootstrap";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import {
    GET_COMPONENTSETTING_API,
    LOGOUT_USER_API,
    POST_COMPONENTSETTING_API,
} from "../../API/ApiServices";
import {
    ChangeThemeAction,
    LoginAction,
    PinnedNavAction,
    ResetState,
    SocketDisconnectAction,
} from "../../Redux/RMSAction";
import { updateFavicon } from "../../UtilityFunctions/conditionalFavicon";
import lightlogo from "../../assets/logo/cosmic-logo.png";

import mobilelog from "../../assets/logo/favicon-new.png";
import finriselogo from '../../assets/logo/finrise-logo.png';
import darklogo from "../../assets/logo/logo.png";

import spectraLogo from "../../assets/logo/Spectra-global-light.png";
import mobileSpectralog from "../../assets/logo/spctra-logo.png";
import { LiaDownloadSolid } from "react-icons/lia";

import spectradarkLogo from "../../assets/logo/spectra-globallogo.png";
import mobileSpectralight from "../../assets/logo/spectralogo-light.png";
import { Notification } from "../DynamicComp/Notification";
import headerStyle from "./Header.module.scss";

const componentInfo = { componentname: "root", componenttype: "app" }


const AccountHeader = () => {
    const dispatch = useDispatch();


    const [mode, setMode] = useState(() => {
        return localStorage.getItem("theme") || "body";
    });
    const [userData, setuserData] = useState({});
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const [componentSetting, setComponentSetting] = useState(null)
    const ws = useSelector((state) => state.websocket, shallowEqual);



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
            const { data } = await GET_COMPONENTSETTING_API(componentInfo);
            setComponentSetting(data.result)
            const theme = data.result[componentInfo.componenttype]?.setting?.theme
            if (theme) setMode(theme)

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

            updateFavicon(false, null);
            let rememberme = localStorage.getItem('rememberme')
            if (rememberme) {
                for (var key in localStorage) {
                    if (localStorage.hasOwnProperty(key) && !['rememberme', 'userNamePass'].includes(key)) {
                        localStorage.removeItem(key);
                    }
                }
            } else { localStorage.clear() }

            dispatch(ResetState())

        }
        else {
            setNotifyData((data) => ({ ...data, loadingFlag: false, confirmFlag: false, errorFlag: true, errorMsg: "error" }))
        }
    };


    const closeOffcanvas = () => setShowOffcanvas(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("data"));
        setuserData(userData);

    }, []);
    const [navComponentSetting, setNavComponentSetting] = useState(null)
    const componentInfoNav = { componentname: "navbar", componenttype: "layout" }

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

    var loginroute = JSON.parse(localStorage.getItem("data"));
    return (
        <div onMouseEnter={onMouseEnter}>
            {isVisible && !isNavVisible ?
                <div style={{ padding: '0.3rem' }}></div>
                :
                <Navbar expand="lg"
                    onMouseLeave={onMouseLeave}
                    collapseOnSelect
                    className={`${headerStyle.headerMainSection} headerMainSection `}
                    style={{
                        transition: !isVisible ? "background-color 0.6s ease-in-out" : null,
                    }}>
                    <Container fluid className={headerStyle.constinerFluid}>
                        <Navbar.Brand
                            as={Link}
                            to={(['account'].includes(loginroute.role)) ? "/account" : "/risk"}
                            className={headerStyle.brandSection}
                        >
                            {
                                import.meta.env.VITE_REACT_APP_COMPANY == "spectra" ? <>
                                    <img src={mode === "body" ? spectraLogo : spectradarkLogo} alt="spectra" className={headerStyle.spectraLogo} />
                                    <img src={mode === "body" ? mobileSpectralight : mobileSpectralog} alt="cosmiclogo" className={headerStyle.mobResponsiveSpectraimg} />
                                </>
                                    :
                                    userData?.company_name == 'cosmic' ?
                                        <>
                                            <img src={mode === "body" ? lightlogo : darklogo} alt="cosmiclogo" className={`${headerStyle.responsiveimg} `} />
                                            <img src={mobilelog} alt="cosmiclogo" className={headerStyle.mobResponsiveimg} />
                                        </>
                                        : userData.company_name == "finrise" && <img src={finriselogo} alt="finriselogo" className={headerStyle.finriselogo} />
                            }

                        </Navbar.Brand>
                        <div className={headerStyle.mobileMenuBtnSection} style={{ justifyContent: "end" }}>

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
                                <Offcanvas.Title id="offcanvasNavbarLabel-expand-lg"></Offcanvas.Title>
                            </Offcanvas.Header>
                            <Offcanvas.Body className={headerStyle.navbarBody}>

                                <Nav className="justify-content-end align-items-center flex-grow-1 ">
                                    {loginroute.role == "account" ?
                                        (
                                            <>
                                                <div className={headerStyle.btnSection}>
                                                    <NavLink to="/account">
                                                        <button className={`headerBtn ${headerStyle.spreadBook}`}>
                                                            Account Table
                                                        </button>
                                                    </NavLink>
                                                </div>
                                                <div className={headerStyle.btnSection}>
                                                    <NavLink to="/arbtable">
                                                        <button className={`headerBtn ${headerStyle.spreadBook}`}>
                                                            Arb Table
                                                        </button>
                                                    </NavLink>
                                                </div>
                                                <div className={headerStyle.btnSection}>
                                                    <NavLink to="/inrusdposting">
                                                        <button className={`headerBtn ${headerStyle.spreadBook}`}>
                                                            InrUsd Posting
                                                        </button>
                                                    </NavLink>
                                                </div>
                                            </>

                                        ) :
                                        null}
                                    {
                                        loginroute.role == "risk" ?
                                            (<>
                                                <div className={headerStyle.btnSection}>
                                                    <NavLink to="/risk">
                                                        <button className={`headerBtn ${headerStyle.spreadBook}`}>
                                                            Limit Table
                                                        </button>
                                                    </NavLink>
                                                </div>

                                            </>

                                            )
                                            :
                                            ''
                                    }
                                    {/* <div className={headerStyle.btnSection}>
                                        <NavLink to="/report">
                                            <button className={`headerBtn ${headerStyle.spreadBook}`}>
                                                Report
                                                <span className={headerStyle.icon}>
                                                    <LiaDownloadSolid />
                                                </span>
                                            </button>
                                        </NavLink>
                                    </div> */}
                                    <div className={headerStyle.menuContent}>
                                        <div className={headerStyle.modeSection}>
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
                                        <p className={`mb-0 ${headerStyle.usernameContent}`}>
                                            {userData?.username} <span>  ({userData?.role})</span>
                                        </p>
                                        {/* <div className={headerStyle.userProfilePhoto}>
                                            <img
                                                src={userImg}
                                                alt="user-profile"
                                                className={headerStyle.userImg}
                                            />
                                        </div> */}
                                    </div>

                                    <div className="">
                                        <button
                                            className={headerStyle.logoutBtn}
                                            // onClick={logoutUser}
                                            onClick={(e) => setNotifyData((data) => ({ ...data, confirmFlag: true, confirmMsg: "Are you sure you want to logout?", confirmAction: (e) => logoutUser() }))}
                                        >
                                            Logout
                                        </button>
                                    </div>

                                </Nav>

                            </Offcanvas.Body>
                        </Navbar.Offcanvas>
                    </Container>
                </Navbar>
            }
            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
                CloseConfirm={CloseConfirm}
            />
        </div>
    );
}

export default AccountHeader;