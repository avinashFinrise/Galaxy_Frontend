import {
    useEffect,
    useState,
} from "react";
import { GET_SERVICEMANAGER_API, POST_RESTARTSERVICE_API } from "../../API/ApiServices";
import { Notification } from "../DynamicComp/Notification";
import serStyle from './ServiceManager.module.scss'
import { TbReload } from "react-icons/tb";

const MissingOtherServices = () => {
    const [missingOtherServiceApi, setMissingOtherServiceApi] = useState([]);
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

    const missingOtherServiceData = () => {
        setNotifyData((data) => ({
            ...data,
            loadingFlag: true,
            loadingMsg: "Fetching missing Other Service...",
        }));
        const apiCall = new Promise((resolve, reject) => {
            resolve(
                GET_SERVICEMANAGER_API({
                    event: "checkotherservices",
                })
            );
        });
        apiCall
            .then((res) => {
                // console.log("res*****************", res);
                setMissingOtherServiceApi(res.data.result);
                setNotifyData({
                    loadingFlag: false,
                });
                // setFilterOptions(res.data.result)
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
        missingOtherServiceData();
    }, []);
    const handleRestartOtherService = async (e) => {
        e.preventDefault();
        setNotifyData((prev) => ({
            ...prev,
            loadingFlag: true,
            loadingMsg: "Please Wait Restarting other service...",
        }));
        const restartData = new Promise((resolve, reject) => {
            resolve(POST_RESTARTSERVICE_API({ event: "restart_other_services" }));
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

    const handleReloadOtherService = async (e) => {
        e.preventDefault();
        missingOtherServiceData()
    }
    // console.log("missingOtherServiceApi", missingOtherServiceApi);
    return (
        <div style={{ height: '100%' }} >
            <div className={serStyle.BtnSection}>
                <button
                    onClick={handleReloadOtherService}
                    className={serStyle.reloadBtn}
                >
                    <span><TbReload /></span>
                    Reload
                </button>
                <button
                    // onClick={handleRestartOtherService}
                    onClick={(e) => {
                        setNotifyData((data) => ({
                            ...data,
                            confirmFlag: true,
                            confirmMsg: "Are you sure, You want to restart missing other services?",
                            confirmAction: (e) =>
                                handleRestartOtherService(e)
                        }))
                    }}
                >
                    <span><TbReload /></span>
                    Restart
                </button>
            </div>
            <div className={serStyle.serviceListSection}>
                <ol className={serStyle.serviceList}>
                    {missingOtherServiceApi && missingOtherServiceApi.map(val => {
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

export default MissingOtherServices