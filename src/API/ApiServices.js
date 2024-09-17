import axios from "axios";
const url = import.meta.env.VITE_REACT_APP_API_URL;

axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;
axios.defaults.xsrfHeaderName = "X-CSRFToken"
axios.defaults.xsrfCookieName = "csrftoken"
const createAPI = axios.create({ baseURL: url })
const config = {
    'Content-Type': 'application/json',
    "Cookie": document.cookie
}

let state = {}

const getData = (key) => {
    if (state[key]) return state[key]

    let storage = localStorage.getItem("data")
    if (!storage) return null

    storage = JSON.parse(storage)
    if (!storage[key]) return null

    state[key] = storage[key]
    return storage[key]

}

createAPI.interceptors.request.use(function (config) {
    config.headers.user = getData("username");

    // if (!["login", "delete"].some(e => config.url.includes(e))) {
    //     config.headers.Authorization = `Bearer ${getData("accessToken")}`
    //     config.withCredentials = true
    // }
    return config;
});

export const LOGIN_USER_API = async (data) => {
    const response = await createAPI.post("account/login", data)
    // window.user = response.data.username
    return response;
}

export const LOGOUT_USER_API = async () => {
    const response = await createAPI.get("account/logout", { headers: config })
    state = {}
    return response;
}

export const CHECK_SESSION_API = async () => {
    // console.log(config);
    const response = await createAPI.get("account/checksession", { headers: config })
    // console.log('CHECK_SESSION_API', response);
    return response;
}

export const DELETE_SESSION_API = async (data) => {
    let res = null
    try {

        res = await createAPI.post("account/deletesession", data)
    } catch (error) {
        state = {}
        res = error
    }
    return res;
}


export const REGISTER_USER_API = async (data) => {
    const response = await createAPI.post("account/register", data)
    // console.log('REGISTER_USER_API', response);
    return response;
}
export const GET_USER_ROLE = async (data) => {
    const response = await createAPI.get("settings/userrole")
    return response;
}
export const GET_HEDGERATIO_API = async () => {
    const response = await createAPI.get("settings/niftyhedgeratio")
    return response;
}
export const POST_HEDGERATIO_API = async (data) => {
    const response = await createAPI.post("settings/niftyhedgeratio", data)
    return response;
}

//******************************* */ dashboard *****************************************************

export const GET_NETPOSITION_API = async (data) => {
    const response = await createAPI.post("dashboard/netposition", data)
    return response;
}

export const GET_MTMCHART_API = async (data) => {
    const response = await createAPI.post("dashboard/mtmchart", { params: data })
    return response;
}
export const GET_MARGIN_CHART_API = async (data) => {
    const response = await createAPI.get("dashboard/margin", { params: data })
    return response;
}

export const GET_HISTORICAL_DATA_API = async (data) => {
    const response = await createAPI.post("dashboard/historical", data)
    return response;
}
export const GET_HISTORICAL_DATASUMMARY_API = async (data) => {
    const response = await createAPI.post("dashboard/datasummary", { data })
    return response;
}

export const GET_FILTERS_API = async (data) => {
    const response = await createAPI.post("settings/getfilter", data)
    return response;
}

export const GET_TOKENS_API = async (data) => {
    const response = await createAPI.post("dashboard/netposition", data)
    return response;
}

export const DOWNLOAD_REPORT = async (data) => {
    const response = await createAPI.post("dashboard/download", data)
    // console.log("DOWNLOAD_REPORT", response)
    return response;
}
export const DOWNLOAD_BANKOFFICE_REPORT = async (data) => {
    const response = await createAPI.post("dashboard/download", data)
    // console.log("DOWNLOAD_REPORT", response)
    return response;
}
export const DOWNLOAD_DETAILED_REPORT = async (data) => {
    // console.log("Hellow")
    const response = await createAPI.post("/report/detailedreport", data)
    return response;
}

export const CUSTOM_REPORT = async (data) => {
    const response = await createAPI.post("report/downloadreports", data)
    // console.log("DOWNLOAD_REPORT", response)
    return response;
}

export const POST_MTMCHART_API = async (data) => {
    const response = await createAPI.post("dashboard/mtmchart", data)
    return response;
}
export const GET_SPANDATA_API = async () => {
    const response = await createAPI.get("dashboard/getspan")
    return response;
}
export const GET_LTP_API = async (data) => {
    const response = await createAPI.post("dashboard/getltp", data)
    return response;
}
export const GET_STRATEGYTOKEN_API = async (data) => {
    const response = await createAPI.post("dashboard/search", data)
    return response;
}
export const CREATE_STRATEGY_API = async (data) => {
    const response = await createAPI.post("dashboard/strategymaster", data)
    return response;
}

export const GET_STRATEGY_API = async () => {
    const response = await createAPI.get("dashboard/strategymaster")
    return response;
}

export const POST_SAVEARBWATCH_API = async (data) => {
    const response = await createAPI.post("dashboard/arbwatch", data)
    return response;
}
export const GET_ARBWATCH_API = async () => {
    const response = await createAPI.get("dashboard/arbwatch")
    return response;
}
export const GET_MTMHISTORY_API = async (data) => {
    const response = await createAPI.post("dashboard/getmtmhistory", data)
    return response;
}
export const GET_SERVICEMANAGER_API = async (data) => {
    const response = await createAPI.get("dashboard/getservicemanager", { params: data })
    return response;
}
export const POST_RESTARTSERVICE_API = async (data) => {
    const response = await createAPI.post("dashboard/getservicemanager", data)
    // console.log(response)
    return response;
}
export const GET_NOTIFICATION_API = async () => {
    const response = await createAPI.get("dashboard/notification")
    // console.log(response)
    return response;
}
export const GET_MARKETWATCH_API = async () => {
    const response = await createAPI.get("dashboard/marketwatch")
    // console.log(response)
    return response;
}
export const CREATE_MARKETWATCH_API = async (data) => {
    const response = await createAPI.post("dashboard/marketwatch", data)
    // console.log(response)
    return response;
}
export const GET_MT5ORDER_LOGS = async () => {
    const response = await createAPI.get("dashboard/getlogs")
    // console.log( response)
    return response;
}




// *************************************************SpreadBook*********************************************************
export const GET_SPREADBOOK_API = async (data) => {
    const response = await createAPI.get("dashboard/spreadbook")
    return response;
}
export const SPREADBOOK_DOWNLOAD_API = async (data) => {
    const response = await createAPI.post("dashboard/download", data)
    return response;
}

// *******************************************************Setting*******************************************************
export const UpdateTelegramID_API = async (data) => {
    const response = await createAPI.post("/account/updatetelegramid", { data, source: "web" })
    return response;
}
export const VerifyOTP_API = async (data) => {
    const response = await createAPI.post("/account/verifyotp", { data, source: "web" })
    return response;
}
export const ToggleIsTwoFa_API = async (data) => {
    const response = await createAPI.post("/account/enable2fa", { data, source: "web", event: "enable2fa" })
    return response;
}
export const BASIC_PROFILE_API = async (data) => {
    const response = await createAPI.post("/account/getuser", data)
    // console.log(response)
    return response;
}
export const GET_BASIC_PROFILE_API = async (data) => {
    const response = await createAPI.get("/account/getuser", { params: data })
    // console.log(response)
    return response;
}
export const CHANGE_PWD_API = async (data) => {
    const response = await createAPI.post("account/updatepassword", data)
    return response;
}
export const CREATE_GROUP_API = async (data) => {
    const response = await createAPI.post("settings/groupmaster", data)
    return response;
}
export const GET_GROUP_API = async (data) => {
    const response = await createAPI.get("settings/groupmaster")
    // console.log("groupmaster", response)
    return response;
}
export const CREATE_CLUSTER_API = async (data) => {
    const response = await createAPI.post("settings/clustermaster", data)
    return response;
}
export const GET_CLUSTER_API = async (data) => {
    const response = await createAPI.get("settings/clustermaster", data)
    return response;
}

export const CREATE_USER_CONFIG_API = async (data) => {
    const response = await createAPI.post("/settings/userconfig", data)
    return response;
}
export const GET_USER_CONFIG_API = async (data) => {
    const response = await createAPI.get("/settings/userconfig", { params: data })
    return response;
}
export const CREATE_GROUP_CONFIG_API = async (data) => {
    const response = await createAPI.post("settings/groupconfig", data)
    // console.log("vCREATE_GROUP_CONFIG_API", response)
    return response;
}

export const GET_GROUP_CONFIG_API = async (data) => {
    const response = await createAPI.get("settings/groupconfig", { params: data })
    // console.log("GET_GROUP_CONFIG_API", response)
    return response;
}

export const GET_EXCHANGE_API = async (data) => {
    const response = await createAPI.get("settings/exchangemaster")
    // console.log("GET_EXCHANGE_API", response)
    return response;
}

export const GET_SECURITY_API = async (data) => {
    const response = await createAPI.get("settings/securitytypemaster")
    // console.log("GET_SECURITY_API", response)
    return response;
}

export const GET_USER_SETTINGS_API = async () => {
    const response = await createAPI.get("settings/usersettings")
    return response;
}
export const GET_MARGIN_CONFIG_API = async (data) => {
    const response = await createAPI.get("settings/marginconfig", { params: data })
    // console.log(response)
    return response;
}
export const CREATE_MARGIN_CONFIG_API = async (data) => {
    const response = await createAPI.post("settings/marginconfig", data)
    return response;
}
export const GET_USERID_MASTER = async () => {
    const response = await createAPI.get("settings/useridmaster")
    // console.log("GET_USERID_MASTER", response)
    return response;
}
export const CREATE_USERID_MASTER = async (data) => {
    const response = await createAPI.post("settings/useridmaster", data)
    // console.log(response)
    return response;
}
export const POST_COMPONENTSETTING_API = async (data) => {
    const response = await createAPI.post("settings/componentsetting", data)
    // console.log(response)
    return response;
}
export const GET_COMPONENTSETTING_API = async (data) => {
    const response = await createAPI.get("settings/componentsetting", { params: data })
    // console.log(response)
    return response;
}
export const UPLOAD_TRADEBOOK_API = async (data) => {
    const response = await createAPI.post("settings/fileupload", data)
    // console.log(response)
    return response;
}
export const UPLOAD_VERIFIED_API = async (data) => {
    const response = await createAPI.post("report/verifyaccounts", data)
    // console.log(response)
    return response;
}
export const GET_CONFIGCLUSTER_API = async (data) => {
    const response = await createAPI.post("settings/getfilter", data)
    // console.log(response)
    return response;
}
export const GET_USDRATE_API = async () => {
    const response = await createAPI.get("settings/usdrate")
    // console.log(response)
    return response;
}
export const CREATE_USDRATE_API = async (data) => {
    const response = await createAPI.post("settings/usdrate", data)
    // console.log(response)
    return response;
}
export const GET_UPDATESETTLEMENT_API = async (data) => {
    const response = await createAPI.get("settings/updatesettlement", { params: data })
    // console.log(response)
    return response;
}
export const UPDATESETTLEMENT_API = async (data) => {
    const response = await createAPI.post("settings/updatesettlement", data)
    // console.log(response)
    return response;
}
export const GET_MARGINRATE_API = async (data) => {
    const response = await createAPI.get("settings/marginrate",)
    // console.log(response)
    return response;
}
export const CREATE_MARGINRATE_API = async (data) => {
    const response = await createAPI.post("settings/marginrate", data)
    // console.log(response)
    return response;
}
export const DELETE_MARGINRATE_API = async (data) => {
    const response = await createAPI.post("settings/marginrate", data)
    // console.log(response)
    return response;
}
export const GET_UPDATE_LEDGER_API = async (data) => {
    const response = await createAPI.get("/settings/ledger", { params: data })
    // console.log(response)
    return response;
}
export const POST_UPDATE_LEDGER_API = async (data) => {
    const response = await createAPI.post("/settings/ledger", data)
    // console.log(response)
    return response;
}
// ********************usermanagement******************************
export const POST_USERSETTING_API = async (data) => {
    const response = await createAPI.post("settings/usersettings", data)
    // console.log(response)
    return response;
}

export const GET_USERSETTING_API = async () => {
    const response = await createAPI.get("settings/usersettings")
    // console.log(response)
    return response;
}
export const UPDATE_USERSETTING_API = async (data) => {
    const response = await createAPI.post("settings/usersettings", data)
    // console.log(response)
    return response;
}
export const GET_CTCL_API = async () => {
    const response = await createAPI.get("settings/ctclid")
    // console.log(response)
    return response;
}
export const POST_CTCL_API = async (data) => {
    const response = await createAPI.post("settings/ctclid", data)
    // console.log(response)
    return response;
}


// *******************************************************ARB Account *******************************************************

export const GET_ARB_ACCOUNT_API = async (data) => {
    const response = await createAPI.post("dashboard/arbnet", data)
    return response;
}


//*********************************************************** risk ***********************************************************
export const GET_RISK_API = async () => {
    const response = await createAPI.get("ld-lf/Limit")
    // console.log(response)
    return response;
}
export const POST_RISK_API = async (data) => {
    const response = await createAPI.post("ld-lf/Limit", data)
    // console.log(response)
    return response;
}
export const PUT_RISK_API = async (data) => {
    const response = await createAPI.put("ld-lf/Limit", data)
    // console.log(response)
    return response;
}
export const DELETE_RISK_API = async (data) => {
    const response = await createAPI.delete("ld-lf/Limit", { data: data })
    // console.log(response)
    return response;
}

export const GET_ARBINRAEDRATE_API = async () => {
    const response = await createAPI.get("ld-lf/arb")
    // console.log(response)
    return response;
}
export const POST_ARBINRAEDRATE_API = async (data) => {
    const response = await createAPI.post("ld-lf/arb", data)
    // console.log(response)
    return response;
}
export const PUT_ARBINRAEDRATE_API = async (data) => {
    const response = await createAPI.put("ld-lf/arb", data)
    // console.log(response)
    return response;
}
export const DELETE_ARBINRAEDRATE_API = async (data) => {
    const response = await createAPI.delete("ld-lf/arb", { data: data })
    // console.log(response)
    return response;
}
export const POST_REPORT_CONFIG_API = async (data) => {
    const response = await createAPI.post("ld-lf/report-config", data)
    // console.log(response)
    return response;
}
export const GET_REPORT_CONFIG_API = async (data) => {
    const response = await createAPI.get("ld-lf/report-config", { params: data })
    // console.log(response)
    return response;
}
export const GET_DOWNLOAD_REPORT_CONFIG_API = async (data) => {
    const response = await createAPI.post("ld-lf/download-report", data)
    // console.log(response)
    return response;
}
export const GET_WEEK_API = async (data) => {
    const response = await createAPI.get("ld-lf/get-weeks")
    // console.log(response)
    return response;
}
export const POST_ARBHIST_API = async (data) => {
    const response = await createAPI.post("ld-lf/arbhist", { data: data })
    // console.log(response)
    return response;
}
export const DOWNLOAD_LIMIT_REPORT = async (data) => {
    const response = await createAPI.post("ld-lf/download-limit", data)
    // console.log("DOWNLOAD_REPORT", response)
    return response;
}

//********************************************************** Account **********************************************************
export const GET_ACCOUNT_API = async () => {
    const response = await createAPI.get("ld-lf/ld")
    return response;
}
export const POST_ACCOUNT_API = async (data) => {
    const response = await createAPI.post("ld-lf/ld", data)
    return response;
}
export const PUT_ACCOUNT_API = async (data) => {
    const response = await createAPI.put("ld-lf/ld", data)
    // console.log(response)
    return response;
}
export const DELETE_ACCOUNT_API = async (data) => {
    const response = await createAPI.delete("ld-lf/ld", { data: data })
    // console.log(response)
    return response;
}

export const GET_ARB_API = async (data) => {
    const response = await createAPI.post("ld-lf/arbtables", { data: data })
    return response;
}