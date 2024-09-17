import {
    useEffect,
    useState,
} from "react";
import { TbReload } from "react-icons/tb";

import { GET_SERVICEMANAGER_API, POST_RESTARTSERVICE_API } from "../../API/ApiServices";
import { Notification } from "../DynamicComp/Notification";
import serStyle from './ServiceManager.module.scss'

const MissingTradeTransfer = () => {
    const [missingTradeTransApi, setMissingTradeTransApi] = useState([]);
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
    const missingTradeTransData = () => {
        setNotifyData((data) => ({
            ...data,
            loadingFlag: true,
            loadingMsg: "Fetching missing trades transfer ...",
        }));
        const apiCall = new Promise((resolve, reject) => {
            resolve(
                GET_SERVICEMANAGER_API({
                    event: "checktradetransfer",
                })
            );
        });
        apiCall
            .then((res) => {
                // console.log("res*****************", res);
                setMissingTradeTransApi(res.data.result);
                setNotifyData({
                    loadingFlag: false,
                });
            })
            .catch((err) => {
                console.log(err);
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                        // confirmFlag: false,
                        errorFlag: true,
                        errorMsg: err.response?.data.reason,
                        headerMsg: err.code,
                    };
                });
            });
    }

    useEffect(() => {
        missingTradeTransData();
    }, []);

    const handleRestartTradeTransfer = async (e) => {
        e.preventDefault();
        setNotifyData((prev) => ({
            ...prev,
            loadingFlag: true,
            loadingMsg: "Please Wait Restarting missing trades transfer...",
        }));
        const restartData = new Promise((resolve, reject) => {
            resolve(POST_RESTARTSERVICE_API({ event: "restart_tradetransfer_services" }));
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
    const handleReloadTradeTransfer = async (e) => {
        e.preventDefault();
        missingTradeTransData();
    }
    // console.log("missingTradeTransApi", missingTradeTransApi);
    return (
        <div style={{ height: '100%' }} >
            <div className={serStyle.BtnSection}>
                <button
                    onClick={handleReloadTradeTransfer}
                    className={serStyle.reloadBtn}
                >
                    <span><TbReload /></span>
                    Reload
                </button>
                <button
                    // onClick={handleRestartTradeTransfer}
                    onClick={(e) => {
                        setNotifyData((data) => ({
                            ...data,
                            confirmFlag: true,
                            confirmMsg: "Are you sure, You want to restart trade transfer?",
                            confirmAction: (e) =>
                                handleRestartTradeTransfer(e)
                        }))
                    }}
                >
                    <span><TbReload /></span>
                    Restart
                </button>
            </div>
            <div className={serStyle.serviceListSection}>
                <ol className={serStyle.serviceList}>
                    {missingTradeTransApi && missingTradeTransApi.map(val => {
                        return <li>{val}</li>
                    })}
                </ol >
            </div>
            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
                CloseConfirm={CloseConfirm}
            />
        </div>
    )
}

export default MissingTradeTransfer