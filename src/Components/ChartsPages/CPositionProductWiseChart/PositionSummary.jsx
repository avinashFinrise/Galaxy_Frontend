import { useCallback, useEffect, useRef, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { shallowEqual, useSelector } from 'react-redux';
import { Notification } from '../../DynamicComp/Notification';
import { formatValue } from '../../../UtilityFunctions/grid';
import posSummary from './PositionSummary.module.scss';
import { Form } from 'react-bootstrap';
import useGridSettings from '../../CustomHook/useGridSettings';

const makeData = (data, currency) => {
  let filteredData = data.filter(val => val.basecurrency == currency)
  let formattedData = filteredData.reduce((result, current) => {
    if (result[current.symbol]) {
      result[current.symbol].cfqty += current.cfqty * -1,
        result[current.symbol].com_cfqty += current.cfqty * (current.comsharingrate / 100) * -1
    } else {
      result[current.symbol] = { symbol: current.symbol, cfqty: current.cfqty * -1, com_cfqty: current.cfqty * (current.comsharingrate / 100) * -1 }

    }
    return result
  }, {})

  return Object.values(formattedData)
}

const componentInfo = { componentname: "positionsummary", componenttype: "table" }
function PositionSummary() {
  // const [positionData, setPositionData] = useState([])
  const [basecurrency, setBaseCurrency] = useState('USD')
  const dateRange = useSelector(state => state?.dateRange, shallowEqual)
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const positionData = useSelector(state => state?.positionChart)
  const gridRef = useRef()

  const [posData, setPosData] = useState([])

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


  // const fetchApiData = () => {
  //   setNotifyData({
  //     ...NotifyData,
  //     loadingFlag: true,
  //     loadingMsg: "Fetching Netposition Data"
  //   })
  //   const liveApiData = new Promise((resolve, reject) => {
  //     resolve(GET_NETPOSITION_API({ event: "getnetposition" }))
  //   })
  //   liveApiData.then(res => {
  //     setNotifyData({
  //       ...NotifyData,
  //       loadingFlag: false,

  //     })
  //     setPositionData(makeData(res.data.result, basecurrency))
  //     // console.log(makeData(res.data.result));
  //   }).catch(err => {
  //     setNotifyData({
  //       ...NotifyData,
  //       errorFlag: true,
  //       errorMsg: err?.data?.response
  //     })
  //     console.log(err);
  //   })
  // }
  // useEffect(() => {
  //   fetchApiData()


  // }, [basecurrency])

  // useEffect(() => {
  //   if (!ws.status) return;


  //   let eventListener;
  //   eventListener = (e) => {
  //     let newData = JSON.parse(e.data);
  //     if (newData.event === "netposition") {

  //       if (newData.data.basecurrency == basecurrency) {
  //         let formattedData = { symbol: newData.data.symbol, cfqty: newData.data.cfqty, com_cfqty: newData.data.cfqty * (newData.data.comsharingrate / 100) * -1 }

  //         const rowNode = gridRef.current.api.getRowNode(formattedData.symbol)?.id;

  //         if (rowNode) {
  //           gridRef.current.api.applyTransactionAsync({
  //             update: [formattedData],
  //           });
  //         } else {
  //           gridRef.current.api.applyTransactionAsync({
  //             add: [formattedData],
  //           });
  //         }
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

  let testData = useCallback(() => {
    if (positionData.length < 1) return;
    let newData = makeData(positionData, basecurrency)
    return newData
  }, [positionData])

  console.log({ testData });

  useEffect(() => {
    if (positionData.length < 1) return;
    setPosData(makeData(positionData, basecurrency))
  })


  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, editable: false, valueFormatter: formatValue }

    return option
  }, [])

  const { gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    // onReload: fetchApiData,
    colDef: { generateColDef, row: posData[0] },
    groupBy: ["basecurrency"],
    settings: {
      sideBar: true
    }
  })
  useEffect(() => {
    setNotifyData(GridNotifyData)
  }, [GridNotifyData])

  useEffect(() => {
    if (!posData?.length) return
    onReady()
  }, [posData])

  const handleCurrencyChange = (e) => {
    setBaseCurrency(e.target.value)
  }

  // const columnDefs = useMemo(() => {
  //   if (positionData.length < 1) return;
  //   // const option = { headerName: key.toUpperCase(), field: key, sortable: true, }

  //   let columns = [];
  //   for (let key in positionData[0]) {
  //     columns.push({ headerName: key.toUpperCase(), field: key, sortable: true, valueFormatter: formatValue })
  //   }

  //   return columns;
  // }, [positionData])

  // const defaultColDef = useMemo(() => {
  //   return {
  //     // editable: true,
  //     sortable: true,
  //     flex: 1,
  //     minWidth: 100,
  //     // // filter: true,
  //     resizable: true,
  //     // filter: "agTextColumnFilter",
  //     floatingFilter: false,
  //     // cellDataType: false,
  //     width: 100,
  //     editable: true,
  //     filter: "agTextColumnFilter",
  //     // menuTabs: ["filterMenuTab"],
  //   };
  // }, []);

  const getRowId = useCallback((params) => {
    return params.data.symbol;
  });

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
          rowData={posData}
        // asyncTransactionWaitMillis={500}

        //   // pagination={true}
        //   // paginationPageSize={50}
        //   animateRows={false}
        //   rowSelection={"multiple"}
        //   autoGroupColumnDef={autoGroupColumnDef}
        //   // groupIncludeFooter={true}
        //   // maintainColumnOrder={true
        //   groupDisplayType={"singleColumn"}
        //   onGridReady={setTotal}
        //   onModelUpdated={setTotal}
        //   sideBar={sideBar}
        //   suppressAggFuncInHeader={true}
        //   getRowStyle={getRowStyle}
        // defaultColDef={defaultColDef}
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

export default PositionSummary