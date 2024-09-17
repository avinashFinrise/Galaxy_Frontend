import {
  ACCESSGROUPS,
  ALLCHARTFILTERDATA,
  ALLOWEDWINDOWS,
  CHANGETHEME,
  DASHBOARD_BOTTOM,
  DATE,
  // ENDDATE,
  // FROMDATE,
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
  SOCKETCONNECT,
  SOCKETDISCONNECT,
  SPANDATA,
  TOGGLE_DASHBORD_MODE,
  TOGGLE_IS_LIVE,
  TOKEN,
  TOKEN_NETPOSISTION,
  UPDATE_TOKEN_NETPOSITION,
  USERCONTROLSETTINGS,
  USERSETTING,
  WINDOWLAYOUTS
} from "./RMSType";

export const ToggleIsLiveAction = (data) => {
  return {
    type: TOGGLE_IS_LIVE,
    data: data,
  };
};

export const ChangeThemeAction = (data) => {
  return {
    type: CHANGETHEME,
    data: data,
  };
};
export const ChangeWindowLayout = (data) => {
  return {
    type: WINDOWLAYOUTS,

    data: data,
  };
};
export const Changeitems = (data) => {
  return {
    type: ITEMS,
    data: data,
  };
};

// export const SocketAction=(data)=>{
//     return{
//         type:SOCKETINSTANCE,
//         data:data
//     }
// }

export const SocketConnectAction = (data) => {
  return {
    type: SOCKETCONNECT,
    data: data,
  };
};
export const SocketDisconnectAction = (data) => {
  return {
    type: SOCKETDISCONNECT,
    data: data,
  };
};
export const LoginAction = (data, isLoggedIn) => {
  return {
    type: LOGIN,
    data: data,
    isLoggedIn: isLoggedIn,
  };
};

export const PostionChartAction = (data) => {
  return {
    type: POSITIONCHART,
    data: data,
  };
};


export const addTokenNetposition = (data) => {
  return {
    type: TOKEN_NETPOSISTION,
    data: data,
  }
}
export const editTokenNetPosition = (data) => {
  return {
    type: UPDATE_TOKEN_NETPOSITION,
    data: data,
  }
}

export const DateAction = (data) => {
  return {
    type: DATE,
    data: data,
  };
};

// export const EndDateAction = (data) => {
//   return {
//     type: ENDDATE,
//     data: data,
//   };
// };
export const TokenAction = (data) => {
  return {
    type: TOKEN,
    data: data,
  };
};

export const NetpositionApiAction = (data) => {
  return {
    type: NETPOSITIONAPI,
    data: data,
  };
};

export const MtmAction = (data) => {
  return {
    type: MTM,
    data: data,
  };
};

export const PositionTypeInMtmAction = (data) => {
  return {
    type: POSITIONTYPEINMTM,
    data: data,
  };
};

export const AllChartFiltersAction = (data) => {
  return {
    type: ALLCHARTFILTERDATA,
    data: data,
  };
};
export const SelectedSymbolsAndExchangeAction = (data) => {
  return {
    type: SELECTEDSYMBOLSANDEXCHANGE,
    data: data,
  };
};
export const AllowUserSettings = (data) => {
  return {
    type: USERSETTING,
    data: data,
  };
};
export const UserControlAction = (data) => {
  return {
    type: USERCONTROLSETTINGS,
    data: data,
  };
};

export const SpanDataAction = (data) => {
  return {
    type: SPANDATA,
    data: data,
  };
};
export const AccessgroupsAction = (data) => {
  return {
    type: ACCESSGROUPS,
    data: data,
  };
};
export const AllowedWindowsAction = (data) => {
  return {
    type: ALLOWEDWINDOWS,
    data: data,
  };
};
export const ResetState = () => {
  return {
    type: RESET_STATE,
  };
};

export const ToggleDashboardMode = () => {
  return {
    type: TOGGLE_DASHBORD_MODE
  }
}
export const Notificationalert = (data) => {
  return {
    type: NOTIFICATION_ALERT,
    data: data,
  }
}
export const DashboardBottomAction = (data) => {
  return {
    type: DASHBOARD_BOTTOM,
    data: data,
  }
}
export const PinnedNavAction = (data) => {
  return {
    type: PINNED_NAV,
    data: data,
  }
}