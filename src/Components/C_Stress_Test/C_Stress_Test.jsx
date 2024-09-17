import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import { Input } from "antd";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { GET_NETPOSITION_API } from '../../API/ApiServices';
import { formatValue, redGreenRowText } from '../../UtilityFunctions/grid';
import useGridSettings from '../CustomHook/useGridSettings';
import { Notification } from '../DynamicComp/Notification';
import coverStyle from './C_Stress_Test.module.scss';

const componentInfo = { componentname: 'c_mtm_future_estimation', componenttype: 'table' }

const calcTotalWorker = new Worker('/workers/getTotal.js');

function getTotal(gridApi, colDef) {
  if (!colDef) return
  const gridRows = [];

  gridApi.current?.api?.forEachNodeAfterFilterAndSort((n) => gridRows.push(n.data));
  calcTotalWorker.postMessage({ gridRows })

}

// let pinnedRowBody = { symbol: "Total", bfmtm: 0, combfmtm: 0, tdmtm: 0, comtdmtm: 0, ttlmtm: 0, comttlmtm: 0 }
function C_Stress_Test() {
  const [pinnedRowBody, setPinnedRowBody] = useState({ symbol: "Total", com_cfqty: 0, comtdmtm: 0 })
  const [mtmData, setMtmData] = useState([])
  const [basecurrency, setBaseCurrency] = useState('USD')
  const gridRef = useRef()
  const positionData = useSelector(state => state?.positionChart)
  const [stresses, setStresses] = useState([])
  const [coldefs, setColDefs] = useState({ symbol: "", com_cfqty: 0, comtdmtm: 0, })


  // const update = useCallback((newData) => {
  //   console.log({ newData });
  //   if (newData.isUpdate) gridRef.current.api.applyTransactionAsync({ update: [newData.data] });
  //   else gridRef.current.api.applyTransactionAsync({ add: [newData.data], });
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

  const setTotal = (columns) => getTotal(gridRef, columns)


  calcTotalWorker.onmessage = ({ data }) => setPinnedRowBody(data)

  const fetchApiData = () => {
    const liveApi = new Promise((resolve, reject) => {
      setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Loading Netposition' })
      resolve(GET_NETPOSITION_API({ event: "getnetposition" }));
    })
    liveApi.then(res => {
      setNotifyData({ ...NotifyData, loadingFlag: false })
      let positionData = res?.data?.result

      if (positionData.length > 0) {
        let symbols = {}
        positionData.forEach(e => {
          if (e.basecurrency === basecurrency) {
            if (!symbols[e.symbol]) {
              symbols[e.symbol] = { symbol: e.symbol, com_cfqty: 0, comtdmtm: 0, }
              stresses.forEach(no => symbols[e.symbol][`mtm_${no}`] = 0)
            }

            symbols[e.symbol].com_cfqty += e.cfqty * (e.comsharingrate / 100) * -1;
            symbols[e.symbol].comtdmtm += e.netmtm * (e.comsharingrate / 100) * -1;

            stresses.forEach(no => {
              const decimal = no / 100
              symbols[e.symbol][`mtm_${no}`] += (((e.ltp * e.multiplier * e.cfqty) * decimal) * (e.comsharingrate / 100)) * -1;
            })
          }
        })


        setMtmData(Object.values(symbols))
        onReady();
      }
    }).catch(error => {
      setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: `Netposition ${error?.response?.data?.reason}` })
    })
  }

  useEffect(() => {
    fetchApiData()
    // onReady()
  }, [basecurrency])


  useEffect(() => {

    if (positionData.length > 0) {
      let symbols = {}

      positionData.forEach(e => {
        if (e.basecurrency === basecurrency) {
          if (!symbols[e.symbol]) {
            symbols[e.symbol] = { symbol: e.symbol, com_cfqty: 0, comtdmtm: 0, }
            stresses.forEach(no => symbols[e.symbol][`mtm_${no}`] = 0)
          }

          symbols[e.symbol].com_cfqty += e.cfqty * (e.comsharingrate / 100) * -1;
          symbols[e.symbol].comtdmtm += e.netmtm * (e.comsharingrate / 100) * -1;

          stresses.forEach(no => {
            const decimal = no / 100
            symbols[e.symbol][`mtm_${no}`] += (((e.ltp * e.multiplier * e.cfqty) * decimal) * (e.comsharingrate / 100)) * -1;
          })
        }
      })

      setMtmData(Object.values(symbols))
    }
  }, [positionData, stresses])




  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, editable: false, valueFormatter: formatValue, cellStyle: redGreenRowText, filter: false }
    if (key == 'symbol') option['filter'] = true

    return option
  }, [])

  const { gridProps, onReady, saveColDef, componentSetting } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    onReload: fetchApiData,
    colDef: { generateColDef, row: coldefs },
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


  const [percentage, setPercentage] = useState("")

  const addPer = () => {
    setPercentage("")
    setStresses(p => [...p, percentage])
    const id = `mtm_${percentage}`;
    const newColumnDefs = [
      ...gridRef.current.api.getColumnDefs(), generateColDef(id)
    ];
    gridRef.current.api.setColumnDefs(newColumnDefs);
    saveColDef()
  }

  useEffect(() => {
    const data = componentSetting?.table?.setting?.colDef ? JSON.parse(componentSetting?.table?.setting?.colDef) : []
    if (data.length < 1) return

    const stress = []

    data.forEach(e => {
      if (e.includes("mtm_")) {
        const d = e.split("_")[1]
        if (!isNaN(d)) stress.push(+d)
      }
    })

    setStresses(stress)
  }, [componentSetting])


  return (
    <div className={`${coverStyle.c_mtm_future_estimationSection} overall-summary-section`}>
      <div className={coverStyle.c_mtm_future_estimationHeader}>
        <Form.Select className={coverStyle.selectForm} onChange={handleCurrencyChange} value={basecurrency}>
          <option value={'INR'}>INR</option>
          <option value={'USD'}>USD</option>
        </Form.Select>
        <Input size="small" placeholder="Enter Percentage" value={percentage} onChange={(e) => setPercentage(e.target.value)} />
        <button className="add-btn" onClick={addPer} >add</button>
      </div>

      <div
        style={{ height: '95%' }}
        className={coverStyle.tableSection}
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

export default React.memo(C_Stress_Test)