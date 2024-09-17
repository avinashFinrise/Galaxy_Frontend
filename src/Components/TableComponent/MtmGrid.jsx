import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
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

const calcTotalWorker = new Worker('/workers/getTotal.js');

function getTotal(gridApi, colDef) {
  if (!colDef) return
  const gridRows = [];

  gridApi.current?.api?.forEachNodeAfterFilterAndSort((n) => n.data && gridRows.push(n.data));
  calcTotalWorker.postMessage({ gridRows })

}

const groupedData = (data) => {
  const grouped = data.reduce(
    (result, current) => {
      const matchingKey = `${current.clustername}_${current.groupname}_${current.userid}_${current.exchange}_${current.symbol}`;
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
          basecurrency: current.basecurrency,
          uniqueKey: `${current.clustername}_${current.groupname}_${current.userid}_${current.exchange}_${current.symbol}`,
        };
      }
      return result;
    },
    {}
  );
  return grouped;
}

const filterMtmBasedOnUsdOrArb = (data, currency) => {
  // let filteredData = []
  // console.log({ currency });
  if (currency == 'usd') {
    return data.filter(val => val.basecurrency == 'USD')
  } else {
    return data.map(val => {
      // console.log(val.basecurrency);
      return val.basecurrency == 'USD' ? { ...val, netmtm: val.netmtm * val.usdrate, grossmtm: val.grossmtm * val.usdrate, charges: val.charges * val.usdrate } : val
    })
  }
}

function MtmGrid({
  view,
  defaultGroupingBySymbol,
  dateRange,
  basecurrency,
  bftd
}) {



  const pinneRowTotal = useRef({ netmtm: 0, grossmtm: 0, charges: 0 })
  // const PositionChartDataa = useSelector(state => state?.positionChart);


  const [positionLive, setPositionLive] = useState([])
  const [mtmData, setMtmData] = useState([]);
  // const [filterSetting, setFilterSetting] = useState({});
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const gridRef = useRef();
  const positionType = bftd

  // const update = useCallback((newData) => {

  //   if (newData.isUpdate) gridRef.current.api.applyTransactionAsync({ update: [newData.data] });
  //   else gridRef.current.api.applyTransactionAsync({ add: [newData.data] });
  // }, [gridRef])

  // const [positionData] = useGetMtm(update, gridRef)




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

  // let componentName = `mtm_${positionType}_${view}`;
  const componentInfoRef = useRef({ componentname: `mtm_${basecurrency}_${positionType}_${view}`, componenttype: "table" })

  const fetchApiData = async () => {
    let livePositionGrouped = {};

    try {
      setNotifyData({
        loadingFlag: true,
        loadingMsg: "Loading Netposition Live...",
      });
      const positionApi = await GET_NETPOSITION_API({
        event: "getnetposition",
        // data: table === "mtm" ? dateRange : {},
        // data: dateRange,
      });
      setPositionLive(positionApi?.data?.result)
      let ArbPosition = filterMtmBasedOnUsdOrArb(positionApi.data.result, basecurrency)
      livePositionGrouped = groupedData(ArbPosition)

      setNotifyData({ ...NotifyData, loadingFlag: false });
      if (positionApi.data.result.length < 1) setNotifyData({ loadingFlag: false, errorFlag: true, errorMsg: "Netposition Live is Empty", });
      if (positionType === "td") setMtmData(Object.values(livePositionGrouped));
    } catch (error) {
      setNotifyData({ ...NotifyData, loadingFlag: false, errorFlag: true, errorMsg: error?.data?.response })
    }

    // if (positionData.length > -1) {

    //   let ArbPosition = filterMtmBasedOnUsdOrArb(positionData)
    //   livePositionGrouped=groupedData(ArbPosition)
    // }

    // if (positionType === "td") setMtmData(Object.values(livePositionGrouped))


    try {
      if (positionType == "bf" || positionType == "") {
        setNotifyData({ loadingFlag: true, loadingMsg: "Loading NetpositionRec...", });

        const historical = await GET_MTMHISTORY_API({
          event: "getmtmhistory",
          data: {
            fromdate: dateRange.fromdate,
            todate: dateRange.todate,
            type: "all",
            basecurrency: basecurrency,
            groupby: ['groupname', 'userid', 'clustername', 'exchange', 'symbol']
          },
        });

        if (historical.status == 200) {
          setNotifyData({ ...NotifyData, loadingFlag: false });

          let historicalData = historical.data.result.map((val) => {
            return {
              // ...val,
              uniqueKey: `${val.clustername}_${val.groupname}_${val.userid}_${val.exchange}_${val.symbol}`,
              netmtm: val.bfmtm,
              grossmtm: val.GrossMTM,
              charges: val.Charges,
              groupname: val.groupname,
              clustername: val.clustername,
              exchange: val.exchange,
              symbol: val.symbol,
              userid: val.userid
            };
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
            setMtmData(historicalData);
          }
          if (positionType == "") {
            let mtm = {}
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

            setMtmData(Object.values(mtm));
          }
        }
      }
    } catch (error) {
      console.log(error);
      setNotifyData({ ...NotifyData, loadingFlag: false, errorFlag: true, errorMsg: error?.response?.data?.reason })
    }


  }

  const { componentSetting: filterSetting, gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo: componentInfoRef.current,
    onReload: fetchApiData,
    colDef: { generateColDef, row: mtmData[0] },
    // groupBy: defaultGroupingBySymbol,
    settings: {
      sideBar: true
    }
  })

  useEffect(() => {
    setNotifyData(GridNotifyData)
  }, [GridNotifyData])

  useEffect(() => {
    fetchApiData()


  }, [dateRange]);

  // const update = useCallback((newData) => {
  //   console.log({ newData })
  //   if (newData.isUpdate) gridRef.current.api.applyTransactionAsync({ update: [newData.data] });
  //   else gridRef.current.api.applyTransactionAsync({ add: [newData.data], });
  // }, [gridRef])

  // const [positionData] = useGetMtm(update, gridRef)

  // console.log({positionData});


  //===================================23/12/2023 commented===============================================



  useEffect(() => {
    if (!ws.status) return;
    if (positionType === "bf") return;

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


        // if (formattedData.basecurrency !== basecurrency) return
        if (basecurrency == 'usd') {
          const usdNode = formattedData.basecurrency == "USD" && formattedData
          // console.log({ usdNode });

          if (usdNode) {
            if (rowNode) {
              gridRef.current.api.applyTransactionAsync({
                update: [usdNode],
              });

            } else {
              gridRef.current.api.applyTransactionAsync({
                add: [usdNode],
              });
            }
          }
        } else {
          const newNode =
            formattedData.basecurrency === "USD"
              ? {
                ...formattedData.data,
                netmtm: formattedData.netmtm * formattedData.usdrate,
              }
              : formattedData;

          if (rowNode) {
            gridRef.current.api.applyTransactionAsync({
              update: [newNode],
            });
          } else {
            gridRef.current.api.applyTransactionAsync({
              add: [newNode],
            });
          }
        }


      }

      if (newData.event === "ticker") {

        // setPositionLive(previous => {
        //   previous.map(val => {
        //     return val.token==newData.data.token ? {...val,grossmtm:val.cfamt+val.cfqty*newData.data.data.ltp*val.multiplier}:val
        //   })
        // })
        // console.log("positionLive", positionLive);

        gridRef.current.api.forEachNode((rowNode) => {
          if (rowNode.data) {
            if (rowNode.data.token === newData.data.token) {
              let node = {
                ...rowNode.data,
                grossmtm:
                  rowNode.data.cfamt +
                  rowNode.data.cfqty *
                  newData.data.data.ltp *
                  rowNode.data.multiplier,
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
  }, [ws]);
  //=====================================================end====================================================

  const getRowId = useCallback((params) => {
    return params.data.uniqueKey;
  });

  const autoGroupColumnDef = useMemo(() => {
    return {
      minWidth: 300,
      pinned: "left",
    };
  }, []);



  function generateColDef(key) {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, hide: true, filter: false }
    if (defaultGroupingBySymbol.indexOf(key) > -1) {
      option['rowGroup'] = true
      option['hide'] = true
      option['filter'] = true
      option['rowGroupIndex'] = defaultGroupingBySymbol.indexOf(key)
    }
    if (["GROSSMTM", "NETMTM", "CHARGES", "NETMTM_SUM", "GROSSMTM"].indexOf(key.toUpperCase()) > -1) {
      option['cellStyle'] = redGreenRowText
      option["valueFormatter"] = formatValue
      option['aggFunc'] = "sum"
      option['hide'] = false
    }
    if (key === "arbmtm") {
      option['hide'] = table == "position" ? true : mtm === "usd" || mtm === "" ? true : false
      option["valueFormatter"] = formatValue
      option['cellStyle'] = (params) => {
        if (params.value >= 0) {
          return { color: "green" };
        } else {
          return { color: "red" };
        }
      }
    }
    if (["segment", "clustername", "basecurrency", "uniqueKey"].indexOf(key) > -1) {
      option['hide'] = true
      option['filter'] = true
    }

    return option
  }


  useEffect(() => {
    if (!mtmData?.length) return
    onReady()
  }, [mtmData])



  const setTotal = (columns) => getTotal(gridRef, columns)


  calcTotalWorker.onmessage = ({ data }) => {
    const pinnedRowNode = gridRef.current?.api?.getPinnedBottomRow(0);
    const res = { ...pinnedRowNode.data, ...data }
    // pinnedRowNode?.setData(res);

    gridRef.current.api.setPinnedBottomRowData([res]);
    pinneRowTotal.current = res
    // setPinnedRowTotal(data)
  }


  return (
    <>
      <AgGridReact
        {...gridProps}
        // className="ag-theme-alpine"
        getRowId={getRowId}
        ref={gridRef}
        // columnDefs={columnCreation}
        rowData={mtmData}
        // asyncTransactionWaitMillis={500}
        // pagination={true}
        // paginationPageSize={50}
        animateRows={false}
        rowSelection={"multiple"}
        autoGroupColumnDef={autoGroupColumnDef}
        // groupIncludeFooter={true}
        // maintainColumnOrder={true
        groupDisplayType={"singleColumn"}
        onGridReady={setTotal}
        onModelUpdated={setTotal}
        // sideBar={sideBar}
        suppressAggFuncInHeader={true}
        // defaultColDef={defaultColDef}
        // pinnedBottomRowData={[{ uniqueKey: "Total", netmtm: 0, grossmtm: 0, charges: 0 }]}
        pinnedBottomRowData={[pinneRowTotal.current]}



        onRowGroupOpened={() => {
          if (basecurrency !== "arb") return;
          gridRef.current.api.forEachNode((node) => {
            if (node.level == 1) {
              gridRef.current.api.setRowNodeExpanded(node, false, false);
            }
          });
        }}
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

export default React.memo(MtmGrid);
