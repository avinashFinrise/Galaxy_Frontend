import React, { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  GET_COMPONENTSETTING_API,
  GET_NETPOSITION_API,
  GET_TOKENS_API,
  GET_USERSETTING_API,
} from "../../API/ApiServices";
import {
  AllowedWindowsAction,
  DashboardBottomAction,
  NetpositionApiAction,
  PostionChartAction,
  SelectedSymbolsAndExchangeAction,
  UserControlAction,
  addTokenNetposition
} from "../../Redux/RMSAction";
import dashStyle from "./Dashboard.module.scss";
import DashboardBottom from "./DashboardBottom";
import { DashboardCarousel } from "./DashboardCarousel";
import { DashboardWindow } from "./DashbordWindow";

const drawerWidth = 240;
let tickerShouldUpdate = true;
let tokens = new Set();
let DebouncedNetPositions = {}
let netPositionShouldUpdate = true
export let componentSettingfetchid
const Dashboard = () => {
  // const classes = useStyles;
  const dispatch = useDispatch();
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const dashboardBottom = useSelector(state => state?.dashboardBottom)
  const pinnedNavbar = useSelector(state => state?.pinnedNavbar)
  const tickerNetPosition = useSelector(s => s.toeknNetposition)

  const [tokenList, setTokenList] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [tempData, setTempData] = useState({});
  const items = useSelector((state) => state && state?.items, shallowEqual);
  const accessGroups = localStorage.getItem("data")
    ? JSON.parse(localStorage.getItem("data")).accessgroups
    : [];


  useEffect(() => {

    if (!ws.status) return;
    let tickerTimeout
    let netPositionTimeout;
    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "ticker" && tickerShouldUpdate) {
        tickerShouldUpdate = false
        tickerTimeout = setTimeout(() => {
          setTempData(p => {
            const newdata = { ...p }
            Object.values(p).forEach(val => {
              if (val.token === newData.data.data.token) {
                p.ltp = newData.data.data.ltp;
                val.grossmtm = (val.cfamt + (val.cfqty * (newData.data.data.ltp) * val.multiplier));
                val.netmtm = ((val.cfamt + (val.cfqty * (newData.data.data.ltp) * val.multiplier))) - val.charges;

                // val.cfqty = generateRandomNumber()
              }
            })
            return newdata
          })

          tickerShouldUpdate = true
        }, 1000)
      }
      if (newData.event === "netposition") {
        if (!tokens.has(newData.data.token)) {
          ws.connection.send(
            JSON.stringify({
              event: "subscribe",
              stream: "ticker",
              token: [newData.data.token],
            })
          );
        }

        tokens.add(newData.data.token);


        // const updatedData = tickerNetPosition[newData.data.token].map(val => {
        //   if (val.netpositionno === newData.data.netpositionno) {
        //     return newData.data
        //   } else return val
        // })

        // dispatch(addTokenNetposition(updatedData))

        // netpositionObj[newData.data.positionno] = newData.data;
        DebouncedNetPositions[newData.data.positionno] = newData.data

        if (netPositionShouldUpdate) {
          netPositionShouldUpdate = false
          netPositionTimeout = setTimeout(() => {
            setTempData((prevTempData) => ({
              ...prevTempData,
              ...DebouncedNetPositions
            }));
            DebouncedNetPositions = {}
            netPositionShouldUpdate = true
          }, 1000)
        }

      }
    };

    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);

      }
      clearTimeout(tickerTimeout)
      clearTimeout(netPositionTimeout)
    };
  }, [ws.status]);


  // const [state, setState] = useState([])


  // useEffect(() => {
  //   setState(p => [...p, { test: "tete" }])
  // }, [state])


  useEffect(() => {
    if (tempData && Object.values(tempData).length > 0) {
      dispatch(PostionChartAction(Object.values(tempData)));
    }
  }, [tempData]);

  useEffect(() => {
    if (!ws.status) return;
    // if (tokenList.length < 1) return;
    if (tokenList?.length > 0) {
      ws.connection.send(
        JSON.stringify({
          event: "subscribe",
          stream: "ticker",
          token: tokenList,
        })
      );
    }

    if (accessGroups) {
      ws.connection.send(
        JSON.stringify({
          event: "subscribe",
          stream: "group",
          group: accessGroups,
        })
      );
      ws.connection.send(
        JSON.stringify({
          event: "subscribe",
          stream: "netposition",
          access_id: accessGroups?.access_id,
        })
      );
    }

    return () => {
      if (ws.status) {
        ws.connection.send(
          JSON.stringify({
            event: "unsubscribe",
            stream: "ticker",
            token: tokenList,
          })
        );
      }
    };
  }, [ws.status, tokenList]);

  // const theme = createTheme({
  //   palette: {
  //     type: darkMode ? "dark" : "light",
  //   },
  // });

  // const toggleDarkMode = () => {
  //   setDarkMode(!darkMode);
  // };

  const convertToObject = (arr) => {
    const newObj = arr?.reduce((objDict, obj) => {
      objDict[obj.positionno] = obj;
      return objDict;
    }, {});
    return newObj;
  };

  const getTokens = async () => {
    const tokenData = new Promise((resolve, reject) => {
      resolve(
        GET_TOKENS_API({
          event: "getalltoken",
          data: {},
        })
      );
    });
    tokenData
      .then((res) => {
        setTokenList(res.data.result);
        res?.data.result.map((val) => tokens.add(val));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
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

      const pos = await GET_NETPOSITION_API({ event: "getnetposition" });
      // console.log({ pos });

      if (pos.status == 200) {
        const tokens = {}
        pos.data.result?.forEach(e => {
          if (!Array.isArray(tokens[e.token])) tokens[e.token] = []
          tokens[e.token] = [...tokens[e.token], e]
        })


        dispatch(addTokenNetposition({ event: "all", data: tokens }))


        dispatch(PostionChartAction(pos.data.result));
        dispatch(NetpositionApiAction(pos.data.result));
        setTempData(convertToObject(pos.data.result));
      }

      // const spanData = await GET_SPANDATA_API();
      // if (spanData.status == 200) {
      //   let span = spanData.data.result;
      //   dispatch(SpanDataAction(span));
      // }
    })();

    // makeApiCall(GET_NETPOSITION_API, {
    //   event: "getnetposition",
    //   data: {},
    // });
    getTokens();
  }, []);


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

    itemsToShow.push("m");
    if (data.is_c_stress_test) {
      itemsToShow.push("q");
    }

    if (data.is_data_summary) {
      itemsToShow.push("r");
    }
    if (data.is_mt5order_logs) {
      itemsToShow.push("s");
    }

    return itemsToShow;
  };

  // useEffect(() => {
  //   if (data?.httpstatus === 200 && !loading) {
  //     if (Array.isArray(data.result)) {
  //       dispatch(PostionChartAction(data.result)),
  //         dispatch(NetpositionApiAction(data.result));
  //     }
  //     // tempData = convertToObject(data.result);
  //     setTempData(convertToObject(data.result));
  //   }
  // }, [data]);

  useEffect(() => {
    // Add an event listener to handle screen size changes
    function handleWindowSizeChange() {
      setIsMobile(window.innerWidth <= 768); // Update your mobile breakpoint here
    }

    window.addEventListener("resize", handleWindowSizeChange);

    // Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  useEffect(() => {
    // let componentName =
    //   table == "mtm" ? `${table}_${positionType}_${view}` : `${table}_${view}`;
    (async () => {
      try {
        const componentSettingfetch = await GET_COMPONENTSETTING_API({
          componentname: "selectedSymbolAndExchangeComponent",
        });
        const dashboardBottomSetting = await GET_COMPONENTSETTING_API({
          componentname: "dashboardBottom",
        });
        componentSettingfetchid = componentSettingfetch?.data?.result?.selectedSymbolAndExchange?.id
        // setFilterSetting(componentSettingfetch?.data?.result?.table);

        dispatch(
          SelectedSymbolsAndExchangeAction(
            componentSettingfetch?.data?.result?.selectedSymbolAndExchange
              ?.setting
          )
        );
        dispatch(DashboardBottomAction({
          dashboardBottomCheck: dashboardBottomSetting?.data?.result?.gridLayout?.setting?.dashBottom,
          id: dashboardBottomSetting?.data?.result?.gridLayout?.id
        }))
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);


  // console.log({ dashboardBottom })


  return (
    <div className={` ${dashboardBottom?.dashboardBottomCheck == false
      ? dashStyle.dashboardSection
      :
      dashStyle.dashboardSection1 + ' ' + dashStyle.dashboardSection} ${pinnedNavbar && dashStyle.navdashsection}`}
    >
      {isMobile ? (
        <div className={dashStyle.dashCurouselSection}>
          <DashboardCarousel />
        </div>
      ) : (
        <div className={`****************** ${dashStyle.dashWindSection}`}>
          <DashboardWindow />
        </div>
      )}

      {dashboardBottom?.dashboardBottomCheck && <DashboardBottom />}
    </div>
  );
};
export default React.memo(Dashboard);
