import { getFromLS } from "../Components/Dashboard/DashbordWindow/DashboardWindow";
import { getMonday } from "../UtilityFunctions/getMonday";
import { today } from "../UtilityFunctions/getTodayDate";
import { DefaultItems } from "../assets/json/DefaultLayouts";
import {
  ACCESSGROUPS,
  ALLCHARTFILTERDATA,
  ALLOWEDWINDOWS,
  CHANGETHEME,
  DASHBOARD_BOTTOM,
  DATE,
  ITEMS,
  LOGIN,
  MTM,
  NETPOSITIONAPI,
  NOTIFICATION_ALERT,
  PINNED_NAV,
  POSITIONCHART,
  POSITIONTYPEINMTM,
  RESET_STATE,
  SELECTEDSYMBOLSANDEXCHANGE,
  // SOCKETINSTANCE,
  SOCKETCONNECT,
  SOCKETDISCONNECT,
  SPANDATA,
  TOGGLE_DASHBORD_MODE,
  TOGGLE_IS_LIVE,
  TOKEN,
  TOKEN_NETPOSISTION,
  UPDATE_POSITION_CHART,
  UPDATE_TOKEN_NETPOSITION,
  USERCONTROLSETTINGS,
  USERSETTING,
  WINDOWLAYOUTS
} from "./RMSType";

// const layout = localStorage.getItem("layouts") ? { lg: JSON.parse(localStorage.getItem("layouts")) } : null
const layout = null

// let date =
//   localStorage.getItem("dateRange") &&
//   JSON.parse(localStorage.getItem("dateRange"));
const initialState = {
  layout: { lg: [] },
  // { w: 5, minW: 5, h: 5, minH: 5, x: 0, y: 0, i: "a", moved: false, static: false, chartname: 'ABS Watch' },
  // { w: 2, minW: 2, h: 5, minH: 5, x: 5, y: 0, i: "b", moved: false, static: false, chartname: 'MTM' },
  // { w: 5, minW: 5, h: 5, minH: 5, x: 7, y: 0, i: "c", moved: false, static: false, chartname: 'Position' },

  // { w: 3, minW: 3, h: 5, minH: 5, x: 0, y: 1, i: "d", moved: false, static: false, chartname: 'Symbol wise Limits' },
  // { w: 6, minW: 6, h: 5, minH: 5, x: 3, y: 1, i: "e", moved: false, static: false, chartname: 'Historical Data' },
  // { w: 3, minW: 3, h: 5, minH: 5, x: 9, y: 1, i: "f", moved: false, static: false, chartname: 'Alert' },

  // { w: 6, minW: 6, h: 5, minH: 5, x: 0, y: 12, i: "g", moved: false, static: false, chartname: 'C Position Product wise' },
  // { w: 3, minW: 3, h: 5, minH: 5, x: 6, y: 12, i: "h", moved: false, static: false, chartname: 'C MTM' },
  // { w: 3, minW: 3, h: 5, minH: 5, x: 9, y: 12, i: "i", moved: false, static: false, chartname: 'Margin & Exposure Grouping' },

  // { w: 6, minW: 6, h: 5, minH: 5, x: 0, y: 12, i: "j", moved: false, static: false, chartname: 'C Historical Data' },

  items: DefaultItems,
  isLoggedIn: false,
  loginDetails: {},
  websocket: {
    status: false,
    connection: "",
  },
  positionChart: [],
  dateRange: {
    fromdate: getMonday(),
    todate: today()
  },
  // dateRange: {
  //   fromdate: date ? date.fromdate : getMonday(),
  //   todate: date ? date.todate : yesterdayDate(),
  // },
  // fromdate: getMonday(),
  // enddate: yesterdayDate(),
  tokens: [],
  Netposition: [],
  mtm: "usd",
  positionTypeInMtm: "",
  AllChartFiltersAction: {},
  selectedSymbolsAndExchange: {
    position: [],
    CPositionProductWise: [],
    SymbolLimits: [],
  },

  defaulttheme: getFromLS("theme") ? getFromLS("theme") : "body",
  userSetting: [],
  userControlSettings: {},
  spanData: {},
  accessGroups: [],
  allowedWindows: [],
  toeknNetposition: {},
  positionNumber: {},
  isDashboardEditable: false,
  isNotificationAlert: [],
  dashboardBottom: { dashboardBottomCheck: true, id: null },
  pinnedNavbar: true,
  isLive: true
};

const RMSReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        loginDetails: action.data,
      };
    case RESET_STATE:
      return initialState

    case CHANGETHEME:
      return {
        ...state,
        defaulttheme: action.data,
      };

    case WINDOWLAYOUTS:
      return { ...state, layout: action?.data };

    case ITEMS:
      return { ...state, items: action?.data };

    case SOCKETCONNECT:
      return {
        ...state,
        websocket: {
          ...state.websocket,
          status: action.data.status,
          connection: action.data.connection,
        },
      };

    case SOCKETDISCONNECT:
      if (state.websocket.connection) {
        state.websocket.connection.close();
      }
      return {
        ...state,
        websocket: {
          ...state.websocket,
          status: action.data,
          connection: null,
        },
      };

    case POSITIONCHART:
      // state = { ...state, positionChart: [] };
      return { ...state, positionChart: action.data };

    // case UPDATE_POSITION_CHART:
    //   return { ...state, positionChart: }

    case TOKEN_NETPOSISTION:
      // state = { ...state, toeknNetposition: [] };
      if (action?.data.event === "all") {
        return { ...state, toeknNetposition: action.data.data };
      } else return { ...state, toeknNetposition: { ...state.toeknNetposition, [action.data.token]: action.data } };


    case UPDATE_TOKEN_NETPOSITION:
      state = { ...state, toeknNetposition: { ...state.toeknNetposition, [action.data[0].token]: action.data } }
      return state



    case UPDATE_POSITION_CHART:
      state = { ...state, toeknNetposition: { ...state.positionNumber, [action.data.positionno]: action.data } }
      return state


    // case ADD_SINGLE_TOKEN_NETPOSITION:
    //   state = { ...state, toeknNetposition: { ...tokenNetposition }}

    case DATE:
      return {
        ...state,
        dateRange: {
          ...state.dateRange,
          fromdate: action.data[0],
          todate: action.data[1],
        },
      };

    // case FROMDATE:
    //   return { ...state, fromdate: action.data };

    // case ENDDATE:
    //   return { ...state, enddate: action.data };
    case TOGGLE_IS_LIVE:
      return { ...state, isLive: action.data }

    case TOKEN:
      return { ...state, tokens: action.data };

    case NETPOSITIONAPI:
      return { ...state, Netposition: action.data };

    case MTM:
      return { ...state, mtm: action.data };

    case POSITIONTYPEINMTM:
      return { ...state, positionTypeInMtm: action.data };

    case ALLCHARTFILTERDATA:
      // state={...state,AllChartFiltersAction:{...state.AllChartFiltersAction,...action.data}}
      return {
        ...state,
        AllChartFiltersAction: {
          ...state.AllChartFiltersAction,
          ...action.data,
        },
      };

    case SELECTEDSYMBOLSANDEXCHANGE:
      return { ...state, selectedSymbolsAndExchange: { ...state.selectedSymbolsAndExchange, ...action.data } };

    // case SOCKETINSTANCE:
    //     state = { ...state, websocket: '' }
    //     return { ...state, websocket: action.data }

    case USERSETTING:
      return { ...state, userSetting: action.data };

    case USERCONTROLSETTINGS:
      return { ...state, userControlSettings: action.data };

    case SPANDATA:
      return { ...state, spanData: action.data };
    case ACCESSGROUPS:
      return { ...state, accessGroups: action.data };
    case ALLOWEDWINDOWS:
      return { ...state, allowedWindows: action.data };


    case TOGGLE_DASHBORD_MODE:
      return { ...state, isDashboardEditable: !state.isDashboardEditable }

    case NOTIFICATION_ALERT:
      return { ...state, isNotificationAlert: action.data };
    case DASHBOARD_BOTTOM:
      return { ...state, dashboardBottom: { ...state.dashboardBottom, ...action.data } };
    case PINNED_NAV:
      return { ...state, pinnedNavbar: action.data };

    default:
      return state;
  }
};

export default RMSReducer;
