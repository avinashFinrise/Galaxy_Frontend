import React, { useEffect, useMemo, useState } from "react";
import useApi from "../CustomHook/useApi";
import { GET_NETPOSITION_API } from "../../API/ApiServices";
import { useSelector } from "react-redux";
import GridComponent from "../TableComponent/GridComponent";
let netpositionObj = {};

const Companyposition = ({ view }) => {
  const [positionData, setPositionData] = useState({});
  const { data, loading, error, makeApiCall } = useApi();
  const ws = useSelector((state) => state?.websocket);
  // const accessData=useSelector(state=>state?.accessdata)
  let defaultGroupingBySymbol = ["symbol", "expirydate", "groupname", "userid"];
  let defaultGroupingByGroup = [];

  // for chart data ={"viewtype":"chart","exchange":"cme"}
  // for table data={"viewtype":"table","exchange":"cme","type":"symbol"}
  const memoizedPositionData = useMemo(() => positionData, [positionData]);

  useEffect(() => {
    makeApiCall(GET_NETPOSITION_API, {
      viewtype: "table",
      exchange: "all",
      type: "symbol",
    });
  }, []);

  useEffect(() => {
    if (data?.httpstatus === 200 && !loading) {
      Array.isArray(data.result) &&
        setPositionData(convertToObject(data.result));
    }
  }, [data]);

  useEffect(() => {
    if (!ws.status) return;
    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "netposition") {
        newData.data["cfqty"] =
          newData.data["cfqty"] * (newData.data["comsharingrate"] / 100);
        newData.data["cfamt"] =
          newData.data["cfamt"] * (newData.data["comsharingrate"] / 100);
        newData.data["companynetmtm"] =
          newData.data["netmtm"] * (newData.data["comsharingrate"] / 100);
        netpositionObj[newData.data.positionno] = newData.data;
      }
    };
    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  useEffect(() => {
    const updateInterval = setInterval(() => {
      setPositionData((previous) => ({
        ...previous,
        ...netpositionObj,
      }));
    }, 1000);

    // Clean up interval
    return () => {
      clearInterval(updateInterval);
    };
  }, [memoizedPositionData]);

  const convertToObject = (arr) => {
    const newObj = arr.reduce((objDict, obj) => {
      obj["cfqty"] = obj["cfqty"] * (obj["comsharingrate"] / 100);
      obj["cfamt"] = obj["cfamt"] * (obj["comsharingrate"] / 100);
      // obj["companynetmtm"] = obj["netmtm"] * (obj["comsharingrate"] / 100);
      objDict[obj.positionno] = obj;
      // objDict['cfqty']=objDict['cfqty']*(objDict["comsharingrate"]/100)
      return objDict;
    }, {});
    return newObj;
  };
  let excludeColumns = [
    "buyrate",
    "bfrate",
    "sellrate",
    "netrate",
    "cfrate",
    "exchange",
    "id",
    "positionno",
    "sender",
    "userid_id",
    "ctclid",
    "createddate",
    "updateddate",
    "accountcode",
    "segment",
    "segment_id",
    "exchange_id",
    "securitytype",
    "securitytype_idmembercode",
    "multiplier",
    "divider",
    "basecurrency",
    "token",
    "membercode",
    "securitytype_id",
    "opttype",
    "strikeprice",
    "date",
    "charges",
    "group_master_id",
    "ltp",
    "user_config_id",
    "group_config_id",
    "configname",
    "expirybuybrokrate",
    "expirysellbrokrate",
    "broktype",
    "brokersharingrate",
    "clientsharingrate",
    // "comsharingrate",
    "usdcost",
    "isusdlive",
    "usdrate",
    "cluster_id",
    "group_id",
    "clustername",
    "cluster",
    "group_config",
    "user_config",
    "group",
    "user",
    "buybrokrate",
    "sellbrokrate",
  ];

  // console.log(positionData);
  // console.log(data,loading,error);

  return (
    <>
      {positionData && (
        <GridComponent
          tableData={Object.values(memoizedPositionData)}
          defaultGrouping={
            view === "symbol" ? defaultGroupingBySymbol : defaultGroupingByGroup
          }
          excludeColumns={excludeColumns}
        />
      )}
    </>
  );
};

export default React.memo(Companyposition);
