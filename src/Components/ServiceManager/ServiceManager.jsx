import { Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { TbReload } from "react-icons/tb";
import { POST_RESTARTSERVICE_API } from "../../API/ApiServices";
import { Notification } from "../DynamicComp/Notification";
import MissingOtherServices from "./MissingOtherServices";
import MissingQuantity from "./MissingQuantity";
import MissingTrade from "./MissingTrade";
import MissingTradeTransfer from "./MissingTradeTransfer";
import serStyle from "./ServiceManager.module.scss";
import SpreadBookService from "./SpreadBookService";


const ServiceManager = () => {
  const [activeTab, setActiveTab] = useState("checkmissingtrade");
  const [activeIndex, setactiveIndex] = useState(0);
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
  const handleChange = (event, activeIndex) => {
    setactiveIndex(activeIndex);
  };

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
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
        setNotifyData({
          loadingFlag: false,
          successFlag: false,
          confirmFlag: false,
          errorFlag: true,
          errorMsg: err.response?.data.result
        });
      });
  }


  return (
    <div className={`service-maintabs  ${serStyle.serviceTabs}`}>
      <div className={serStyle.headerBtnSection}>
        <button
          // onClick={(e) => handleRestartAllService(e, "stop_all_services")}
          onClick={(e) => {
            setNotifyData((data) => ({
              ...data,
              confirmFlag: true,
              confirmMsg: "Are you sure, You want to stop all services?",
              confirmAction: (e) =>
                handleRestartAllService(e, "stop_all_services")
            }))
          }}
        >
          <span><TbReload /></span>
          Stop All
        </button>
        <button
          // onClick={(e) => handleRestartAllService(e, "restart_all_services")}
          onClick={(e) => {
            setNotifyData((data) => ({
              ...data,
              confirmFlag: true,
              confirmMsg: "Are you sure, You want to restart all services?",
              confirmAction: (e) =>
                handleRestartAllService(e, "restart_all_services")
            }))
          }}
        >
          <span><TbReload /></span>
          Restart All
        </button>
        <button
          onClick={(e) => {
            setNotifyData((data) => ({
              ...data,
              confirmFlag: true,
              confirmMsg: "Are you sure, You want to restart API?",
              confirmAction: (e) =>
                handleRestartAllService(e, "restart_api_services")
            }))
          }}
        > <span><TbReload /></span> Restart API </button>
      </div>
      <Tabs
        orientation="horizontal"
        value={activeIndex}
        onChange={handleChange}
        className="tab-select-content"
      >
        <Tab
          label={"Missing Trade"}
          onClick={() => setActiveTab("checkmissingtrade")}
          className="setting-single-tabs"
        />
        <Tab
          label={"Missing Quantity"}
          onClick={() => setActiveTab("checkquantity")}
          className="setting-single-tabs"
        />
        <Tab
          label={"SpreadBook Service"}
          onClick={() => setActiveTab("checkspreadbook")}
          className="setting-single-tabs"
        />
        <Tab
          label={"Trade Transfer Service"}
          onClick={() => setActiveTab("checktradetransfer")}
          className="setting-single-tabs"
        />
        <Tab
          label={"Other Service"}
          onClick={() => setActiveTab("checkotherservices")}
          className="setting-single-tabs"
        />
      </Tabs>
      <div className={`services-tab ${serStyle.servicesContainerTab}`}>
        {activeTab === "checkmissingtrade" && (
          <TabContainer>
            <MissingTrade />
          </TabContainer>
        )}
        {activeTab === "checkquantity" && (
          <TabContainer>
            <MissingQuantity />
          </TabContainer>
        )}
        {activeTab === "checkspreadbook" && (
          <TabContainer>
            <SpreadBookService />
          </TabContainer>
        )}
        {activeTab === "checktradetransfer" && (
          <TabContainer>
            <MissingTradeTransfer />
          </TabContainer>
        )}
        {activeTab === "checkotherservices" && (
          <TabContainer>
            <MissingOtherServices />
          </TabContainer>
        )}
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

function TabContainer(props) {
  return <Typography component="div">{props.children}</Typography>;
}
export default ServiceManager;
