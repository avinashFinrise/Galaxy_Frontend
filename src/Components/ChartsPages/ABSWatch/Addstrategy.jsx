import { AutoComplete, Button, Form, Input, Select } from "antd";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CREATE_STRATEGY_API,
  GET_EXCHANGE_API,
  GET_STRATEGYTOKEN_API,
  GET_STRATEGY_API,
} from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import absStyle from "./ABSWatch.module.scss";
import CustomAbsTooltip from "./CustomAbsTooltip";
import { debounce } from "../../../UtilityFunctions/debounce";

function Addstrategy() {
  const [leg, setLeg] = useState("2");
  const [segment, setSegment] = useState("NSEIFSC");
  const [selectedExchange, setSelectedExchange] = useState({
    exchange1: "NSEIFSC",
    exchange2: "",
    exchange3: "",
  });
  const [strategyData, setStrategyData] = useState({
    event: "create",
    data: {
      strategyname: "",
      strategysegment: "NSEIFSC",
      params: { tokens: [], strikeprice: [], bankcharges: 0, converterqty: 1, precision: 1 },
    },
  });
  const [exchanges, setExchanges] = useState([]);
  const [symbols, setSymbols] = useState({
    symbol1: [],
    symbol2: [],
    symbol3: [],
  });
  const [selectedSymbols, setSelectedSymbols] = useState({
    symbol1: '',
    symbol2: '',
    symbol3: '',
  })
  const [strategyList, setStrategyList] = useState([]);

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

  const gridRef = useRef();

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };

  useEffect(() => {
    getExchangeList();
  }, []);

  const getExchangeList = async () => {
    const exchangeList = await GET_EXCHANGE_API();
    if (exchangeList) {
      setExchanges(
        exchangeList.data.result.map((val) => {
          return { value: val.exchange, label: val.exchange };
        })
      );
    }
  };

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const onFormLayoutChange = ({ size }) => {
    setComponentSize(size);
  };

  const handleChange = (e) => {
    setStrategyData((previous) => ({
      ...previous,
      data: {
        ...previous.data,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const searchToken = async (value, exchange, data) => {
    if (data.symbol.length <= 0) return;
    const getToken = await GET_STRATEGYTOKEN_API(data);
    if (getToken.status === 200) {
      if (exchange === "exchange1") {
        setSymbols((previous) => ({
          ...previous,
          symbol1: getToken?.data?.result?.map((val) => {
            return {
              value: val.ticker_code,
              token: val.token,
              strikeprice: val.strikeprice,
            };
          }),
        }));
      }
      if (exchange === "exchange2") {
        setSymbols((previous) => ({
          ...previous,
          symbol2: getToken?.data?.result?.map((val) => {
            return {
              value: val.ticker_code,
              token: val.token,
              strikeprice: val.strikeprice,
            };
          }),
        }));
      }
      if (exchange === "exchange3") {
        setSymbols((previous) => ({
          ...previous,
          symbol3: getToken?.data?.result?.map((val) => {
            return {
              value: val.ticker_code,
              token: val.token,
              strikeprice: val.strikeprice,
            };
          }),
        }));
      }
    }
  };

  const createStrategy = () => {
    if (isNaN(strategyData.data.params.bankcharges)) {
      setNotifyData((data) => ({
        ...data,
        errorFlag: true,
        loadingMsg: "Please Enter a valid Number in bank Charges",
      }));
    }
    if (strategyData.data.strategyname.length > 0) {
      if (
        (leg == "2" && strategyData.data.params.tokens.length == 2) ||
        (leg == "3" && strategyData.data.params.tokens.length == 3)
      ) {
        setNotifyData((data) => ({
          ...data,
          loadingFlag: true,
          loadingMsg: "fetching create strategy data...",
        }));
        const { bankcharges, converterqty, precision, } = strategyData.data.params

        strategyData.data.params.bankcharges = +bankcharges
        strategyData.data.params.converterqty = +converterqty
        strategyData.data.params.precision = +precision

        const create = new Promise((resolve, reject) => {
          resolve(CREATE_STRATEGY_API(strategyData));
        });
        create
          .then((res) => {
            setStrategyList((previous) => [...previous, res.data.result]);
            setNotifyData({
              loadingFlag: false,
              successFlag: true,
              successMsg: res.data.status,
            });
          })
          .catch((err) => {
            console.log(err);
            setNotifyData({
              loadingFlag: false,
              errorFlag: true,
              errorMsg: err.response.data.result,
            });
          });
      } else {
        setNotifyData({
          loadingFlag: false,
          errorFlag: true,
          errorMsg: "Please Select all legs",
        });
      }
    } else {
      setNotifyData({
        loadingFlag: false,
        errorFlag: true,
        errorMsg: "Strategy name cannot be blank",
      });
    }
  };

  const deleteStrategy = () => {
    let selectedNodes = gridRef.current.api.getSelectedNodes();
    if (selectedNodes.length > 0) {
      let selectedIds = [];
      selectedNodes.forEach((val) => selectedIds.push(val.data.id));

      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "delete Strategy..",
      }));
      const deleteArb = new Promise((resolve, reject) => {
        resolve(
          CREATE_STRATEGY_API({ event: "delete", data: { id: selectedIds } })
        );
      });
      deleteArb
        .then((res) => {
          // gridRef.current.api.applyTransactionAsync({
          //   remove: selectedNodes,
          // });

          setStrategyList((previous) =>
            previous.reduce((result, current) => {
              if (!selectedIds.some((val) => val == current.id)) {
                result.push(current);
              }
              return result;
            }, [])
          );

          // setStrategyList((previous) =>
          //   previous.filter((val) => val.id !== id)
          // );
          setNotifyData({
            loadingFlag: false,
            successFlag: true,
            successMsg: res.data.status,
            confirmFlag: false,
          });
        })
        .catch((err) => {
          console.log(err);
          setNotifyData({
            loadingFlag: false,
            errorFlag: true,
            errorMsg: "error",
            confirmFlag: false,
          });
        });
    } else {
      setNotifyData({
        errorFlag: true,
        errorMsg: "Please Select Strategy To Delete",
      });
    }
  };

  const onGridReady = useCallback(() => {
    (async () => {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "loading arbwatch addstrategy ...",
      }));
      const strategy = await GET_STRATEGY_API();
      if (strategy.status === 200) {
        setStrategyList(strategy.data.result);
        setNotifyData({
          loadingFlag: false,
          // successFlag: true,
        });
      } else {
        setNotifyData({
          loadingFlag: false,
          errorFlag: true,
          errorMsg: "something went wrong arbwatch addstrategy",
        });
      }
    })();
  }, []);

  const columnDefs = useMemo(() => {
    let columns = [
      {
        field: "id",
        headerName: "ID",
        headerCheckboxSelection: true,
        checkboxSelection: true,
        showDisabledCheckboxes: true,
      },
      {
        field: "strategyname",
        headerName: "STRATEGYNAME",
        tooltipField: "strategyname",
        tooltipComponentParams: { color: "#ececec" },
      },
      // {
      //   field: "strategysegment",
      //   headerName: "SEGMENT",
      // },
      // {
      //   field: "params.tokens.0.exchange",
      //   headerName: "EXC 1",
      // },
      // {
      //   field: "params.tokens.1.exchange",
      //   headerName: "EXC 2",
      // },
      // {
      //   field: "params.tokens.2.exchange",
      //   headerName: "EXC 3",
      // },

      // {
      //   field: "params.tokens.0.ticker_code",
      //   headerName: "SYM 1",
      // },
      // {
      //   field: "params.tokens.1.ticker_code",
      //   headerName: "SYM 2",
      // },
      // {
      //   field: "params.tokens.2.ticker_code",
      //   headerName: "SYM 3",
      // },
    ];
    return columns;
  }, []);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      minWidth: 100,
      resizable: true,
      floatingFilter: true,
      width: 100,
      editable: true,
      filter: "agTextColumnFilter",
      tooltipComponent: CustomAbsTooltip,
    };
  }, []);
  const getRowId = useCallback((params) => {
    return params.data.id;
  });



  const handleTokenSearch = useCallback(debounce(searchToken), []);

  return (
    <div className={`row ${absStyle.createARBSection} create-arb-section`}>
      <div className={`col-md-6 ant-form-section ${absStyle.antFormSection}`}>
        <Form
          labelCol={{ span: 5 }}
          // wrapperCol={{ span: 16 }}
          layout="horizontal"
          // initialValues={{
          //   size: "default",
          // }}
          onValuesChange={onFormLayoutChange}
        // size={"default"}
        // style={{
        //   maxWidth: 1000,
        // }}
        // className={absStyle.antFormSection}
        >
          <h2 className={`headingContent ${absStyle.headingContent}`}>
            Create Strategy
          </h2>
          <Form.Item label="Strategy Name" className={absStyle.formItem}>
            <Input
              name={"strategyname"}
              value={strategyData.data.strategyname}
              onChange={handleChange}
              required
            />
          </Form.Item>
          <Form.Item label="Select Segment" className={absStyle.formItem}>
            <Select
              required
              name="segment"
              defaultValue={strategyData.data.strategysegment}
              onSelect={(value) => {
                setStrategyData((previous) => ({
                  ...previous,
                  data: { ...previous.data, strategysegment: value },
                }));
                setSelectedExchange((previous) => ({
                  ...previous,
                  exchange1: value,
                }));
              }}
              options={[
                { value: "NSEIFSC", label: "NSEIFSC" },
                { value: "MCX", label: "MCX" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Bank Charges"
            className={absStyle.formItem}
            style={{
              display:
                strategyData.data.strategysegment == "NSEIFSC"
                  ? "none"
                  : "block",
            }}
          >
            <Input
              name={"bankcharges"}
              type="number"
              value={strategyData.data.params.bankcharges}
              onChange={(e) => {
                console.log({ vvvv: e.target.value })
                setStrategyData((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    params: {
                      ...previous.data.params,
                      bankcharges: e.target.value,
                    },
                  },
                }));
              }}
              required
            />
          </Form.Item>
          <Form.Item
            label="Convert Qty"
            className={absStyle.formItem}
            style={{
              display:
                strategyData.data.strategysegment == "NSEIFSC"
                  ? "none"
                  : "block",
            }}
          >
            <Input
              name={"converterqty"}
              type="number"
              value={strategyData.data.params.converterqty}
              onChange={(e) => {
                setStrategyData((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    params: {
                      ...previous.data.params,
                      converterqty: e.target.value,
                    },
                  },
                }));
              }}
              required
            />
          </Form.Item>
          <Form.Item
            label="Precision"
            className={absStyle.formItem}
            style={{
              display:
                strategyData.data.strategysegment == "NSEIFSC"
                  ? "none"
                  : "block",
            }}
          >
            <Input
              name={"precision"}
              type="number"
              value={strategyData.data.params.precision}
              onChange={(e) => {
                setStrategyData((previous) => ({
                  ...previous,
                  data: {
                    ...previous.data,
                    params: {
                      ...previous.data.params,
                      precision: e.target.value,
                    },
                  },
                }));
              }}
              required
            />
          </Form.Item>
          <Form.Item label="Select Legs" className={absStyle.formItem}>
            <Select
              required
              name="legs"
              defaultValue={leg}
              onSelect={(value) => {
                setLeg(value);
              }}
              options={[
                { value: "2", label: "2" },
                { value: "3", label: "3" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Leg 1"
            className={`${absStyle.formItem} ${absStyle.parityLegSession}`}
          >
            <Select
              // style={{ width: 200 }}
              required
              showSearch
              value={strategyData.data.strategysegment}
              placeholder="Select a Exchange 1"
              optionFilterProp="children"
              onChange={(value) => {
                setSelectedExchange((previous) => ({
                  ...previous,
                  exchange1: value,
                }));
                setSymbols(p => ({ ...p, symbol1: [] }))
                setSelectedSymbols(prev => ({ ...prev, symbol1: '' }))
              }}
              filterOption={filterOption}
              options={exchanges}
              disabled
              className={`mb-2 me-1 ${absStyle.exchgContent}`}
            />

            <AutoComplete
              allowClear
              notFoundContent="Symbol Does Not Exist"
              defaultActiveFirstOption
              // disabled={selectedExchange.exchange1 ? false : true}
              // style={{
              //   width: 350,
              // }}
              value={selectedSymbols.symbol1}
              onSearch={(value) => handleTokenSearch(value, "exchange1", {
                exchange: selectedExchange.exchange1,
                symbol: value,
              })
                // searchToken("exchange1", {
                //   exchange: selectedExchange.exchange1,
                //   symbol: value,
                // })
              }
              onChange={(e) => setSelectedSymbols(prev => ({ ...prev, symbol1: e }))}
              onSelect={(value, options) => {
                let newData = { ...strategyData };
                newData.data.params.tokens[0] = options.token;
                newData.data.params.strikeprice[0] = options.strikeprice;
                setStrategyData(newData);
                setSelectedSymbols(prev => ({ ...prev, symbol1: value }))
              }}
              onClear={(e) => {
                setSelectedSymbols(prev => ({ ...prev, symbol1: '' }))
                setSymbols(prev => ({ ...prev, symbol1: [] }))
              }}
              options={symbols.symbol1}
              placeholder="Select a Symbol"
              // filterOption={(inputValue, option) =>
              //   option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
              //   -1
              // }
              className={absStyle.symbolContent}
            />
          </Form.Item>

          <Form.Item
            label="Leg 2"
            className={`${absStyle.formItem} ${absStyle.parityLegSession}`}
          >
            <Select
              // style={{ width: 200 }}
              showSearch
              placeholder="Select a Exchange 2"
              optionFilterProp="children"
              onChange={(value) => {
                setSelectedExchange((previous) => ({
                  ...previous,
                  exchange2: value,
                }));
                setSymbols(p => ({ ...p, symbol2: [] }))
                setSelectedSymbols(prev => ({ ...prev, symbol2: '' }))
              }}
              filterOption={filterOption}
              options={exchanges}
              className={`mb-2 me-1 ${absStyle.exchgContent}`}
            />

            <AutoComplete
              allowClear
              disabled={selectedExchange.exchange2 ? false : true}
              notFoundContent="Symbol Does Not Exist"
              defaultActiveFirstOption
              // style={{
              //   width: 350,
              // }}
              value={selectedSymbols.symbol2}
              onSearch={(value) => handleTokenSearch(value, "exchange2", {
                exchange: selectedExchange.exchange2,
                symbol: value,
              })}
              // onSearch={(value) =>
              //   searchToken("exchange2", {
              //     exchange: selectedExchange.exchange2,
              //     symbol: value,
              //   })
              // }
              onChange={(e) => {
                setSelectedSymbols(prev => ({ ...prev, symbol2: e }))
              }}
              onSelect={(value, options) => {
                let newData = { ...strategyData };
                newData.data.params.tokens[1] = options.token;
                newData.data.params.strikeprice[1] = options.strikeprice;
                setStrategyData(newData);
                setSelectedSymbols(prev => ({ ...prev, symbol2: value }))
              }}
              onClear={(e) => {
                setSelectedSymbols(prev => ({ ...prev, symbol2: '' }))
                setSymbols(prev => ({ ...prev, symbol2: [] }))
              }}
              options={symbols.symbol2}
              placeholder="Select a Symbol"
              // filterOption={(inputValue, option) =>
              //   option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !==
              //   -1
              // }
              className={absStyle.symbolContent}
            />
          </Form.Item>
          {leg == "3" && (
            <Form.Item
              label="Leg 3"
              className={`${absStyle.formItem} ${absStyle.parityLegSession}`}
            >
              <Select
                // style={{ width: 200 }}
                showSearch
                placeholder="Select a Exchange 3"
                optionFilterProp="children"
                onChange={(value) => {
                  setSelectedExchange((previous) => ({
                    ...previous,
                    exchange3: value,
                  }));
                  setSymbols(p => ({ ...p, symbol3: [] }))
                  setSelectedSymbols(prev => ({ ...prev, symbol3: '' }))
                }}
                filterOption={filterOption}
                options={exchanges}
                className={`mb-2 me-1 ${absStyle.exchgContent}`}
              />

              <AutoComplete
                allowClear
                disabled={selectedExchange.exchange3 ? false : true}
                notFoundContent="Symbol Does Not Exist"
                defaultActiveFirstOption
                // style={{
                //   width: 350,
                // }}
                value={selectedSymbols.symbol3}
                onSearch={(value) => handleTokenSearch(value, "exchange3", {
                  exchange: selectedExchange.exchange3,
                  symbol: value,
                })}
                // onSearch={(value) =>
                //   searchToken("exchange3", {
                //     exchange: selectedExchange.exchange3,
                //     symbol: value,
                //   })
                // }
                onChange={(e) => {
                  setSelectedSymbols(prev => ({ ...prev, symbol3: e }))
                }}
                onSelect={(value, options) => {
                  let newData = { ...strategyData };
                  newData.data.params.tokens[2] = options.token;
                  newData.data.params.strikeprice[2] = options.strikeprice;
                  setStrategyData(newData);
                  setSelectedSymbols(prev => ({ ...prev, symbol3: value }))
                }}
                onClear={(e) => {
                  setSelectedSymbols(prev => ({ ...prev, symbol3: '' }))
                  setSymbols(prev => ({ ...prev, symbol3: [] }))
                }}
                options={symbols.symbol3}
                placeholder="Select a Symbol"
                // filterOption={(inputValue, option) =>
                //   option.value
                //     .toUpperCase()
                //     .indexOf(inputValue.toUpperCase()) !== -1
                // }
                className={absStyle.symbolContent}
              />
            </Form.Item>
          )}

          <Form.Item className={absStyle.createBtn}>
            {/* <div className={absStyle.buttonContent}> */}
            <Button onClick={createStrategy}>Create</Button>
            {/* </div> */}
          </Form.Item>
        </Form>
      </div>
      <div className={`col-md-6 strategy-listSection ${absStyle.strategyList}`}>
        <div className={absStyle.headingSection}>
          <h3 className={`headingContent ${absStyle.headingContent}`}>
            Strategy list{" "}
          </h3>
          <Form.Item className={absStyle.deleteBtn}>
            {/* <div className={absStyle.buttonContent}> */}
            <Button
              // onClick={deleteStrategy}
              onClick={(e) => {
                e.preventDefault();
                setNotifyData((data) => ({
                  ...data,
                  confirmFlag: true,
                  confirmMsg: "Are you sure, You want to delete strategy ?",
                  confirmAction: (e) =>
                    deleteStrategy(e)
                }))
              }}
            >
              Delete</Button>
            {/* </div> */}
          </Form.Item>
        </div>
        <div className={absStyle.arbTable}>
          <AgGridReact
            className="ag-theme-alpine"
            ref={gridRef}
            rowData={strategyList}
            columnDefs={columnDefs}
            getRowId={getRowId}
            onGridReady={onGridReady}
            rowSelection={"multiple"}
            defaultColDef={defaultColDef}
            tooltipShowDelay={0}
            tooltipHideDelay={10000}
          />
        </div>
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
}

export default Addstrategy;
