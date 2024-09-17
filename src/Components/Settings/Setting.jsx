import { Tab, Tabs, Typography } from "@mui/material";
import { Select } from "antd";
import { memo, useEffect, useState } from "react";
import {
  AiFillAccountBook,
  AiOutlineCluster,
} from "react-icons/ai";
import { FaHandHoldingUsd, FaHandsHelping, FaUser, FaUserCog, FaUsers } from "react-icons/fa";
import { FaFileCircleCheck, FaUsersGear } from "react-icons/fa6";
import { GiSandsOfTime } from "react-icons/gi";
import { IoKeySharp } from "react-icons/io5";
import { MdGroup } from "react-icons/md";
import { shallowEqual, useSelector } from "react-redux";
import {
  AlternateGroups,
  BasicInfo,
  ChangePwd,
  ClusterTable,
  CreateCluster,
  CreateGroup,
  CreateMarginConfig,
  CreateUserId,
  GroupConfig,
  GroupConfigTable,
  GroupTable,
  ImportTradeBook,
  LimitAllotment,
  MarginRate,
  UserBasicDetails,
  UserConfig,
  UserConfigTable,
  ViewLimitAllotment,
  ViewMarginRate,
  ViewSettlement,
  ViewTradeBook,
  ViewUserIdTable,
} from ".";
import user from "../../assets/Icon/usericon1.png";
import Ledger from "./Ledger/Ledger";
import LedgerTable from "./Ledger/LedgerTable";
import setStyle from "./Setting.module.scss";
import UsdRate from "./UsdRate/UsdRate";
import ViewUsdrate from "./UsdRate/ViewUsdrate";
import Ctcl from "./ctcl/Ctcl";
import VerifiedReport from "./verifiedReport/VerifiedReport";
import { useSearchParams } from "react-router-dom";

const Setting = () => {
  const userControlSettings = useSelector(
    (state) => state.userControlSettings,
    shallowEqual
  );
  // console.log({ userControlSettings })

  const [params, setParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(params.get("activeTab") || "profile");
  const [activeIndex, setactiveIndex] = useState(0);
  const handleChange = (event, activeIndex) => {
    setactiveIndex(activeIndex);
  };

  const [viewState, setViewState] = useState({
    showClusterData: false,
    showGroupConfData: false,
    showGroupData: false,
    showUserConfData: false,
    showTradeData: false,
    showUsdRate: false,
    showMarginRate: false,
    showMarginAllotment: false,
    showLedger: false,
    showUserId: false,
    showVerifiedReport: false,
  });

  const toggleViewState = (key) => {
    setViewState((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const [userData, setuserData] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setParams({ activeTab: activeTab });
  }, [activeTab]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("data"));
    setuserData(userData);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600); // Adjust the breakpoint as needed
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const mobTabs = [
    { icon: <FaUser />, value: 'profile', text: 'Profile', key: '', },
    { icon: <IoKeySharp />, value: 'changePassword', text: 'Change Password', key: 'is_changepassword' },
    { icon: <FaUser />, value: 'createuserid', text: 'Create UserID', key: 'is_createuserid' },
    { icon: <MdGroup />, value: 'creategroup', text: 'Create Group', key: "is_group" },
    { icon: <AiOutlineCluster />, value: 'createCluster', text: 'Create Cluster', key: 'is_cluster' },
    { icon: <FaUsersGear />, value: 'groupConfig', text: ' Group Configuration', key: 'is_groupconfig' },
    { icon: <FaUserCog />, value: 'userConfig', text: 'Set User Configuration', key: 'is_userconfig' },
    { icon: <AiFillAccountBook />, value: 'tradeBook', text: 'Trade', key: 'is_tradebook' },
    { icon: <FaHandsHelping />, value: 'settlement', text: 'Settlement', key: 'is_settlement' },
    { icon: <FaHandHoldingUsd />, value: 'usdrate', text: 'USD Rate Table', key: 'is_usdrate' },
    { icon: <FaUsersGear />, value: 'marginConfig', text: 'Margin Configuration', key: 'is_marginconfig' },
    { icon: <GiSandsOfTime />, value: 'limitAllotment', text: 'Limit Allotment', key: 'is_marginallotment' },
    { icon: <FaFileCircleCheck />, value: 'verifiedReport', text: 'Verified report', key: 'is_verifyreport' },
    { icon: <FaFileCircleCheck />, value: 'ledger', text: 'Ledger', key: 'is_ledger' },
    { icon: <FaUsers />, value: 'alternateGroups', text: ' Alternate Groups', key: 'is_alternategroup' },
    { icon: <FaFileCircleCheck />, value: 'ctclid', text: 'CTCL ID', key: 'is_ctclid' }
  ];

  const antdOptions = mobTabs.map(item => ({
    value: item.value,
    label: (
      <h6 className="settingsetHeading">

        <span className="setHeadimgIcon">{item.icon}</span>
        {item.text}
      </h6>
    )
  }));

  return (
    <div className={`container-fluid ${setStyle.settingMainPage}`}>
      <div className={setStyle.settingPage}>
        <div className={setStyle.settingHeaderBanner}></div>
        <div className={`${setStyle.settingHeader} setting-header`}>
          <div className={setStyle.settinguserIcon}>
            <img
              src={user}
              alt="usericon"
            />
          </div>
          <div className={`${setStyle.settinguserInfo} setting-userInfo`}>
            <h6>{userData?.username}</h6>
            <span>{userData?.role}</span>
          </div>
        </div>
      </div>
      <div className={`row ${setStyle.settingallContent}`}>
        {isMobile ? (
          <div className="col-md-12 setting-mobiletabsSelction">
            <Select
              style={{ width: "100%" }}
              size="large"
              value={activeTab}
              onChange={handleTabChange}
              options={antdOptions}
            />
          </div>
        ) : (
          <div className="col-md-3">
            <div className={`setting-maintabs ${setStyle.settingTabs}`}>
              <Tabs
                value={activeIndex}
                onChange={handleChange}
                orientation="vertical"
              >
                {
                  mobTabs.map((item, index) => {
                    return (
                      item.key ?
                        (userControlSettings &&
                          userControlSettings?.setting_control?.[item.key] && (
                            <Tab
                              label={
                                <h6 className={`${setStyle.setHeading} setHeading`}>
                                  <span className={setStyle.setHeadimgIcon}>
                                    {item.icon}
                                  </span>
                                  {item.text}
                                </h6>
                              }
                              className={`setting-single-tabs ${setStyle.settingSingleTab}`}
                              onClick={() => setActiveTab(item.value)}
                            />
                          )
                        )
                        : <Tab
                          label={
                            <h6 className={`${setStyle.setHeading} setHeading`}>
                              <span className={setStyle.setHeadimgIcon}>
                                {item.icon}
                              </span>
                              {item.text}
                            </h6>
                          }
                          className={`setting-single-tabs ${setStyle.settingSingleTab}`}
                          onClick={() => setActiveTab(item.value)}
                        />
                    )
                  })
                }
              </Tabs>
            </div>
          </div>
        )}

        <div className={`col-md-9 ${setStyle.settingProfileTab}`}>
          {activeTab === "profile" && (
            <div>
              <BasicInfo />
              <div className="">
                <UserBasicDetails />
              </div>
            </div>
          )}
          {activeTab === "changePassword" && (
            <div>
              <ChangePwd />
            </div>
          )}
          {activeTab === "createuserid" && (
            <div>
              <CreateUserId
                visibility={viewState.showUserId}
                toggleVisibility={() => toggleViewState("showUserId")}
              />
              {viewState.showUserId && <ViewUserIdTable />}
            </div>
          )}
          {activeTab === "creategroup" && (
            <div>
              <CreateGroup
                visibility={viewState.showGroupData}
                toggleVisibility={() => toggleViewState("showGroupData")} />
              {viewState.showGroupData && <GroupTable />}
            </div>
          )}
          {activeTab === "createCluster" && (
            <div>
              <CreateCluster
                visibility={viewState.showClusterData}
                toggleVisibility={() => toggleViewState("showClusterData")} />
              {viewState.showClusterData && <ClusterTable />}
            </div>
          )}
          {activeTab === "groupConfig" && (
            <div>
              <GroupConfig
                visibility={viewState.showGroupConfData}
                toggleVisibility={() => toggleViewState("showGroupConfData")} />
              {viewState.showGroupConfData && <GroupConfigTable />}
            </div>
          )}
          {activeTab === "userConfig" && (
            <div>
              <UserConfig
                visibility={viewState.showUserConfData}
                toggleVisibility={() => toggleViewState("showUserConfData")} />
              {viewState.showUserConfData && <UserConfigTable />}
            </div>
          )}
          {activeTab === "tradeBook" && (
            <div>
              <ImportTradeBook
                visibility={viewState.showTradeData}
                toggleVisibility={() => toggleViewState("showTradeData")} />
              {viewState.showTradeData && <ViewTradeBook />}
            </div>
          )}
          {activeTab === "settlement" && (
            <div>
              <ViewSettlement />

            </div>
          )}
          {activeTab === "usdrate" && (
            <div>
              <UsdRate
                visibility={viewState.showUsdRate}
                toggleVisibility={() => toggleViewState("showUsdRate")} />
              {viewState.showUsdRate && <ViewUsdrate />}
            </div>
          )}
          {activeTab === "marginConfig" && (
            <div>
              <CreateMarginConfig />
              <MarginRate
                visibility={viewState.showMarginRate}
                toggleVisibility={() => toggleViewState("showMarginRate")} />
              {viewState.showMarginRate && <ViewMarginRate />}
            </div>
          )}
          {activeTab === "limitAllotment" && (
            <div>
              <LimitAllotment
                visibility={viewState.showMarginAllotment}
                toggleVisibility={() => toggleViewState("showMarginAllotment")} />
              {viewState.showMarginAllotment && <ViewLimitAllotment />}
            </div>
          )}
          {activeTab === "verifiedReport" && (
            <div>
              <VerifiedReport />
            </div>
          )}
          {activeTab === "ledger" && (
            <div>
              <Ledger
                visibility={viewState.showLedger}
                toggleVisibility={() => toggleViewState("showLedger")} />
              {viewState.showLedger && <LedgerTable />}
            </div>
          )}
          {activeTab === "alternateGroups" && (
            <div>
              <AlternateGroups />
            </div>
          )}
          {activeTab === "ctclid" && (
            <div>
              <Ctcl />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(Setting);
