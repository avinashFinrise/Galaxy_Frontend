import { lazy, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { CHECK_SESSION_API, GET_USERSETTING_API } from "../../API/ApiServices";
import { AllowedWindowsAction, LoginAction, UserControlAction } from "../../Redux/RMSAction";
import { updateFavicon } from "../../UtilityFunctions/conditionalFavicon";
import useApi from "../CustomHook/useApi";
import useSocketConnect from "../CustomHook/useSocketConnect";
import { AccountHeader, Header } from "../Header";
import Test from "../customComponents/multiSelectInput/Test";
import PdfWithChart from "../temp/DownloadPdfCart";
import TestBfLiveMerged from "../temp/TestBfLiveMerged";
import { ProtectedRoutes, PublicRoutes } from "./ProtectedRoute";
import style from "./Routes.module.scss";

//pages
const SpreadBook = lazy(() => import("../SpreadBook/SpreadBook"))
const Setting = lazy(() => import("../Settings/Setting"))
const Dashboard = lazy(() => import("../Dashboard/Dashboard"))
const Position = lazy(() => import("../Netposition/Position"))
const Register = lazy(() => import("../Authentication/Register"))
const Login = lazy(() => import("../Authentication/Login"))
const UserManagement = lazy(() => import("../UserManagement/UserManagement"))
// const ARBAccount = lazy(() => import("../ARBAccount/ARBAccount"))
const Risk = lazy(() => import("../../AccoutPages/Risk/Risk"))
const Account = lazy(() => import("../../AccoutPages/Account/Account"))
const Arbpage = lazy(() => import("../../AccoutPages/Account/Arbpage/Arbpage"))
// const GroupReport = lazy(() => import("../../AccoutPages/GroupReport/repostUpdateAndDownload"))
const ARBInrAedRate = lazy(() => import("../../AccoutPages/Account/InrUsdPosting/ARBInrAedRate"))



const createItems = (data) => {
  let itemsToShow = [];
  if (data.is_arb_watch) {
    itemsToShow.push("a");
  }
  if (data.is_mtm) {
    itemsToShow.push("b");
  }
  if (data.is_position) {
    itemsToShow.push("c");
  }
  if (data.is_symbol_limit) {
    itemsToShow.push("d");
  }
  if (data.is_historical) {
    itemsToShow.push("e");
  }
  if (data.is_c_alert) {
    itemsToShow.push("f");
  }
  if (data.is_c_position) {
    itemsToShow.push("g");
  }
  if (data.is_margin_and_exposure_grouping) {
    itemsToShow.push("h");
  }

  if (data.is_c_historical) {
    itemsToShow.push("i");
  }
  if (data.is_c_mtm) {
    itemsToShow.push("j");
  }
  if (data.is_service_manager) {
    itemsToShow.push("k");
  }
  if (data.is_hedge_position) {
    itemsToShow.push("l");
  }
  if (data.is_overall_summary) {
    itemsToShow.push("n");
  }
  if (data.is_marketwatch) {
    itemsToShow.push("o");
  }
  if (data.is_data_summary) {
    itemsToShow.push("r");
  }
  if (data.is_mt5order_logs) {
    itemsToShow.push("s");
  }

  return itemsToShow;
};

let flag = false;

const MainRoutes = () => {

  const isLoggedIn = useSelector((state) => state.isLoggedIn);

  const items = useSelector((state) => state && state?.items, shallowEqual);
  const previousRoute = localStorage.getItem("currentRoute")
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const history = useHistory();
  const { socketConnect } = useSocketConnect();
  const { data, loading, error, makeApiCall } = useApi();
  var loginroute = JSON.parse(localStorage.getItem("data"));

  const previousLoation = useLocation();

  const fetchApiData = async () => {

    const api = new Promise((resolve, reject) => {
      resolve(CHECK_SESSION_API());
    });
    const promiseResponse = Promise.all([api]);
    promiseResponse
      .then((responses) => {
        if (responses[0].status === 200) {
          return responses[0].data;
        } else {
          throw new Error("api failed");
        }
      })
      .then((data) => {
        if (data.httpstatus === 200) {
          flag = true
          let userDatafromLS = localStorage.getItem('data') ? JSON.parse(localStorage.getItem("data")) : {};
          let logo = JSON.parse(localStorage.getItem('data'))
          updateFavicon(true, logo.company_name);
          // const prevdata = localStorage.getItem("data") ? JSON.parse(localStorage.getItem("data")) : null;
          // if (prevdata) {
          //   localStorage.setItem("data", JSON.stringify({ ...prevdata, accessgroups: data.accessgroups, accessusers: data.accessusers }))
          // }
          dispatch(LoginAction(data, true));
          socketConnect();
          localStorage.setItem("data", JSON.stringify({ ...userDatafromLS, accessgroups: data.accessgroups, accessusers: data.accessusers }));
          // navigate("/dashboard");  //navigate to dashboard after success session checked

          if (previousRoute && previousRoute !== "/") {
            navigate(previousRoute);
          } else {
            // navigate("/dashboard");
            navigate((['account'].includes(loginroute.role)) ? "/account" : ['risk'].includes(loginroute.role) ? "/risk" : "/dashboard");

          }
        } else {
          dispatch(LoginAction(data, false));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    fetchApiData()
  }, []);

  useEffect(() => {
    if (!flag) return;
    (async () => {
      const userSetting = await GET_USERSETTING_API();
      if (userSetting.status === 200) {
        let actions = userSetting.data.result[0];
        let updatedItems = createItems(actions.card_control);
        dispatch(AllowedWindowsAction(updatedItems));
        // dispatch(
        //   Changeitems(updatedItems.filter((value) => items.includes(value)))
        // );
        dispatch(UserControlAction(userSetting.data.result[0]));
      }
    })()

  }, [flag])
  //   useEffect(() => {
  //     if (data && !loading) {
  //       if (data.httpstatus === 200) {
  //         dispatch(LoginAction(true));
  //         socketConnect();
  //         navigate("/dashboard");
  //       } else {
  //         dispatch(LoginAction(false));
  //       }
  //     }
  //   }, [data]);

  // useEffect(() => {
  //   // This will be called whenever the route changes
  //   const handleRouteChange = () => {
  //     const currentRoute = window.location.pathname;
  //     // Store the current route in localStorage
  //     localStorage.setItem('currentRoute', currentRoute);
  //   };

  //   // Subscribe to the popstate event
  //   window.addEventListener('popstate', handleRouteChange);

  //   // Call it once to store the initial route
  //   handleRouteChange();

  //   // Cleanup function to unsubscribe when the component unmounts
  //   return () => {
  //     window.removeEventListener('popstate', handleRouteChange);
  //   };
  // }, [navigate]);

  useEffect(() => {
    localStorage.setItem('currentRoute', previousLoation.pathname);
  }, [previousLoation.pathname]);

  // const [userData, setuserData] = useState({});
  // useEffect(() => {
  //   const userData = JSON.parse(localStorage.getItem("data"));
  //   setuserData(userData);


  // }, []);
  // console.log(isLoggedIn, userData.role, (isLoggedIn && (['risk', 'account'].includes(userData.role)) ?

  //   "AccountHeader" : "Header "))

  return (
    <div>
      {/* {isLoggedIn &&

        <Header />
      } */}
      {isLoggedIn && ((['risk', 'account'].includes(loginroute.role)) ?

        <AccountHeader /> : <Header />)
      }
      <div className={style.dashboardRoutes}>
        {/* <FallBackUi /> */}
        <Routes>
          <Route element={<ProtectedRoutes />} >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/netposition" element={<Position />} />
            <Route path="/spreadbook" element={<SpreadBook />} />
            <Route path="/register" element={<Register />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/usermanagement" element={<UserManagement />} />
            <Route path="/graph" element={<TestBfLiveMerged />} />
            <Route path="/downloadPdfChart" element={<PdfWithChart />} />

            {/* risk role */}

            <Route path="/risk" element={<Risk />} />
            <Route path="/inrusdposting" element={<ARBInrAedRate />} />

            {/* account role */}
            <Route path="/account" element={<Account />} />
            {/* <Route path="/report" element={<GroupReport />} /> */}
            <Route path="/arbtable" element={<Arbpage />} />
            {/* <Route path="/arbaccount" element={< ARBAccount />} /> */}
          </Route>

          <Route element={<PublicRoutes />}>
            <Route path="/test" element={<Test />} />
            <Route path="/" element={<Login />} />
          </Route>

        </Routes>
      </div>
    </div>
  );
};

export default MainRoutes;
