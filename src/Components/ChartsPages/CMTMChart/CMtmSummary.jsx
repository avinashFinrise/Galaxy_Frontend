import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Notification } from '../../DynamicComp/Notification';
import { AgGridReact } from 'ag-grid-react';
import { GET_COMPONENTSETTING_API, GET_MTMHISTORY_API, POST_COMPONENTSETTING_API } from '../../../API/ApiServices';
import { shallowEqual, useSelector } from 'react-redux';
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { formatValue, redGreenRowText } from '../../../UtilityFunctions/grid';
import useGridSettings from '../../CustomHook/useGridSettings';
import { Form } from 'react-bootstrap';

// const makeData = (data, currency) => {
//   let filteredData=data.filter(val=>val.basecurrency==currency)
//   let formattedData=filteredData.reduce((result, current) => {
//       if (result[current.symbol]) {
//           result[current.symbol].cfqty += current.cfqty*-1,
//               result[current.symbol].com_cfqty+=current.cfqty*(current.comsharingrate/100)*-1
//       } else {
//           result[current.symbol] = { symbol: current.symbol, cfqty: current.cfqty*-1,com_cfqty:current.cfqty*(current.comsharingrate/100)*-1 }

//       }
//       return result
//   }, {})

//   return Object.values(formattedData)
// }

const makeData = (data) => {
  let output = data.reduce((result, current) => {
    if (result[current.symbol]) {
      result[current.symbol]['tdmtm'] += current.netmtm * -1,
        result[current.symbol]['comtdmtm'] += current.netmtm * (current.comsharingrate / 100) * -1

    } else {
      result[current.symbol] = { symbol: current.symbol, tdmtm: current.netmtm * -1, comtdmtm: current.netmtm * (current.comsharingrate / 100) * -1 }
    }
    return result;
  }, {})

  return Object.values(output)
}

// const pinnedRowBody = { symbol: "Total", bfmtm: 0, combfmtm: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0 };

const calcTotalWorker = new Worker('/workers/getTotal.js');

function getTotal(gridApi, colDef) {
  if (!colDef) return
  const gridRows = [];

  gridApi.current?.api?.forEachNodeAfterFilterAndSort((n) => gridRows.push(n.data));
  calcTotalWorker.postMessage({ gridRows })

}

let columnOrder = ["symbol", "bfmtm", "tdmtm", "ttlmtm", "combfmtm", "comtdmtm", "comttlmtm"];

const componentInfo = { componentname: "cmtmsummary", componenttype: "table" }

let pinnedRowBody = { symbol: "Total", bfmtm: 0, combfmtm: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0 }
function CMtmSummary() {
  // const [pinnedRowBody, setPinnedRowBody] = useState({ symbol: "Total", bfmtm: 0, combfmtm: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0 })
  const [mtmData, setmtmData] = useState([])
  const [basecurrency, setBaseCurrency] = useState('USD')
  const dateRange = useSelector(state => state?.dateRange, shallowEqual)
  const gridRef = useRef()
  const [historical, setHistorical] = useState([])
  const [chistorical, setCHistorical] = useState([])
  const [live, setLive] = useState([])
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const positionData = useSelector(state => state?.positionChart)

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

  const setTotal = (columns) => getTotal(gridRef, columns)

  calcTotalWorker.onmessage = ({ data }) => {
    // setPinnedRowBody(data)
    pinnedRowBody = { ...data }
    // pinnedRowNode?.setData(res);

    // gridRef.current.api.setPinnedBottomRowData([data]);
  }

  const fetchApiData = async () => {
    let params = {
      event: "getmtmhistory",
      data: {
        fromdate: dateRange.fromdate,
        todate: dateRange.todate,
        type: "all",
        basecurrency: basecurrency,
        groupby: ['symbol']
      },
    }

    const mtmHistoryApi = new Promise((resolve, reject) => {
      setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Loading Mtm History' })
      resolve(GET_MTMHISTORY_API(params));
    })
    mtmHistoryApi.then(res => {
      setNotifyData({ ...NotifyData, loadingFlag: false })
      setHistorical(res.data.result)
    }).catch(error => {
      setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: `Mtm history ${error?.response?.data?.reason}` })
    })

    const cmtmHistoryApi = new Promise((resolve, reject) => {
      setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Loading CMtm History' })
      resolve(GET_MTMHISTORY_API({ ...params, data: { ...params.data, type: 'getcompanymtm' } }));
    })
    cmtmHistoryApi.then(res => {
      setNotifyData({ ...NotifyData, loadingFlag: false })
      setCHistorical(res.data.result)
    }).catch(error => {
      setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: `Mtm history ${error?.response?.data?.reason}` })

    })


    // const liveApi = new Promise((resolve, reject) => {
    //   setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Loading Netposition' })
    //   resolve(GET_NETPOSITION_API({ event: "getnetposition" }));
    // })
    // liveApi.then(res => {
    //   setNotifyData({ ...NotifyData, loadingFlag: false })

    //   setLive(res.data.result)
    // }).catch(error => {
    //   setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: `Netposition ${error?.response?.data?.reason}` })
    // })
  }

  useEffect(() => {
    fetchApiData()


  }, [basecurrency, dateRange])

  useEffect(() => {
    if (historical.length > 0 || chistorical.length > 0 || positionData.length > 0) {
      if (historical.length > 0 && chistorical.length > 0 && positionData.length > 0) {
        const symbols = {}


        let bfMerged = historical.reduce((result, current) => {
          let matchedSymbol = chistorical.find(comhistory => comhistory.symbol == current.symbol)
          if (matchedSymbol) result.push({ symbol: current.symbol, bfmtm: current.bfmtm * -1, combfmtm: matchedSymbol.bfmtm * -1 })

          return result
        }, [])

        bfMerged.forEach(e => {
          if (!symbols[e.symbol]) symbols[e.symbol] = { symbol: e.symbol, bfmtm: 0, combfmtm: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0 }
          symbols[e.symbol].bfmtm += e.bfmtm
          symbols[e.symbol].combfmtm += e.combfmtm
          symbols[e.symbol].ttlmtm += e.bfmtm
          symbols[e.symbol].comttlmtm += e.combfmtm
        })

        positionData.forEach(e => {
          if (e.basecurrency !== basecurrency) return;
          if (!symbols[e.symbol]) symbols[e.symbol] = { symbol: e.symbol, bfmtm: 0, combfmtm: 0, cfqty: 0, com_cfqty: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0 }
          symbols[e.symbol].tdmtm += e.netmtm * -1,
            symbols[e.symbol].comtdmtm += e.netmtm * (e.comsharingrate / 100) * -1,
            symbols[e.symbol].ttlmtm += e.netmtm * -1,
            symbols[e.symbol].comttlmtm += e.netmtm * (e.comsharingrate / 100) * -1
        })

        // let livData = makeData(live)

        // let finalData = bfMerged.reduce((acc, cur) => {
        //   let matchedWithLive = livData.find(val => val.symbol == cur.symbol)
        //   if (matchedWithLive) {
        //     acc.push({ ...cur, ...matchedWithLive, ttlmtm: cur.bfmtm + matchedWithLive.tdmtm, comttlmtm: (cur.combfmtm + matchedWithLive.comtdmtm) })
        //   } else {
        //     acc.push({ ...cur, tdmtm: 0, comtdmtm: 0, ttlmtm: cur.bfmtm + 0, comttlmtm: cur.combfmtm + 0 })
        //   }

        //   return acc
        // }, [])

        setmtmData(Object.values(symbols))
        // setmtmData(finalData)
      } else if (historical.length < 1 && chistorical.length < 1 && positionData.length > 0) {

        let livData = makeData(positionData)


        setmtmData(livData.map(vl => {
          return {
            ...vl,
            bfmtm: 0, combfmtm: 0, ttlmtm: vl.tdmtm + 0, comttlmtm: vl.comtdmtm + 0
          }
        }))

      }




    }

  }, [historical, chistorical, positionData])

  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, editable: false, valueFormatter: formatValue, cellStyle: redGreenRowText, filter: false }

    if (key == 'symbol') option['filter'] = true

    return option
  }, [])

  const { gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo: componentInfo,
    onReload: fetchApiData,
    colDef: { generateColDef, row: mtmData[0] },
    // groupBy: ["basecurrency"],
    settings: {
      sideBar: true
    }
  })
  useEffect(() => {
    setNotifyData(GridNotifyData)
  }, [GridNotifyData])

  useEffect(() => {
    if (!mtmData?.length) return
    onReady()
  }, [mtmData])


  // const updateGrid = useCallback((newData) => {
  //   if (newData.data.basecurrency == basecurrency) {
  //     let formattedData = { symbol: newData.data.symbol, tdmtm: newData.data.netmtm, comtdmtm: newData.data.netmtm * (newData.data.comsharingrate / 100) * -1 }
  //     const rowNode = gridRef.current.api.getRowNode(formattedData.symbol);

  //     if (rowNode) {
  //       gridRef.current.api.applyTransactionAsync({
  //         update: [{
  //           ...rowNode.data,
  //           tdmtm: newData.data.netmtm + rowNode.data.tdmtm,
  //           comtdmtm: (newData.data.netmtm * (newData.data.comsharingrate / 100) * -1) + rowNode.data.comtdmtm,
  //           ttlmtm: rowNode.data.bfmtm + newData.data.netmtm + rowNode.data.tdmtm,
  //           comttlmtm: rowNode.data.comttlmtm + (newData.data.netmtm * (newData.data.comsharingrate / 100) * -1)
  //         }],
  //       });
  //     } else {
  //       gridRef.current.api.applyTransactionAsync({
  //         add: [{
  //           ...formattedData,
  //           bfmtm: 0,
  //           combfmtm: 0,
  //           ttlmtm: formattedData.tdmtm + 0,
  //           comttlmtm: formattedData.comtdmtm + 0
  //         }],
  //       });
  //     }
  //   }
  // }, [gridRef])



  // useEffect(() => {
  //   if (!ws.status) return;


  //   let eventListener;
  //   eventListener = (e) => {
  //     let newData = JSON.parse(e.data);

  //     if (newData.event === "netposition") {
  //       if (newData.data.basecurrency != basecurrency) return;
  //       let formattedData = { symbol: newData.data.symbol, tdmtm: newData.data.netmtm, comtdmtm: newData.data.netmtm * (newData.data.comsharingrate / 100) * -1 }

  //       const rowNode = gridRef.current.api.getRowNode(formattedData.symbol);

  //       // gridRef.current.api.forEachNode(({ data }) => {
  //       //   if (newData.data.symbol == data.symbol) {
  //       //     gridRef.current.api.applyTransactionAsync({
  //       //       update: [{...formattedData,ttlmtm:data.bfmtm+formattedData.tdmtm,comttlmtm:data.comttlmtm+formattedData.comtdmtm}],
  //       //     });
  //       //   } else {
  //       //     gridRef.current.api.applyTransactionAsync({
  //       //       add: [{...formattedData,bfmtm:0,combfmtm:0,ttlmtm:formattedData.tdmtm+0,comttlmtm:formattedData.comtdmtm+0}],
  //       //     });
  //       //   }
  //       //   // console.log({data});
  //       // })



  //       if (rowNode) {
  //         gridRef.current.api.applyTransactionAsync({
  //           update: [{
  //             ...rowNode.data,
  //             tdmtm: newData.data.netmtm + rowNode.data.tdmtm,
  //             comtdmtm: (newData.data.netmtm * (newData.data.comsharingrate / 100) * -1) + rowNode.data.comtdmtm,
  //             ttlmtm: rowNode.data.bfmtm + newData.data.netmtm + rowNode.data.tdmtm,
  //             comttlmtm: rowNode.data.comttlmtm + (newData.data.netmtm * (newData.data.comsharingrate / 100) * -1)
  //           }],
  //         });
  //       } else {
  //         gridRef.current.api.applyTransactionAsync({
  //           add: [{
  //             ...formattedData,
  //             bfmtm: 0,
  //             combfmtm: 0,
  //             ttlmtm: formattedData.tdmtm + 0,
  //             comttlmtm: formattedData.comtdmtm + 0
  //           }],
  //         });
  //       }

  //     }


  //   };
  //   ws.connection.addEventListener("message", eventListener);

  //   return () => {
  //     if (eventListener) {
  //       ws.connection.removeEventListener("message", eventListener);
  //     }
  //   };
  // }, [ws]);

  const handleCurrencyChange = (e) => {
    setBaseCurrency(e.target.value)
  }

  const columnDefs = useMemo(() => {
    if (mtmData.length < 1) return;
    // const option = { headerName: key.toUpperCase(), field: key, sortable: true, }

    let columns = [];
    for (let key in mtmData[0]) {
      let index = columnOrder.indexOf(key);
      columns.splice(index, 0, { headerName: key.toUpperCase(), field: key, sortable: true, valueFormatter: formatValue, cellStyle: redGreenRowText })
      // columns.push({ headerName: key.toUpperCase(), field: key, sortable: true, valueFormatter: formatValue, cellStyle: redGreenRowText })
    }

    return columns;
  }, [mtmData])



  const getRowId = useCallback((params) => {
    return params.data.symbol;
  });

  //----------------------- SAVE WORKSPACE ------------------------------------------------

  const [componentSetting, setComponentSetting] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfo)
        setComponentSetting(data.result)

        const setting = data.result[componentInfo.componenttype]?.setting
        // console.log({ settinggg: setting })
        if (setting) {
          setting["basecurrency"] && setBaseCurrency(setting["basecurrency"])

        }
      } catch (error) {
        console.log({ errorrrrr: error })
      }
    })()
  }, [])

  useEffect(() => {
    if (componentSetting === null) return
    const id = componentSetting[componentInfo.componenttype]?.id
    const body = {
      event: id ? "update" : "create",
      data: {
        ...componentInfo,
        setting: { basecurrency },
      },
    }
    if (id) body.data["id"] = id;

    (async () => {
      try {
        const { data } = await POST_COMPONENTSETTING_API(body)
      } catch (error) {
        console.log({ error })
      }
    })()
  }, [basecurrency])


  //----------------------- END SAVE WORKSPACE ------------------------------------------------

  return (
    <>
      <div className="select-header">

        <Form.Select onChange={handleCurrencyChange} value={basecurrency}>
          <option value={'INR'}>INR</option>
          <option value={'USD'}>USD</option>
        </Form.Select>
      </div>
      <div style={{ height: '80vh' }}>
        <AgGridReact
          {...gridProps}
          // className="ag-theme-alpine"
          getRowId={getRowId}
          ref={gridRef}
          // columnDefs={columnDefs}
          rowData={mtmData}
          asyncTransactionWaitMillis={500}

          //   // pagination={true}
          //   // paginationPageSize={50}
          //   animateRows={false}
          //   rowSelection={"multiple"}
          //   autoGroupColumnDef={autoGroupColumnDef}
          // groupIncludeFooter={true}
          // maintainColumnOrder={true
          //   groupDisplayType={"singleColumn"}
          //   onGridReady={setTotal}
          //   onModelUpdated={setTotal}
          //   sideBar={sideBar}
          //   suppressAggFuncInHeader={true}
          //   getRowStyle={getRowStyle}
          // defaultColDef={defaultColDef}
          onModelUpdated={setTotal}
          pinnedBottomRowData={[pinnedRowBody]}
        //   pinnedBottomRowData={[{ netmtm: 0, grossmtm: 0, charges: 0 }]}



        />
      </div>
      <div>
        <Notification
          notify={NotifyData}
          CloseError={CloseError}
          CloseSuccess={CloseSuccess}
        />
      </div>
    </>
  )
}

export default React.memo(CMtmSummary)