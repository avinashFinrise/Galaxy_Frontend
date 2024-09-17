import React, { useEffect, useState } from "react";
import {
  GET_HISTORICAL_DATA_API,
  GET_NETPOSITION_API,
} from "../../API/ApiServices";
import GridComponent from "../TableComponent/GridComponent";
import { shallowEqual, useSelector } from "react-redux";
import { Notification } from "../DynamicComp/Notification";

let defaultGroupingBySymbol = [
  "exchange",
  "symbol",
  "expirydate",
  "opttype",
  "strikeprice",
  "groupname",
  "userid",
];
let defaultGroupingByGroup = [
  "groupname",
  "userid",
  "exchange",
  "symbol",
  "expirydate",
  "opttype",
  "strikeprice",
];
let excludeColumns = [
  // "expirydate",
  // "opttype,",
  // "strikeprice",
  "ex_buyamt",
  "ex_buyqty",
  "ex_charges",
  "ex_sellamt",
  "ex_sellqty",
  "clientmtm",
  "brokmtm",
  "cosmtm",
  "bfamt",
  "cfamt",
  "buyamt",
  "sellamt",
  "netamt",
  "id",
  "positionno",
  "sender",
  "userid_id",
  "ctclid",
  "accountcode",
  // "segment",
  "segment_id",
  "exchange_id",
  "securitytype",
  "securitytype_idmembercode",
  "multiplier",
  "divider",
  "token",
  "membercode",
  "securitytype_id",
  // "opttype",
  // "strikeprice",
  "date",
  // "charges",
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
  "comsharingrate",
  "usdcost",
  "isusdlive",
  "usdrate",
  "cluster_id",
  "group_id",
  // "clustername",
  "createddate",
  "updateddate",
  "configName",
  "cluster",
  "group_config",
  "user_config",
  "group",
  "user",
  "buybrokrate",
  "sellbrokrate",
  "basecurrency",
  // "exchange",
  "bfrate",
  "cfrate",
  "netrate",
  "buyrate",
  "sellrate",
];

let defaultGroupingBySymbolInPosition = [
  "symbol",
  "expirydate",
  "opttype",
  "strikeprice",
  "groupname",
  "userid",
];




function PositionGrid({ view, table, dateRange, onDataFromTable }) {
  const [positionData, setPositionData] = useState([]);
  const positionType = useSelector(
    (state) => state.positionTypeInMtm,
    shallowEqual
  );
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

  let finalExcludeColumns =
    view == "symbol" && table == "position"
      ? [...excludeColumns, "exchange"]
      : [excludeColumns];



  useEffect(() => {
    let livePosition = [];

    (async () => {
      setNotifyData({
        loadingFlag: true,
        loadingMsg: "Loading Netposition Live...",
      });
      const positionApi = await GET_NETPOSITION_API({
        event: "getnetposition",
        // data: table === "mtm" ? dateRange : {},
        data: dateRange,
      });

      if (positionApi.status == 200) {
        setNotifyData({
          loadingFlag: false,
        });
        if (table !== "mtm" && positionApi.data.result.length < 1) {
          setNotifyData({
            loadingFlag: false,
            errorFlag: true,
            errorMsg: "Netposition Live is Empty",
          });
        } else if (
          table == "mtm" &&
          positionType !== "bf" &&
          positionApi.data.result.length < 1
        ) {
          setNotifyData({
            loadingFlag: false,
            errorFlag: true,
            errorMsg: "Netposition Live is Empty",
          });
        }

        if (table === "mtm") {
          if (positionType === "") {
            livePosition = positionApi.data.result;
          }
          if (positionType === "td") {
            setPositionData(positionApi.data.result);
          }
        } else {
          setPositionData(positionApi.data.result);
        }
      }

      if (table === "mtm" && (positionType == "bf" || positionType == "")) {
        setNotifyData({
          loadingFlag: true,
          loadingMsg: "Loading NetpositionRec...",
        });
        const historical = await GET_HISTORICAL_DATA_API({
          event: "netposition",
          data: dateRange,
        });

        if (historical.status == 200) {
          setNotifyData({
            loadingFlag: false,
          });
          if (historical.data.result.length < 1) {
            setNotifyData({
              loadingFlag: false,
              errorFlag: true,
              errorMsg: "Netposition Rec is Empty",
            });
          }
          if (historical.data.result.length < 1) return;

          if (positionType === "bf") {
            setPositionData(historical.data.result);
          }
          if (positionType == "") {
            const mergedArray = historical.data.result.map((item1) => {
              const matchingItem2 = livePosition.find(
                (item2) => item2.positionno === item1.positionno
              );
              if (matchingItem2) {
                return {
                  ...item1,
                  ...matchingItem2,
                  netmtm: item1.netmtm + matchingItem2.netmtm,
                  grossmtm: item1.grossmtm + matchingItem2.grossmtm,
                  charges: item1.charges + matchingItem2.charges,
                };
              } else {
                return item1;
              }
            });

            // const mergedArray = livePosition.map((item1) => {
            //   const matchingItem2 = historical.data.result.find(
            //     (item2) => item2.positionno === item1.positionno
            //   );
            //   if (matchingItem2) {
            //     return {
            //       ...item1,
            //       ...matchingItem2,
            //       netmtm: item1.netmtm + matchingItem2.netmtm,
            //       grossmtm: item1.grossmtm + matchingItem2.grossmtm,
            //       charges: item1.charges + matchingItem2.charges,
            //     };
            //   } else {
            //     return item1;
            //   }
            // });

            setPositionData(mergedArray);
          }
        }
      }
    })();
  }, [dateRange]);

  return (
    <>
      <GridComponent
        tableData={positionData}
        groupData={view == "group" ? defaultGroupingByGroup : defaultGroupingBySymbol}
        excludeColumns={excludeColumns}
        // excludeColumns={excludeColumns}
        table={table}
        view={view}
        onDataFromTable={onDataFromTable}
      />
      <div>
        <Notification
          notify={NotifyData}
          CloseError={CloseError}
          CloseSuccess={CloseSuccess}
        />
      </div>
    </>
  );
}

export default React.memo(PositionGrid);
