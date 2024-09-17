import React, { useCallback, useEffect, useRef, useState } from 'react'
import useGridSettings from '../CustomHook/useGridSettings';
import { Form } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import { Notification } from '../DynamicComp/Notification';
import { GET_MTMHISTORY_API, GET_NETPOSITION_API } from '../../API/ApiServices';
import { shallowEqual, useSelector } from 'react-redux';
import overStyle from './OverallSummary.module.scss'
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { formatValue, redGreenRowText } from '../../UtilityFunctions/grid';

const componentInfo = { componentname: 'overallsummary', componenttype: 'table' }


const makeData = (data) => {
  let output = data.reduce((result, current) => {
    if (result[current.symbol]) {
      result[current.symbol]['tdmtm'] += current.netmtm * -1,
        result[current.symbol]['comtdmtm'] += current.netmtm * (current.comsharingrate / 100) * -1,
        result[current.symbol].cfqty += current.cfqty * -1,
        result[current.symbol].com_cfqty += current.cfqty * (current.comsharingrate / 100) * -1


    } else {
      result[current.symbol] = {
        symbol: current.symbol,
        tdmtm: current.netmtm * -1,
        comtdmtm: current.netmtm * (current.comsharingrate / 100) * -1,
        cfqty: current.cfqty * -1,
        com_cfqty: current.cfqty * (current.comsharingrate / 100) * -1
      }
    }
    return result;


  }, {})

  return Object.values(output)
}

const calcTotalWorker = new Worker('/workers/getTotal.js');

function getTotal(gridApi, colDef) {
  if (!colDef) return
  const gridRows = [];

  gridApi.current?.api?.forEachNodeAfterFilterAndSort((n) => gridRows.push(n.data));
  calcTotalWorker.postMessage({ gridRows })


}

// let pinnedRowBody = { symbol: "Total", bfmtm: 0, combfmtm: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0 }
function OverallSummary() {
  const [pinnedRowBody, setPinnedRowBody] = useState({ symbol: "Total", bfmtm: 0, combfmtm: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0 })
  const [mtmData, setMtmData] = useState([])
  const [historical, setHistorical] = useState([])
  const [chistorical, setCHistorical] = useState([])
  const [live, setLive] = useState([])
  const [basecurrency, setBaseCurrency] = useState('USD')
  const gridRef = useRef()
  const dataRef = useRef()
  const dateRange = useSelector(state => state?.dateRange, shallowEqual)
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


  calcTotalWorker.onmessage = ({ data }) => setPinnedRowBody(data)

  const fetchApiData = () => {

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

    const liveApi = new Promise((resolve, reject) => {
      setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Loading Netposition' })
      resolve(GET_NETPOSITION_API({ event: "getnetposition" }));
    })
    liveApi.then(res => {
      setNotifyData({ ...NotifyData, loadingFlag: false })

      setLive(res.data.result.filter(e => e.basecurrency == basecurrency))
    }).catch(error => {
      setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: `Netposition ${error?.response?.data?.reason}` })
    })
  }

  useEffect(() => {

    fetchApiData()
    onReady()
  }, [basecurrency, dateRange])

  useEffect(() => {
    if (historical.length > 0 || chistorical.length > 0 || positionData.length > 0) {
      if (historical.length > 0 && chistorical.length > 0 && positionData.length > 0) {
        let symbols = {}
        let bfMerged = historical.reduce((result, current) => {
          let matchedSymbol = chistorical.find(comhistory => comhistory.symbol == current.symbol)
          if (matchedSymbol) result.push({ symbol: current.symbol, bfmtm: current.bfmtm * -1, combfmtm: matchedSymbol.bfmtm * -1 })

          return result
        }, [])


        bfMerged.forEach(e => {
          if (!symbols[e.symbol]) symbols[e.symbol] = { symbol: e.symbol, cfqty: 0, com_cfqty: 0, tdmtm: 0, comtdmtm: 0, bfmtm: 0, combfmtm: 0, ttlmtm: 0, comttlmtm: 0 }
          symbols[e.symbol].bfmtm += e.bfmtm
          symbols[e.symbol].combfmtm += e.combfmtm
          symbols[e.symbol].comttlmtm += e.combfmtm
          symbols[e.symbol].ttlmtm += e.bfmtm
        })

        positionData.forEach(e => {
          if (e.basecurrency !== basecurrency) return;
          if (!symbols[e.symbol]) symbols[e.symbol] = { symbol: e.symbol, bfmtm: 0, combfmtm: 0, cfqty: 0, com_cfqty: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0, }

          symbols[e.symbol].cfqty += e.cfqty * -1;
          symbols[e.symbol].com_cfqty += e.cfqty * (e.comsharingrate / 100) * -1;
          symbols[e.symbol].tdmtm += e.netmtm * -1;
          symbols[e.symbol].comtdmtm += e.netmtm * (e.comsharingrate / 100) * -1;
          symbols[e.symbol].ttlmtm += e.netmtm * -1;
          symbols[e.symbol].comttlmtm += e.netmtm * (e.comsharingrate / 100) * -1;
        })

        // console.log({ symbols });
        setMtmData(Object.values(symbols))

        // const toupdate = { add: [], update: [] }
        // dataRef.current = []
        // Object.values(symbols).forEach(e => {
        //   dataRef.current.push(e);
        //   const rowNode = gridRef.current.api?.getRowNode(e.symbol)?.data;
        //   if (rowNode) {
        //     toupdate.update.push(e)
        //   } else toupdate.add.push(e)
        // })

        // console.log({ toupdate });

        // gridRef.current.api?.applyTransaction({
        //   add: toupdate.add,
        //   update: toupdate.update,
        // });
      }
      // if (historical.length < 1 && chistorical.length < 1 && positionData.length > 0) {
      //   console.log('call');
      //   let livData = makeData(positionData)

      //   const toupdate = { add: [], update: [] }

      //   livData.forEach(vl => {
      //     const data = { ...vl, bfmtm: 0, combfmtm: 0, ttlmtm: vl.tdmtm + 0, comttlmtm: vl.comtdmtm + 0 }

      //     const rowNode = gridRef.current.api?.getRowNode(data.symbol)?.data;

      //     if (rowNode) toupdate.update.push(data)
      //     else toupdate.add.push(data)
      //   })

      //   gridRef.current.api?.applyTransaction({ add: toupdate.add, update: toupdate.update, });
      // }
    }
  }, [historical, chistorical, positionData])




  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, editable: false, valueFormatter: formatValue, cellStyle: redGreenRowText, filter: false }
    if (key == 'symbol') option['filter'] = true

    return option
  }, [])

  const { gridProps, onReady } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    onReload: fetchApiData,
    colDef: { generateColDef, row: { symbol: 0, bfmtm: 0, combfmtm: 0, cfqty: 0, com_cfqty: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0, } },
    settings: {
      sideBar: true
    }
  })

  const handleCurrencyChange = (e) => {

    // gridRef.current.api?.setRowData([]);
    setBaseCurrency(e.target.value)
  }


  const getRowId = useCallback((params) => {
    return params.data.symbol;
  });


  return (
    <div className={`${overStyle.overallSummarySection} overall-summary-section`}>
      <div className={overStyle.overallSummaryHeader}>
        <Form.Select className={overStyle.selectForm} onChange={handleCurrencyChange} value={basecurrency}>
          <option value={'INR'}>INR</option>
          <option value={'USD'}>USD</option>
        </Form.Select>
      </div>
      {/* <div className={overStyle.overallSummaryHeader}>
        <Form.Select className={overStyle.selectForm} onChange={handleCurrencyChange} value={basecurrency}>
          <option value={'INR'}>INR</option>
          <option value={'USD'}>USD</option>
        </Form.Select>
      </div> */}

      <div
        style={{ height: '95%' }}
      >
        <AgGridReact
          {...gridProps}
          // className="ag-theme-alpine"
          getRowId={getRowId}
          ref={gridRef}
          // columnDefs={columnDefs}
          rowData={mtmData}
          asyncTransactionWaitMillis={500}
          // pagination={true}
          onModelUpdated={setTotal}
          pinnedBottomRowData={[pinnedRowBody]}
        />
      </div>
      <div>
        <Notification
          notify={NotifyData}
          CloseError={CloseError}
          CloseSuccess={CloseSuccess}
        />
      </div>
    </div>
  )
}

export default React.memo(OverallSummary)