import { AgChartsReact } from "ag-charts-react";
import { memo, useEffect, useRef, useState } from "react";
import { Dropdown, Form } from "react-bootstrap";
import { IoEnter, IoExpand } from "react-icons/io5";
import { shallowEqual, useSelector } from "react-redux";
import {
  GET_COMPONENTSETTING_API,
  GET_FILTERS_API,
  GET_HISTORICAL_DATA_API,
  POST_COMPONENTSETTING_API,
} from "../../../API/ApiServices";
import { ModalPopup } from "../../DynamicComp";
import { Notification } from "../../DynamicComp/Notification";
import CardFallback from "../../Fallback/CardFallback";
import histStyle from "../HistoricalDataChart/HistoricalDataChart.module.scss";
import { typesColor } from "../HistoricalDataChart/data";
import CHistoricalDataPopup from "./CHistoricalDataPopup";


const defaultOptions = { exchange: [], groupname: [], symbol: [] }

const CHistoricalData = ({ skeletonProps }) => {
  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );
  const submitBtnRef = useRef()
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const [isLoading, setIsLoading] = useState(false)

  const [filterOptions, setFilterOptions] = useState();
  const [selectedOptions, setSelectedOptions] = useState({
    exchange: [],
    groupname: [],
    symbol: [],
  });
  const [showCHisData, setShowCHisData] = useState(false);



  const [options, setOptions] = useState({
    theme: themeSetting ? "ag-default" : "ag-default-dark",

    // title: {
    //   text: 'Internet Explorer Market Share',
    // },
    // subtitle: {
    //   text: '2009-2019 (aka "good times")',
    // },
    data: [],
    // legend: {
    //   enabled: true,
    // },
    theme: {
      palette: {
        fills: ["#008EA8", "#7E88BF", "#F2DCE0", "#8C7326"],
        strokes: ["#008EA8", "#7E88BF", "#F2DCE0", "#8C7326"],
      },

      overrides: {
        area: {
          series: {
            fillOpacity: 0.4,
            marker: {
              enabled: false,
            },
          },
        },
      },
    },

    series: [
      {
        type: "area",
        xKey: "date",
        yKey: "amt",
        yName: "amt",
        fill: "#fd8536",
        stroke: "#fd8536",
      },
    ],
  });
  const [mtmType, setMtmType] = useState("net");
  const [wise, setWise] = useState('month');
  const wiseOptions = ["week", "month", "year"];

  const [isDataLoading, setIsDataLoading] = useState(true)
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

  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      theme: themeSetting == "body" ? "ag-default" : "ag-default-dark",
    }));
  }, [themeSetting]);

  useEffect(() => {
    getHistoricalData(mtmType, typesColor[mtmType]?.color || "#fd8536");
  }, [dateRange, mtmType]);

  const cHistoricalDatashow = () => {
    showCHisData ? setShowCHisData(false) : setShowCHisData(true);
  };

  const getHistoricalData = (id, color) => {
    setIsDataLoading(true)
    // setNotifyData({
    //   ...NotifyData,
    //   loadingFlag: true,
    //   loadingMsg: 'Loading Historical data'
    // })

    const chartApi = new Promise((resolve) => {
      resolve(
        GET_HISTORICAL_DATA_API({
          event: "date_wise",
          data: {
            fromdate: dateRange.fromdate,
            todate: dateRange.todate,
            type: "company",
            mtmtype: id,
            filters: selectedOptions,
            wise: wise
          },
        })
      );
    });
    chartApi
      .then((res) => {
        // setNotifyData({
        //   ...NotifyData,
        //   loadingFlag: false,
        // })

        const groupedData = res.data.result.reduce((result, item) => {
          let { date, amt } = item;
          amt = amt * -1;
          const existingItem = result.find((group) => group.date === date);

          if (existingItem) {
            existingItem.amt += amt;
          } else {
            result.push({ date, amt });
          }
          return result;
        }, []);

        const series = options.series;
        series[0].fill = color;
        series[0].stroke = color;

        setOptions((previous) => ({
          ...previous,
          data: groupedData,
          series: series,
        }));
      })
      .catch((err) => {
        console.log(err);
        setNotifyData({
          ...NotifyData,
          loadingFlag: false,
          errorFlag: true,
          errorMsg: err.response.data.reason
        })
      }).finally(() => {
        setIsDataLoading(false)
      })
  };

  const handleCheckboxChange = async (e) => {
    let updatedExchange = [];
    let updatedSymbol = [];
    let updatedGroup = [];

    if (e.target.name == "exchange") {
      if (e.target.id === "selectAll") {
        if (selectedOptions?.exchange?.length === filterOptions?.exchange?.length) {
          updatedExchange = []
          setSelectedOptions(p => ({ ...p, exchange: [] }))
        }
        else {
          updatedExchange = filterOptions?.exchange
          setSelectedOptions(p => ({ ...p, exchange: filterOptions?.exchange }))
        }
      } else {
        updatedExchange = selectedOptions.exchange.includes(e.target.value)
          ? selectedOptions.exchange.filter(
            (exchange) => exchange !== e.target.value
          )
          : [...selectedOptions.exchange, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          exchange: updatedExchange,
        }));
      }

      const getFilters = await GET_FILTERS_API({
        event: "getselectedfilters",
        data: {
          filters: {
            exchange: updatedExchange,
          },
        },
      });
      if (getFilters) {
        // console.log(getFilters);
        setFilterOptions((previous) => ({
          ...previous,
          groupname: getFilters.data.result.groupname,
        }));
      }
    }

    if (e.target.name == "symbol") {
      if (e.target.id === "selectAll") {
        if (selectedOptions?.symbol?.length === filterOptions?.symbols?.length) {
          updatedSymbol = []
          setSelectedOptions(p => ({ ...p, symbol: [] }))
        }
        else {
          updatedSymbol = filterOptions?.symbols
          setSelectedOptions(p => ({ ...p, symbol: filterOptions?.symbols }))
        }
      } else {
        updatedSymbol = selectedOptions.symbol.includes(e.target.value)
          ? selectedOptions.symbol.filter((symbol) => symbol !== e.target.value)
          : [...selectedOptions.symbol, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          symbol: updatedSymbol,
        }));
      }
    }

    if (e.target.name == "groupname") {
      if (e.target.id === "selectAll") {
        if (selectedOptions?.groupname?.length === filterOptions?.groupname?.length) {
          updatedGroup = []
          setSelectedOptions(p => ({ ...p, groupname: [] }))
        }
        else {
          updatedGroup = filterOptions?.groupname
          setSelectedOptions(p => ({ ...p, groupname: filterOptions?.groupname }))
        }
      } else {
        updatedGroup = selectedOptions.groupname.includes(e.target.value)
          ? selectedOptions.groupname.filter((group) => group !== e.target.value)
          : [...selectedOptions.groupname, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          groupname: updatedGroup,
        }));
      }

      const getFilters = await GET_FILTERS_API({
        event: "getselectedfilters",
        data: {
          filters: {
            exchange: selectedOptions.exchange,
            groupname: updatedGroup,
          },
        },
      });
      if (getFilters) {
        // console.log(getFilters);
        setFilterOptions((previous) => ({
          ...previous,
          symbols: getFilters.data.result.symbols,
        }));
      }
    }
  };

  //-------------------react-grid-layout font size-------------
  const layout = useSelector((state) => state.layout, shallowEqual);
  const [fontSize, setFontSize] = useState(); // font size
  useEffect(() => {
    const data = layout?.lg?.filter(item => item.i === 'i');
    // console.log({ data })
    // Calculate font size based on X and Y values or any other logic
    const calculateFontSize = () => {
      const baseSize = 8.8; // your default font size
      const xFactor = 0.8; // adjust as needed
      const yFactor = 0.7; // adjust as needed
      // const calculatedSize = baseSize + data[0].h * xFactor + data[0].w * yFactor;
      const calculatedSize = baseSize + data[0]?.w * yFactor;
      // Ensure the font size is within a certain range
      const finalSize = Math.max(10, Math.min(calculatedSize, 70));
      // console.log("finalSize", finalSize);
      setFontSize(finalSize);
    };
    // Initial calculation
    calculateFontSize();
  }, [layout]);


  // useEffect(() => {
  //   const apiCall = new Promise((resolve) => {
  //     resolve(
  //       GET_FILTERS_API({
  //         event: "getselectedfilters",
  //         data: {
  //           filters: {
  //             exchange: [],
  //             groupname: [],
  //             symbol: [],
  //           },
  //         },
  //       })
  //     );
  //   });
  //   apiCall
  //     .then((res) => {
  //       setFilterOptions({ exchange: res.data.result.exchange });
  //     })
  //     .catch((err) => console.log(err));
  // }, []);

  //----------------------- SAVE WORKSPACE ------------------------------------------------

  const componentInfo = { componentname: "chistoricalData", componenttype: "graph" }
  const [componentSetting, setComponentSetting] = useState(null)


  useEffect(() => {
    (async () => {
      let currentSelectedOptions = {}
      setIsLoading(true)

      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfo)
        setComponentSetting(data.result)



        const setting = data.result[componentInfo.componenttype]?.setting
        // console.log({ settinggg: setting })

        if (setting) {
          if (setting["selectedOptions"]) {
            currentSelectedOptions = setting["selectedOptions"]
            setSelectedOptions(setting["selectedOptions"])
          }
          setting["wise"] && setWise(setting["wise"])
          setting["mtmType"] && setMtmType(setting["mtmType"])
        }


        const dbfilters = await GET_FILTERS_API({
          event: "getselectedfilters",
          data: {
            // filters: setting["selectedOptions"] ? currentSelectedOptions : { exchange: [], groupname: [], symbol: [] },
            filters: { exchange: [], groupname: [], symbol: [] },
          },
        });

        const getRes = () => {
          const data = dbfilters.data.result
          const newD = { groupname: [], symbol: [], exchange: data?.exchange }

          if (!currentSelectedOptions.exchange.length) return newD
          newD["groupname"] = data.groupname
          if (!currentSelectedOptions.groupname.length) return newD
          newD["symbols"] = data.symbols

          return newD
        }

        const res = getRes();

        console.log({ dbfilters: dbfilters.data.result, currentSelectedOptions, ressss: res })


        setFilterOptions(res)
      } catch (error) {
        console.log({ errorrrrr: error })
      }
      setIsLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (componentSetting === null) return
    const id = componentSetting[componentInfo.componenttype]?.id

    const body = {
      event: id ? "update" : "create",
      data: {
        ...componentInfo,
        setting: { selectedOptions, wise, mtmType },
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
  }, [selectedOptions, wise, mtmType])


  useEffect(() => {
    console.log({ filterOptions })
  }, [filterOptions])
  //----------------------- END SAVE WORKSPACE ------------------------------------------------


  return isDataLoading ? <CardFallback {...skeletonProps} /> : (
    <div className={histStyle.historicalDataSection}>
      <div className={histStyle.hisoptionSection} style={{ fontSize: `${fontSize}px` }}>
        <button
          className={`${histStyle.hisExpBtn} dashCardHeaderBtn`}
          onClick={cHistoricalDatashow}
          style={{ fontSize: `${fontSize}px` }}
        >
          <span className={histStyle.textBtnContent}>Expand</span>
          <span className={histStyle.btnIcon}>
            <IoExpand />
          </span>
        </button>
        <Dropdown className={`${histStyle.exchangeSelection} dashSelect`}>
          <Dropdown.Toggle
            className={`${histStyle.selectContent} selectContent`}
            id="exchange"
            style={{ fontSize: `${fontSize}px` }}
          >
            Wise
          </Dropdown.Toggle>

          <Dropdown.Menu className={histStyle.dropdownOption} style={{ fontSize: `${fontSize}px` }}>
            {wiseOptions?.map((option) => (
              <Form.Check
                name="wise"
                key={option}
                type="checkbox"
                label={option.toUpperCase()}
                id={option}
                value={option}
                checked={wise.includes(option)}
                onChange={(e) => { wise == e.target.value ? setWise('') : setWise(e.target.value) }}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown className={`${histStyle.exchangeSelection} dashSelect ${isLoading ? "loading" : !filterOptions?.exchange?.length && "disabled"}`}>
          <Dropdown.Toggle
            className={`${histStyle.selectContent} selectContent`}
            id="exchange"
            style={{ fontSize: `${fontSize}px` }}
          >
            Exchange
          </Dropdown.Toggle>

          <Dropdown.Menu className={histStyle.dropdownOption} style={{ fontSize: `${fontSize}px` }}>
            <Form.Check
              name="exchange"
              key="selectAll"
              type="checkbox"
              label="selectAll"
              id="selectAll"
              value="selectAll"
              checked={selectedOptions?.exchange?.length === filterOptions?.exchange?.length}
              onChange={handleCheckboxChange}
            />
            {filterOptions?.exchange?.map((option) => (
              <Form.Check
                name="exchange"
                key={option}
                type="checkbox"
                label={option}
                id={option}
                value={option}
                checked={selectedOptions.exchange.includes(option)}
                onChange={handleCheckboxChange}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown className={`${histStyle.groupSelection} dashSelect ${isLoading ? "loading" : !filterOptions?.groupname?.length && "disabled"}`}>
          <Dropdown.Toggle
            className={`${histStyle.selectContent} selectContent`}
            id="group"
            style={{ fontSize: `${fontSize}px` }}
          >
            Group
          </Dropdown.Toggle>

          <Dropdown.Menu className={histStyle.dropdownOption} style={{ fontSize: `${fontSize}px` }}>
            <Form.Check
              name="groupname"
              key="selectAll"
              type="checkbox"
              label="selectAll"
              id="selectAll"
              value="selectAll"
              checked={selectedOptions?.groupname?.length === filterOptions?.groupname?.length}
              onChange={handleCheckboxChange}
              className={histStyle.formCheck}
            />
            {filterOptions?.groupname?.map((option) => (
              <Form.Check
                name="groupname"
                key={option}
                type="checkbox"
                label={option}
                id={option}
                value={option}
                checked={selectedOptions.groupname.includes(option)}
                onChange={handleCheckboxChange}
                className={histStyle.formCheck}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown className={`${histStyle.symbolSelection} dashSelect ${isLoading ? "loading" : !filterOptions?.symbols?.length && "disabled"}`}>
          <Dropdown.Toggle
            className={`${histStyle.selectContent} selectContent`}
            id="symbol"
            style={{ fontSize: `${fontSize}px` }}
          >
            Symbol
          </Dropdown.Toggle>

          <Dropdown.Menu className={histStyle.dropdownOption} style={{ fontSize: `${fontSize}px` }}>
            <Form.Check
              name="symbol"
              key="selectAll"
              type="checkbox"
              label="selectAll"
              id="selectAll"
              value="selectAll"
              checked={selectedOptions?.symbol?.length === filterOptions?.symbols?.length}
              onChange={handleCheckboxChange}
            />
            {filterOptions?.symbols?.map((option) => (
              <Form.Check
                name="symbol"
                key={option}
                type="checkbox"
                label={option}
                id={option}
                value={option}
                checked={selectedOptions.symbol.includes(option)}
                onChange={handleCheckboxChange}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <div className={`${histStyle.submitBtn} dashCardSubBtn`} style={{ fontSize: `${fontSize + 3}px` }}>
          <button ref={submitBtnRef} onClick={() => getHistoricalData(mtmType)} style={{ fontSize: `${fontSize + 3}px` }}>
            <IoEnter />
          </button>
        </div>
      </div>
      {/* <ResponsiveContainer width="100%" 
      //  height="clamp(89%, 27vh, 100%)" 
       height="89%"
      // minHeight="89%"
      > */}
      <div style={{ width: "100%", height: "85%", marginTop: "0.5rem" }}>
        <AgChartsReact options={options} />
      </div>
      {/* </ResponsiveContainer> */}
      <div className={histStyle.graphSelectionSection} style={{ fontSize: `${fontSize}px` }}>
        {Object.keys(typesColor).map(e => {
          return (
            <div className={histStyle.item}
              onClick={() => {
                setMtmType(e);
              }}
            >
              <span style={{ backgroundColor: typesColor[e].color, }}></span>{typesColor[e].label}
            </div>
          )
        })}
      </div>
      <ModalPopup
        fullscreen={true}
        title={"C Historical Data"}
        flag={showCHisData}
        close={cHistoricalDatashow}
        component={<CHistoricalDataPopup tableData={options.data} />}
      />
      <div>
        <Notification
          notify={NotifyData}
          CloseError={CloseError}
          CloseSuccess={CloseSuccess}
        />
      </div>
    </div>
  );
};
export default memo(CHistoricalData);
