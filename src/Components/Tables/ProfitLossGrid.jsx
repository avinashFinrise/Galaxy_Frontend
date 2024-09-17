import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { shallowEqual, useSelector } from "react-redux";
import {
  GET_MTMHISTORY_API,
  GET_NETPOSITION_API,
} from "../../API/ApiServices";
import { formatValue } from "../../UtilityFunctions/grid";
import useGridSettings from "../CustomHook/useGridSettings";

const componentInfo={ componentname: 'profitLoss', componenttype: "table" }

function ProfitLossGrid({ PNL, view, basecurrency }) {
  const [positionData, setPositionData] = useState([]);
  const [GroupedPositionData, setGroupedPositionData] = useState([]);
  const gridRef = useRef();

  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const dateRange = useSelector((state) => state?.dateRange, shallowEqual);


  let defaultGroupingByGroup = ["groupname", "userid"];
  

  const defaultColDef = useMemo(() => {
    return {
      // editable: true,
      // sortable: true,
      flex: 1,
      minWidth: 100,
      // // filter: true,
      resizable: true,
      // filter: "agTextColumnFilter",
      floatingFilter: true,
      // cellDataType: false,
      width: 50,
      editable: true,
      filter: "agTextColumnFilter",
    };
  }, []);

  const fetchApiData=async()=>{
    // const position = new Promise((resolve, reject) => {
    //   resolve(
    //     GET_NETPOSITION_API({
    //       event: "getnetposition",
    //       data: {
    //         fromdate: dateRange.fromdate,
    //         todate: dateRange.todate,
    //       },
    //     })
    //   );
    // });

    // const historical = new Promise((resolve, reject) => {
    //   resolve(
    //     GET_HISTORICAL_DATA_API({
    //       event: "netposition",
    //       data: {
    //         fromdate: dateRange.fromdate,
    //         todate: dateRange.todate,
    //         type: "client",
    //         filters: [],
    //       },
    //     })
    //   );
    // });

    // const apiData = await Promise.all([position, historical])
    //   .then((res) => {
    //     let positionLive = res[0].data.result;

    //     let groupedpositionRec = res[1].data.result.reduce((result, item) => {
    //       const key = item.positionno;
    //       if (!result[key]) {
    //         result[key] = [];
    //       }
    //       result[key].push(item);
    //       return result;
    //     }, {});

    //     let ObjwithMatchingPositionno = {};

    //     positionLive.forEach((val) => {
    //       if (groupedpositionRec[val.positionno]) {
    //         ObjwithMatchingPositionno[val.positionno] =
    //           groupedpositionRec[val.positionno];
    //       }
    //     });

    //     let positionRec = Object.values(ObjwithMatchingPositionno)
    //       .flat()
    //       .map((val) => {
    //         return { ...val, bfmtm: val.netmtm };
    //       });

    //     let mergedData = positionLive.map((item1) => {
    //       const matchingItem2 = positionRec.find(
    //         (item2) => item2.positionno === item1.positionno
    //       );

    //       if (matchingItem2) {
    //         return {
    //           ...item1,
    //           ...matchingItem2,
    //           tdmtm: item1.netmtm,
    //           ttmtm: matchingItem2.bfmtm + item1.netmtm,
    //           percentchange:
    //             matchingItem2.bfmtm == 0
    //               ? item1.netmtm
    //               : (item1.netmtm / matchingItem2.bfmtm) * 100,
    //         };
    //       } else {
    //         return item1;
    //       }
    //     });

    //     setPositionData(mergedData);
    //   })
    //   .catch((err) => console.log(err));
    const live = new Promise((resolve, reject) => {
      resolve(GET_NETPOSITION_API({ event: "getnetposition" }));
    });

    const mtmHistoryData = new Promise((resolve, reject) => {
      resolve(
        GET_MTMHISTORY_API({
          event: "getpnl",
          data: {
            fromdate: dateRange.fromdate,
            todate: dateRange.todate,
            type: "all",
            basecurrency: basecurrency,
          },
        })
      );
    });

    const groupedApi = await Promise.all([mtmHistoryData, live]).then(
      (response) => {
        // let historicalData = response[0].data.result.map((val) => {
        //   return {
        //     ...val,
        //     uniqueKey: `${val.clustername}_${val.groupname}_${val.userid}`,
        //   };
        // });


        let currencyFiltered = basecurrency == "usd" ? response[1].data.result.filter(val => val.basecurrency == "USD") : response[1].data.result.map(val => { return val.basecurrency == "USD" ? { ...val, netmtm: val.netmtm * val.usdrate } : val })

        // let liveGrouped = currencyFiltered.reduce(
        //   (result, current) => {
        //     const keyForMapping = `${current.clustername}_${current.groupname}_${current.userid}`;
        //     if (result[keyForMapping]) {
        //       result[keyForMapping].netmtm += current.netmtm;
        //     } else {
        //       result[keyForMapping] = {
        //         clustername: current.clustername,
        //         groupname: current.groupname,
        //         userid: current.userid,
        //         netmtm: current.netmtm,
        //         uniqueKey: `${current.clustername}_${current.groupname}_${current.userid}`,
        //       };
        //     }
        //     return result;
        //   },
        //   {}
        // );

        // let live = Object.values(liveGrouped);

        // let mergedData = historicalData.reduce((result, currentObj) => {
        //   // console.log("HistoricalCurrentObj", currentObj);
        //   // let res = live.find((val) => val.uniqueKey == currentObj.uniqueKey);
        //   let res = liveGrouped[currentObj.uniqueKey];
        //   if (res) {
        //     result.push({
        //       ...currentObj,
        //       tdmtm: res.netmtm,
        //       ttmtm: currentObj.bfmtm + res.netmtm,
        //       percentchange:
        //         currentObj.bfmtm == 0
        //           ? res.netmtm
        //           : (res.netmtm / currentObj.bfmtm) * 100,
        //     });
        //   } else {
        //     result.push({
        //       ...currentObj,
        //       tdmtm: 0,
        //       ttmtm: currentObj.bfmtm + 0,
        //       percentchange:
        //         currentObj.bfmtm == 0 ? 0 : (0 / currentObj.bfmtm) * 100,
        //     });
        //   }

        //   return result;
        // }, []);


          const userSet = {}
          const user = {}
          currencyFiltered.forEach(e => {
            const uniqueId = `${e.clustername}${e.groupname}${e.userid}`

              if(!userSet[uniqueId]) userSet[uniqueId] = [e]
              else userSet[uniqueId].push(e)

              if (!user[uniqueId]) user[uniqueId] = user[uniqueId] = { uniqueKey: uniqueId,  tdmtm: 0, bfmtm: 0, ttmtm: 0,clustername:e.clustername,groupname:e.groupname,userid:e.userid }
              user[uniqueId].tdmtm += e.netmtm
              user[uniqueId].ttmtm += e.netmtm
              
          })

          response[0].data.result.forEach(e => {
            const uniqueId = `${e.clustername}${e.groupname}${e.userid}`
              if(!userSet[uniqueId]) userSet[uniqueId] = [e]
              else userSet[uniqueId].push(e)
            
              if (!user[uniqueId]) user[uniqueId] = user[uniqueId] = { uniqueKey: uniqueId,  tdmtm: 0, bfmtm: 0, ttmtm: 0 ,clustername:e.clustername,groupname:e.groupname,userid:e.userid}
              
              user[uniqueId].bfmtm += e.bfmtm
            user[uniqueId].ttmtm += e.bfmtm
            
          })

      
       



        // let mergedLive = live.reduce((result, current) => {
        //   const res = mergedData.find(
        //     (val) => val.uniqueKey == current.uniqueKey
        //   );
        //   if (res) {
        //     console.log("res", res);
        //   } else {
        //     console.log("result", result);
        //     result.push({
        //       ...current,
        //       bfmtm: 0,
        //       tdmtm: current.netmtm,
        //       ttmtm: 0 + current.netmtm,
        //       percentchange: current.netmtm,
        //     });
        //   }
        //   return result;
        // }, []);

        setGroupedPositionData(Object.values(user))
        // setGroupedPositionData([...mergedData, ...mergedLive]);
        // setGroupedPositionData(mergedData);
      }
    );
    // mtmHistoryData
    //   .then((res) => {
    //     setGroupedPositionData(res.data.result);
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  }

  useEffect(() => {
    fetchApiData()
  }, []);


  useEffect(() => {
    if (!ws.status) return;

    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      let formattedData = {
        ...newData.data,
        uniqueKey: `${newData.data.clustername}_${newData.data.groupname}_${newData.data.userid}`,
        tdmtm:newData.data.netmtm
      };
      if (newData.event === "netposition") {
        const rowNode = gridRef.current.api.getRowNode(
          formattedData.uniqueKey
        )?.id;

        if (rowNode) {
          gridRef.current.api.applyTransactionAsync({
            update: [formattedData],
          });
        } else {
          gridRef.current.api.applyTransactionAsync({
            add: [formattedData],
          });
        }
      }

      // if (newData.event === "ticker") {
      //   if (table === "mtm") {
      //     gridRef.current.api.forEachNode((rowNode) => {
      //       if (rowNode.data) {
      //         if (rowNode.data.token === newData.data.token) {
      //           let node = {
      //             ...rowNode.data,
      //             grossmtm:
      //               rowNode.data.cfamt +
      //               rowNode.data.cfqty *
      //                 newData.data.data.ltp *
      //                 rowNode.data.multiplier,
      //             netmtm: node.grossmtm - node.charges,
      //           };
      //           gridRef.current.api.applyTransactionAsync({
      //             update: [node],
      //           });
      //         }
      //       }
      //     });
      //   }
      // }
    };
    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true,hide:true,filter:true,valueFormatter: formatValue  }
    if (key.indexOf("percent") > -1) {
      option["filter"] = false
      option["valueFormatter"] = myValueFormatterforPercent
      option["cellRenderer"] = "agGroupCellRenderer"
      option["cellStyle"] = (params) => ({ color: params.value >= 0 ? "green" : "red" })
    }
    if (key.indexOf("mtm") > -1) {
      option["aggFunc"] = "sum"
      option["cellStyle"] = (params) => ({ color: params.value >= 0 ? "green" : "red" })
      option['hide'] = false
      option['filter']=false
    }
    if (key.indexOf("mtm") > -1) {
      option["aggFunc"] = "sum"
      option["cellStyle"] = (params) => ({ color: params.value >= 0 ? "green" : "red" })
      option['hide'] = false
      option['filter']=false
    }
    if (defaultGroupingByGroup.indexOf(key) > -1) {
      option["rowGroupIndex"] = defaultGroupingByGroup.indexOf(key)
      option["rowGroup"] = true
      option["hide"] = true     
    }

    if(key == 'uniqueKey') option['filter']=false
    return option
  }, [])

  const { gridProps, onReady } = useGridSettings({
    gridApi: gridRef,
    componentInfo:componentInfo,
    onReload: fetchApiData,
    colDef: { generateColDef, row: GroupedPositionData[0] },
    // groupBy: ["basecurrency"],
    settings: {
      sideBar: true
    }
  })


  useEffect(() => {
    if (!GroupedPositionData?.length) return
    onReady()
  }, [GroupedPositionData])

  const getRowId = useCallback((params) => {
    return params.data.uniqueKey;
  });

  

  const filterPositive = (node) => {
    {
      if (node.data.ttmtm >= 0) {
        return true;
      }
      return false;
    }
  };
  const filterNegative = (node) => {
    {
      if (node.data.ttmtm < 0) {
        return true;
      }
      return false;
    }
  };

  const numberformatter = Intl.NumberFormat("en-US", {
    // style: "currency",
    // currency: "INR",
    maximumFractionDigits: 0,
  });
  const numberformatterforPercent = Intl.NumberFormat("en-US", {
    // style: "currency",
    // currency: "INR",
    maximumFractionDigits: 2,
  });

  let myValueFormatter = (p) => numberformatter.format(p.value);
  let myValueFormatterforPercent = (p) =>
    numberformatterforPercent.format(p.value);

  // const columnDef = useMemo(() => {
  //   let column = [
  //     ...defaultGroupingByGroup.map((key) => {
  //       return {
  //         field: key,
  //         rowGroup: true,
  //         hide: true,
  //         filter: true,
  //         rowGroupIndex: defaultGroupingByGroup.indexOf(key),
  //       };
  //     }),
  //   ];
  //   column = [
  //     ...column,
  //     {
  //       headerName: "BF MTM",
  //       field: "bfmtm",
  //       sortable: true,
  //       filter: false,
  //       valueFormatter: myValueFormatter,
  //       aggFunc: "sum",
  //       cellStyle: (params) => {
  //         if (params.value >= 0) {
  //           return { color: "green" };
  //         } else {
  //           return { color: "red" };
  //         }
  //       },
  //     },
  //     {
  //       headerName: "TD MTM",
  //       field: "tdmtm",
  //       sortable: true,
  //       filter: false,
  //       valueFormatter: myValueFormatter,
  //       aggFunc: "sum",
  //       cellStyle: (params) => {
  //         if (params.value >= 0) {
  //           return { color: "green" };
  //         } else {
  //           return { color: "red" };
  //         }
  //       },
  //     },
  //     {
  //       headerName: "TT MTM",
  //       field: "ttmtm",
  //       sortable: true,
  //       filter: false,
  //       valueFormatter: myValueFormatter,
  //       aggFunc: "sum",
  //       cellStyle: (params) => {
  //         if (params.value >= 0) {
  //           return { color: "green" };
  //         } else {
  //           return { color: "red" };
  //         }
  //       },
  //     },
  //     {
  //       headerName: "% of TT MTM",
  //       field: "percentchange",
  //       sortable: true,
  //       filter: false,
  //       aggFunc: "avg",
  //       valueFormatter: myValueFormatter,
  //       cellStyle: (params) => {
  //         if (params.value >= 0) {
  //           return { color: "green" };
  //         } else {
  //           return { color: "red" };
  //         }
  //       },
  //     },
  //   ];

  //   return column;
  // }, [positionData]);

  // const GroupedColumnDef = useMemo(() => {
  //   let columns = [];
  //   if (GroupedPositionData.length < 1) return;
  //   for (let key in GroupedPositionData[0]) {
  //     const options = {
  //       field: key,
  //       headerName: key.toUpperCase(),
  //       sortable: true,
  //       filter: true,
  //       valueFormatter: formatValue
  //     }

  //     if (key.indexOf("mtm") > -1) {
  //       options["aggFunc"] = "sum"
  //       options["cellStyle"] = (params) => ({ color: params.value >= 0 ? "green" : "red" })
  //     } else if (defaultGroupingByGroup.indexOf(key) > -1) {
  //       options["rowGroupIndex"] = defaultGroupingByGroup.indexOf(key)
  //       options["rowGroup"] = true
  //       options["hide"] = true
  //     } else if (key == "uniqueKey") {
  //       options["hide"] = true
  //     } else if (key.indexOf("percent") > -1) {
  //       options["filter"] = false
  //       options["valueFormatter"] = myValueFormatterforPercent
  //       options["cellRenderer"] = "agGroupCellRenderer"
  //       options["cellStyle"] = (params) => ({ color: params.value >= 0 ? "green" : "red" })
  //     } else if (key.indexOf('clustername') > -1) {
  //       options['filter'] = true
  //       options["sortable"] = false
  //       options["hide"] = true
  //     } else {
  //       options["filter"] = false
  //       options["sortable"] = false
  //     }

  //     columns.push(options)
  //   }
  //   return columns;
  // }, [GroupedPositionData]);

  // const sideBar = useMemo(() => {
  //   return {
  //     toolPanels: ["filters"],
  //   };
  // }, []);

  const defaultTotalRow = { bfmtm: 0, tdmtm: 0, ttmtm: 0, percentchange: 0 }


  const calculateTotal = () => {
    const totalRow = { ...defaultTotalRow }
    gridRef.current.api.forEachNodeAfterFilterAndSort(({ data }) => {
      if (data) {
        Object.keys(defaultTotalRow).forEach(k => totalRow[k] += data[k])
      }
    })
    gridRef.current.api.setPinnedBottomRowData([totalRow])
  }

  return (
    <>
      <AgGridReact
        {...gridProps}
        onGridReady={calculateTotal}
        onModelUpdated={calculateTotal}
        pinnedBottomRowData={[defaultTotalRow]}
        // className="ag-theme-alpine"
       
        ref={gridRef}
        getRowId={getRowId}
        rowData={GroupedPositionData}
        // columnDefs={GroupedColumnDef}
        // asyncTransactionWaitMillis={500}
        // pagination={true}
        // paginationPageSize={50}
        animateRows={false}
        rowSelection={"multiple"}
        suppressAggFuncInHeader={true}
        // defaultColDef={defaultColDef}
        isExternalFilterPresent={() => true}
        debounceVerticalScrollbar={true}
        doesExternalFilterPass={(node) =>
          PNL === "profit" ? filterPositive(node) : filterNegative(node)
        }
        onFilterChanged={calculateTotal}
        // sideBar={sideBar}
      />
      {/* <AgGridReact
        className="ag-theme-alpine"
        noRowsOverlayComponent={loadingOverlayComponent}
        loadingOverlayComponentParams={loadingOverlayComponentParams}
        getRowId={getRowId}
        ref={gridRef}
        columnDefs={columnDef}
        rowData={positionData}
        asyncTransactionWaitMillis={500}
        pagination={true}
        paginationPageSize={50}
        animateRows={false}
        rowSelection={"multiple"}
        autoGroupColumnDef={autoGroupColumnDef}
        groupIncludeTotalFooter={true}
        // maintainColumnOrder={true}
        groupDisplayType={"singleColumn"}
        // sideBar={{ toolPanels: ["filters"] }}
        // showOpenedGroup={true}
        suppressAggFuncInHeader={true}
        getRowStyle={getRowStyle}
        defaultColDef={defaultColDef}
        onFilterChanged={() => {
          // console.log(gridRef.current.api.getFilterModel());
        }}
        isExternalFilterPresent={() => true}
        doesExternalFilterPass={(node) =>
          PNL === "profit" ? filterPositive(node) : filterNegative(node)
        }
      /> */}
    </>
  );
}

export default React.memo(ProfitLossGrid);
