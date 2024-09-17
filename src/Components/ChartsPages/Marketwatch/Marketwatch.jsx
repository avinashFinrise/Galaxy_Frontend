import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import { AutoComplete, Form, Select } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AiFillDelete } from 'react-icons/ai';
import { shallowEqual, useSelector } from 'react-redux';
import { CREATE_MARKETWATCH_API, GET_EXCHANGE_API, GET_MARKETWATCH_API, GET_STRATEGYTOKEN_API } from '../../../API/ApiServices';
import { debounce } from "../../../UtilityFunctions/debounce";
import { redGreenColBasedOnPrev } from '../../../UtilityFunctions/grid';
import useGridSettings from '../../CustomHook/useGridSettings';
import { Notification } from '../../DynamicComp/Notification';
import wStyle from "./MarketWatch.module.scss";

const componentInfo = { componentname: "marketwatch", componenttype: "table" }
let fields = { ltp: 0, ltq: 0, bidqty: 0, bid: 0, ask: 0, askqty: 0 }
const colToRedGreen = ['ltp', "ltq", 'bidqty', 'bid', 'ask', 'askqty',]



function Marketwatch() {
  const [marketData, setMarketData] = useState([])
  const [marketOptions, setMarketOptions] = useState({
    exchanges: [],
    symbols: []
  });
  const [addMarketWatch, setAddMarketWatch] = useState({ exchange: '', symbol: '' })


  const gridRef = useRef();
  const ws = useSelector((state) => state?.websocket, shallowEqual);
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

  const CloseError = useCallback(() => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  }, [])
  const CloseSuccess = useCallback(() => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  }, [])


  const onGridReady = () => {
    setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Loading Market Watch' })
    const data = new Promise((resolve, reject) => {
      resolve(GET_MARKETWATCH_API())
    })
    data.then(res => {
      console.log("res", res)
      setNotifyData({ ...NotifyData, loadingFlag: false })
      setMarketData(res.data.result.map(val => {
        return { ...val.details, ...fields, action: '', id: val.id }
      }))
      res.data.result.forEach(e => {
        ws.connection.send(
          JSON.stringify({
            event: "subscribe",
            stream: "ticker",
            token: [e.token],
          })
        );
      })
    }).catch(err => {
      setNotifyData({
        ...NotifyData,
        errorMsg: err.response?.data.reason || "Failed to fetch market watch",
        errorFlag: true, loadingFlag: false
      })
      console.log(err)
    })
  }





  useEffect(() => {
    onGridReady();
    const getExchangeList = async () => {
      const exchangeList = await GET_EXCHANGE_API();
      if (exchangeList) {
        setMarketOptions(prev => ({
          ...prev,
          exchanges: exchangeList.data.result.map((val) => {
            return { value: val.exchange, label: val.exchange };
          })
        })
        );
      }
    };
    getExchangeList();
  }, [])

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());



  useEffect(() => {

    if (!ws.status) return;
    let eventListener;

    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event == 'ticker') {

        const rowNode = gridRef.current.api.getRowNode(newData.data.data.token.toString())?.data;
        if (rowNode) {
          gridRef.current.api.applyTransactionAsync({
            update: [{
              ...rowNode,
              ltp: Number(newData.data.data.ltp.toFixed(3)),
              ltq: newData.data.data.ltq,
              bid: Number(newData.data.data.bid.toFixed(3)),
              ask: Number(newData.data.data.ask.toFixed(3)),
              bidqty: newData.data.data.bidqty,
              askqty: newData.data.data.askqty,
              prev: { ltp: rowNode.ltp, ltq: rowNode.ltq, bid: rowNode.bid, ask: rowNode.ask, bidqty: rowNode.bidqty, askqty: rowNode.askqty }
            }]
          })
        }
      }
    };
    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  const deleteToken = async () => {
    const selectedDataForDashboard = gridRef?.current?.api.getSelectedNodes();
    console.log(selectedDataForDashboard[0].data)
    gridRef.current.api.applyTransactionAsync({ remove: [selectedDataForDashboard[0].data] })

    const id = selectedDataForDashboard[0].data.id;
    let dataToSend = {
      event: "delete",
      data: {
        id: id,
      },
    };

    const deleteMarketWatch = await CREATE_MARKETWATCH_API(dataToSend);
    if (deleteMarketWatch.status == 200) {
      // setMarketData((previous) => previous.filter((val) => val.id !== id));
    }
  };

  const actionButton = (p) => (
    <>
      <AiFillDelete onClick={deleteToken} />
    </>
  );

  const searchToken = async (data) => {
    if (data.symbol.length <= 0) return;
    const getToken = await GET_STRATEGYTOKEN_API(data);
    if (getToken.status === 200) {

      setMarketOptions((previous) => ({
        ...previous,
        symbols: getToken?.data?.result?.map((val) => {
          return {
            ...val,
            value: val.ticker_code,
          };
        }),
      }));
    }
  };

  const handleTokenSearch = useCallback(debounce(searchToken), []);

  const generateColDef = useCallback((key) => {
    const option = { headerName: key?.toUpperCase(), field: key, sortable: true, editable: false, filter: true, hide: true }
    if (colToRedGreen.includes(key)) {
      option['cellStyle'] = redGreenColBasedOnPrev;
      option['hide'] = false
    }
    if (['ticker_code', 'token'].indexOf(key) > -1) {
      option['hide'] = false
    }

    if (key == 'action') {
      option['hide'] = false
      option['filter'] = false
      option['cellRenderer'] = actionButton
    }
    return option
  }, [])


  const { gridProps, onReady } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    onReload: onGridReady,
    colDef: { generateColDef, row: marketData[0] },
    // groupBy: ["user", "basecurrency", "symbol", "expirydate", "sender", "userid", "exchange", "securitytype", "opttype", "groupname", "clustername", "strikeprice"],
    settings: {
      sideBar: true
    }
  })


  useEffect(() => {
    if (!marketData?.length) return
    onReady()
  }, [marketData])

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const saveMarketWatch = () => {
    const datatoSend = { event: "create", data: { token: addMarketWatch.symbol.token, details: addMarketWatch.symbol } }
    const saveData = new Promise((resolve, reject) => {
      resolve(CREATE_MARKETWATCH_API(datatoSend))
    })
    saveData.then(res => {
      setAddMarketWatch({ exchange: '', symbol: '' })
      console.log(res.data.result.details)
      gridRef.current.api.applyTransactionAsync({ add: [{ ...res.data.result.details, ...fields, action: '', id: res.data.result.id }] })
      // setMarketData(prev => [...prev, { ...res.data.result.details, ...fields, action: '', id: res.data.result.id }])
      ws.connection.send(
        JSON.stringify({
          event: "subscribe",
          stream: "ticker",
          token: [res.data.result.details.token],
        })
      );

      console.log('send');
    }).catch(err => {
      console.log(err);
    })
  }

  return (
    <>
      <div className={`${wStyle.marketWatchSection} market-watch-section`}>
        <Form
          labelCol={{ span: 5 }}
          layout="horizontal"

          onValuesChange={onFormLayoutChange}


        >
          <Form.Item
            // label="Exchange"
            className={`antFormItem ${wStyle.antFormItem}`}
          >
            <Select
              // style={{ width: 200 }}
              required
              showSearch
              value={addMarketWatch.exchange || undefined}
              placeholder={'Select Exchange'}
              optionFilterProp="children"
              onChange={(value) => {
                setAddMarketWatch((previous) => ({
                  ...previous,
                  exchange: value
                }));
                setMarketOptions(p => ({ ...p, symbols: [] }))
              }}
              filterOption={filterOption}
              options={marketOptions.exchanges}
              className={`me-1 ${wStyle.antSelect}`}
            />

            <AutoComplete
              filterSort={false}
              allowClear
              notFoundContent="Symbol Does Not Exist"
              defaultActiveFirstOption
              disabled={addMarketWatch.exchange ? false : true}
              // style={{
              //   width: 350,
              // }}
              value={addMarketWatch.symbol}
              onSearch={(value) => handleTokenSearch({
                exchange: addMarketWatch.exchange,
                symbol: value,
              })}
              // onSearch={(value) => {
              //   searchToken({
              //     exchange: addMarketWatch.exchange,
              //     symbol: value,
              //   })
              // }
              // }

              onChange={e => setAddMarketWatch(prev => ({ ...prev, symbol: e?.toUpperCase() }))}

              onSelect={(value, options) => {
                const selectedToken = marketOptions?.symbols.find(e => e.value == value)
                setAddMarketWatch(prev => ({ ...prev, symbol: selectedToken }))
              }}
              options={marketOptions.symbols}
              placeholder="Enter Symbol"
              // filterOption={(inputValue, option) =>
              //   option.value?.toUpperCase().indexOf(inputValue?.toUpperCase()) !==
              //   -1
              // }
              className={wStyle.long}
            />
          </Form.Item>
          <button onClick={saveMarketWatch} className={wStyle.btn}>
            Add
          </button>
        </Form>
      </div>
      <div style={{ height: "96%", marginTop: '0.3rem' }}>

        <AgGridReact
          {...gridProps}
          ref={gridRef}
          rowData={marketData}
          onGridReady={onGridReady}
          // columnDefs={columnCreation}
          getRowId={p => p.data.token}
          pagination={false}
          rowSelection='single'
          filterParams={{ apply: true, newRowsAction: 'keep' }}
        />
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </>
  )
}

export default Marketwatch