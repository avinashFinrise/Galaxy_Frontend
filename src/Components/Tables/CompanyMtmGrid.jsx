import { AgGridReact } from "ag-grid-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { shallowEqual, useSelector } from "react-redux";
import {
  GET_MTMHISTORY_API,
  GET_NETPOSITION_API
} from "../../API/ApiServices";
import { formatValue, redGreenRowText } from "../../UtilityFunctions/grid";
import useGridSettings from "../CustomHook/useGridSettings";
import { Notification } from "../DynamicComp/Notification";



const defaultTotalRow = { netmtm: 0, grossmtm: 0, charges: 0 }

function CompanyMtmGrid({ dateRange, view, table, sharing, type, onDataFromTable ,basecurrency}) {
  const [positionData, setPositionData] = useState([]);
  const ws = useSelector((state) => state?.websocket, shallowEqual);


  // let componentName = `cmtm_${type}_${view}`;
  const componentInfoRef = useRef({ componentname: `cmtm_${type}_${view}`, componenttype: "table" })



  const gridRef = useRef();
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

  let defaultGroupingBySymbol = [
    "exchange",
    "symbol",
    // "expirydate",
    // "opttype",
    // "strikeprice",
    // "clustername",
    "groupname",
    "userid",
  ];
  let defaultGroupingByGroup = [
    // "clustername",
    "groupname",
    "userid",
    "exchange",
    "symbol",
    // "expirydate",
    // "opttype",
    // "strikeprice",
  ];
  let sharingKey =
    sharing === "getclientmtm"
      ? "clientsharingrate"
      : sharing === "getbrokermtm"
        ? "brokersharingrate"
        : sharing === "getcompanymtm"
          ? "comsharingrate"
          : "comsharingrate";

  let groupData =
    view == "group" ? defaultGroupingByGroup : defaultGroupingBySymbol;


  const fetchApiData = async () => {
    let livePositionGrouped = [];
    let sharedPosition = [];

    try {
      setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Loading Live Netposition' })
      const positionApi = await GET_NETPOSITION_API({
        event: "getnetposition",
        data: {
          fromdate: dateRange.fromdate,
          todate: dateRange.todate,
        },
      });

      setNotifyData({ ...NotifyData, loadingFlag: false })
      if (positionApi.data.result.length < 1) setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: 'Netposition History is Empty' })

      console.log({pos: positionApi.data.result})
      let usdFiltered = positionApi.data.result.filter(val => val.basecurrency == 'INR')
      console.log({usdFiltered})
      sharedPosition = calculatePosition(usdFiltered)

      livePositionGrouped = sharedPosition.reduce(
        (result, current) => {
          const matchingKey = `${current.groupname}_${current.userid}_${current.exchange}_${current.symbol}`;
          if (result[matchingKey]) {
            result[matchingKey].netmtm += current.netmtm;
            result[matchingKey].grossmtm += current.grossmtm;
            result[matchingKey].charges += current.charges;
          } else {
            result[matchingKey] = {
              clustername: current.clustername,
              groupname: current.groupname,
              userid: current.userid,
              exchange: current.exchange,
              symbol: current.symbol,
              netmtm: current.netmtm,
              grossmtm: current.grossmtm,
              charges: current.charges,
              // token: current.token,
              // basecurrency:current.basecurrency,
              uniqueKey: `${current.clustername}_${current.groupname}_${current.userid}_${current.exchange}_${current.symbol}`,
            };
          }
          return result;
        },
        {}
      );
      if (type === "netmtm") {

        setPositionData(Object.values(livePositionGrouped));

      }
    } catch (error) {
      setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: `Live Netposition ${error?.response?.data?.reason}` })
    }

    if (type === "bfamt" || type === "cfamt") {
      try {
        setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: "Loading Netposition History" })
        const historical = await GET_MTMHISTORY_API({
          event: 'getmtmhistory',
          data: {
            fromdate: dateRange.fromdate,
            todate: dateRange.todate,
            type: sharing,
            basecurrency: basecurrency,
            groupby: ["groupname", "userid", "clustername", "exchange", "symbol"]
          },
        })

        setNotifyData({ ...NotifyData, loadingFlag: false })
        if (historical.data.result.length < 1) setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: 'Netposition History is Empty' })
        let historicalData = historical.data.result.map((val) => {
          return {
            uniqueKey: `${val.clustername}_${val.groupname}_${val.userid}_${val.exchange}_${val.symbol}`,
            netmtm: val.bfmtm != 0 ? val.bfmtm * -1 : val.bfmtm,
            exchange: val.exchange,
            groupname: val.groupname,
            clustername: val.clustername,
            userid: val.userid,
            symbol: val.symbol,
            grossmtm: val.GrossMTM != 0 ? val.GrossMTM * -1 : val.GrossMTM,
            charges: val.Charges != 0 ? val.Charges * -1 : val.Charges
          };
        });
        if (type === "bfamt") {

          setPositionData(historicalData);
        }

        if (type === "cfamt") {
          let mtm = {};
          console.log({ historicalData, livePositionGrouped });
          historicalData.forEach(e => {
            if (!mtm[e.uniqueKey]) mtm[e.uniqueKey] = { netmtm: 0, grossmtm: 0, charges: 0, clustername: e.clustername, exchange: e.exchange, groupname: e.groupname, symbol: e.symbol, uniqueKey: e.uniqueKey, userid: e.userid }

            mtm[e.uniqueKey].netmtm += e.netmtm
            mtm[e.uniqueKey].grossmtm += e.grossmtm
            mtm[e.uniqueKey].charges += e.charges
          })

          Object.values(livePositionGrouped).forEach(e => {
            if (!mtm[e.uniqueKey]) mtm[e.uniqueKey] = { netmtm: 0, grossmtm: 0, charges: 0, clustername: e.clustername, exchange: e.exchange, groupname: e.groupname, symbol: e.symbol, uniqueKey: e.uniqueKey, userid: e.userid }

            mtm[e.uniqueKey].netmtm += e.netmtm
            mtm[e.uniqueKey].grossmtm += e.grossmtm
            mtm[e.uniqueKey].charges += e.charges
          })

          // console.log({ 'mtm':Object.values(mtm) });


          // let mergedData = historicalData.reduce((result, currentObj) => {
          //   // let res = live.find((val) => val.uniqueKey == currentObj.uniqueKey);
          //   let res = livePositionGrouped[currentObj.uniqueKey];
          //   if (res) {
          //     result.push({
          //       ...res,

          //       netmtm: currentObj.netmtm + res.netmtm,
          //       grossmtm: currentObj.grossmtm + res.grossmtm,
          //       charges: currentObj.charges + res.charges,
          //     });
          //   } else {
          //     result.push({
          //       // ...currentObj,
          //       clustername: currentObj.clustername,
          //       groupname: currentObj.groupname,
          //       userid: currentObj.userid,
          //       exchange: currentObj.exchange,
          //       symbol: currentObj.symbol,
          //       netmtm: currentObj.netmtm,
          //       grossmtm: currentObj.grossmtm,
          //       charges: currentObj.charges,
          //     });
          //   }

          //   return result;
          // }, []);

          setPositionData(Object.values(mtm))
          // setPositionData(mergedData)
        }
      } catch (error) {

        setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: `Netposition History ${error?.response?.data?.reason}` })
      }
    }
  }


  useEffect(() => {
    fetchApiData()

  }, [dateRange]);


  useEffect(() => {
    if (!ws.status) return;
    if (type === "bfamt") return;

    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "netposition") {
        let formattedData = {
          ...newData.data,
          uniqueKey: `${newData.data.clustername}_${newData.data.groupname}_${newData.data.userid}_${newData.data.exchange}_${newData.data.symbol}`,
        };
        const rowNode = gridRef.current.api.getRowNode(
          formattedData.uniqueKey
        )?.id;


        // const rowNode = gridRef.current.api.getRowNode(
        //   newData.data.positionno
        // )?.id;
        if (newData?.data?.basecurrency == 'USD') {
          if (rowNode) {
            gridRef.current.api.applyTransactionAsync({
              update: [
                {
                  ...newData.data,
                  // livenetmtm:
                  //   newData.data["netmtm"] * (newData.data[sharingKey] / 100),
                  grossmtm:
                    newData.data["grossmtm"] *
                    (newData.data[sharingKey] / 100) *
                    -1,
                  charges:
                    newData.data["charges"] *
                    (newData.data[sharingKey] / 100) *
                    -1,
                  netmtm:
                    newData.data["netmtm"] *
                    (newData.data[sharingKey] / 100) *
                    -1,
                  // companynetmtm:
                  //   newData.data["netmtm"] *
                  //   (newData.data["comsharingrate"] / 100),
                },
              ],
            });
          } else {
            gridRef.current.api.applyTransactionAsync({
              add: [
                {
                  ...newData.data,
                  // companynetmtm:
                  //   newData.data["netmtm"] *
                  //   (newData.data["comsharingrate"] / 100),
                  // livenetmtm:
                  //   newData.data["netmtm"] * (newData.data[sharingKey] / 100),
                  grossmtm:
                    newData.data["grossmtm"] *
                    (newData.data[sharingKey] / 100) *
                    -1,
                  charges:
                    newData.data["charges"] *
                    (newData.data[sharingKey] / 100) *
                    -1,
                  netmtm:
                    newData.data["netmtm"] *
                    (newData.data[sharingKey] / 100) *
                    -1,
                },
              ],
            });
          }
        }
      }

      if (newData.event === "ticker") {
        gridRef.current.api.forEachNode((rowNode) => {
          if (rowNode.data) {
            if (rowNode.data.token === newData.data.token) {
              let node = {
                ...rowNode.data,
                grossmtm:
                  (rowNode.data.cfamt +
                    rowNode.data.cfqty *
                    newData.data.data.ltp *
                    rowNode.data.multiplier) *
                  -1,
                netmtm:
                  (rowNode.data.cfamt +
                    rowNode.data.cfqty *
                    newData.data.data.ltp *
                    rowNode.data.multiplier -
                    rowNode.data.charges) *
                  -1,
              };
              gridRef.current.api.applyTransactionAsync({
                update: [node],
              });
            }
          }
        });
      }
    };
    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);



  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, hide: true, filter: true }

    if (groupData.indexOf(key) > -1) {
      option['rowGroup'] = true
      option['rowGroupIndex'] = groupData.indexOf(key)
    }

    if (["grossmtm", "netmtm", "charges", "livenetmtm"].indexOf(key) > -1) {
      option['hide'] = false
      option['filter'] = false
      option['valueFormatter'] = formatValue
      option['aggFunc'] = "sum"
      option['cellStyle'] = redGreenRowText
    }
    if (key == 'uniqueKey') option['filter'] = false
    return option
  }, [])

  const { gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo: componentInfoRef.current,
    onReload: fetchApiData,
    colDef: { generateColDef, row: positionData[0] },
    // groupBy: ["basecurrency"],
    settings: {
      sideBar: true
    }
  })
  useEffect(() => {
    setNotifyData(GridNotifyData)
  }, [GridNotifyData])


  useEffect(() => {
    if (!positionData?.length) return
    onReady()
  }, [positionData])


  // const calculatePosition = (arr) => {
  //   let newArr = arr.map((val) => {
  //     return {
  //       ...val,
  //       // livenetmtm: val["netmtm"] * (val[sharingKey] / 100),
  //       grossmtm: val["grossmtm"] * (val[sharingKey] / 100) * -1,
  //       charges: val["charges"] * (val[sharingKey] / 100) * -1,
  //       netmtm: val["netmtm"] * (val[sharingKey] / 100) * -1,
  //       // companynetmtm: val["netmtm"] * (val["comsharingrate"] / 100),
  //     };
  //   });

  //   return newArr;
  // };
  const calculatePosition = (arr) => {
    let newArr = arr.map((val) => {
      return {
        ...val,
        // livenetmtm: val["netmtm"] * (val[sharingKey] / 100),

        grossmtm: val["grossmtm"] * (val[sharingKey] / 100) * -1,
        charges: val["charges"] * (val[sharingKey] / 100) * -1,
        netmtm: val["netmtm"] * (val[sharingKey] / 100) * -1,
        // companynetmtm: val["netmtm"] * (val["comsharingrate"] / 100),
      };
    });

    return newArr;
  };

  const getRowId = useCallback((params) => {
    // return params.data.positionno;
    return params.data.uniqueKey
  });

  const autoGroupColumnDef = useMemo(() => {
    return {
      minWidth: 300,
      pinned: "left",
    };
  }, []);




  const [total, setTotal] = useState(defaultTotalRow)

  const calculateTotal = () => {
    const totalRow = { ...defaultTotalRow }
    gridRef.current.api.forEachNodeAfterFilterAndSort(({ data }) => {
      if (data) {
        Object.keys(defaultTotalRow).forEach(k => totalRow[k] += data[k])
      }
    })
    setTotal(totalRow)

    // gridRef.current.api.setPinnedBottomRowData([totalRow])
  }



  return (
    <>
      <AgGridReact
        {...gridProps}
        pinnedBottomRowData={[total]}
        // className="ag-theme-alpine"
        getRowId={getRowId}
        onGridReady={calculateTotal}
        onModelUpdated={calculateTotal}
        onFilterModified={calculateTotal}
        ref={gridRef}
        // columnDefs={columnCreation}
        rowData={positionData}
        // rowData={type === "bfamt" ? bfData : positionData}
        // asyncTransactionWaitMillis={500}
        pagination={true}
        paginationPageSize={50}
        animateRows={false}
        rowSelection={"multiple"}
        autoGroupColumnDef={autoGroupColumnDef}
        // maintainColumnOrder={true}
        groupDisplayType={"singleColumn"}
        // sideBar={{ toolPanels: ["filters"] }}
        // sideBar={sideBar}
        // showOpenedGroup={true}
        suppressAggFuncInHeader={true}
      // defaultColDef={defaultColDef}
      // onFilterChanged={() => {

      //   calculateTotal()
      //   // handleComponentSetting();
      // }}

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

export default React.memo(CompanyMtmGrid);
