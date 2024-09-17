import {
  useEffect,
  useState,
} from "react";
import { TbReload } from "react-icons/tb";
import { GET_SERVICEMANAGER_API, POST_RESTARTSERVICE_API } from "../../API/ApiServices";
import { Notification } from "../DynamicComp/Notification";
import serStyle from './ServiceManager.module.scss'


const SpreadBookService = () => {
  const [missingSpreadbookApi, setMissingSpreadbookApi] = useState([]);
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
  const spreadeBookServiceData = () => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching missing spreadBook services...",
    }));
    const apiCall = new Promise((resolve, reject) => {
      resolve(
        GET_SERVICEMANAGER_API({
          event: "checkspreadbook",
        })
      );
    });
    apiCall
      .then((res) => {
        // console.log("res*****************", res);
        setMissingSpreadbookApi(res.data.result);
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
    spreadeBookServiceData()

  }, []);

  const handleRestartSpreadeBook = async (e) => {
    e.preventDefault();
    setNotifyData((prev) => ({
      ...prev,
      loadingFlag: true,
      loadingMsg: "Please Wait Restarting spreadBook services...",
    }));
    const restartData = new Promise((resolve, reject) => {
      resolve(POST_RESTARTSERVICE_API({ event: "restart_spreadbook_services" }));
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
  const handleReloadSpreadeBook = async (e) => {
    e.preventDefault();
    spreadeBookServiceData()
  }



  // console.log("missingSpreadbookApi", missingSpreadbookApi);
  return (
    <div style={{ height: '100%' }} >
      <div className={serStyle.BtnSection}>
        <button
          onClick={handleReloadSpreadeBook}
          className={serStyle.reloadBtn}
        >
          <span><TbReload /></span>
          Reload
        </button>
        <button
          // onClick={handleRestartSpreadeBook}
          onClick={(e) => {
            setNotifyData((data) => ({
              ...data,
              confirmFlag: true,
              confirmMsg: "Are you sure, You want to restart spreadbook?",
              confirmAction: (e) =>
                handleRestartSpreadeBook(e)
            }))
          }}
        >
          <span><TbReload /></span>
          Restart
        </button>
      </div>
      <div className={serStyle.serviceListSection}>
        <ol className={serStyle.serviceList}>
          {missingSpreadbookApi && missingSpreadbookApi.map(val => {
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
  );
};

export default SpreadBookService;
