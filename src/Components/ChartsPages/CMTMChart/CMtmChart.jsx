import { AgChartsReact } from "ag-charts-react";
import React, { useEffect, useState } from "react";
// import { ColorShades } from './ColorShades';
import { Dropdown, Form } from "react-bootstrap";
import { IoEnter } from "react-icons/io5";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { GET_COMPONENTSETTING_API, GET_EXCHANGE_API, GET_FILTERS_API, POST_COMPONENTSETTING_API, POST_MTMCHART_API } from "../../../API/ApiServices";
import { AllChartFiltersAction } from "../../../Redux/RMSAction";
import { currencyFormater } from "../../../UtilityFunctions/grid";
import { ModalPopup } from "../../DynamicComp";
import { ColorShades } from "../MTMChart/ColorShades";
import CMTMGroupTable from "./CMTMGroupTable";
import CMTMSymbolTable from "./CMTMSymbolTable";
import cmtmStyle from "./CMtmChart.module.scss";
import CMtmSummary from "./CMtmSummary";

// https://gs.statcounter.com/browser-market-share/desktop/worldwide/#quarterly-202203-202203-bar

const hexColorred = "#FF0000"; // Red
const hexColorgreen = "#047244"; // Green
let dataByPositionno = {};
let dataByGroup = {};
const CMtmChartNew = () => {
  const dispatch = useDispatch();
  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );
  const positionChartData = useSelector(state => state?.positionChart);
  const [negativeNumberOfShades, setNegativeNumberOfShades] = useState(5);
  const [positiveNumberOfShades, setPositiveNumberOfShades] = useState(10);
  const lighterShadesofred = ColorShades(hexColorred, negativeNumberOfShades);
  const [sumOfBFTDTTL, setSumOfBfTDTTL] = useState({
    percent: 0,
    bfSum: 0,
    tdSum: 0,
    ttlSum: 0,
  });


  const lighterShadesofgreen = ColorShades(
    hexColorgreen,
    positiveNumberOfShades
  );
  // const [optionBf, setoptionBf] = useState(true)
  // const [optionNet, setoptionNet] = useState(false)
  // const [optionCf, setoptionCf] = useState(false)

  const [DonutOptionState, setDonutOptionState] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({
    exchange: [],
    group: [],
    symbol: [],
    clustername: []
  });
  const negativedonut = {
    sectorLabelKey: "dataAmt",
    angleKey: "dataAmt",
    //   sectorLabel: {
    //     color: 'white',
    //     fontWeight: 'bold',
    //     formatter: ({ datum, sectorLabelKey }) => {
    //       return numFormatter.format(datum[sectorLabelKey]);
    //     },
    //   },
    fills: [...lighterShadesofred],

    strokeWidth: 0,
    legendItemKey: "label",
    tooltip: {
      enabled: true,
      renderer: ({ datum, color, sectorLabelKey }) => {
        return [
          `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; color: white; font-weight: bold;">`,
          `<strong>${datum["label"]}:</strong>`,
          `</div>`,
          `<div style="padding: 4px 8px;">`,
          `-${Math.round(datum[sectorLabelKey])}`,
          `</div>`,
        ].join("\n");
      },
    },
    sectorLabel: {
      enabled: false
    },
    highlightStyle: {
      item: {
        fillOpacity: 0,
        // stroke: '#535455',
        // strokeWidth: 1,
      },
    },
  };

  const positivedonut = {
    sectorLabelKey: "dataAmt",
    angleKey: "dataAmt",
    // sectorLabel: {
    //   color: 'white',
    //   fontWeight: 'bold',
    //   formatter: ({ datum, sectorLabelKey }) => {
    //     return numFormatter.format(datum[sectorLabelKey]);
    //   },
    // },
    fills: [...lighterShadesofgreen],
    strokeWidth: 0,
    // legendItemKey: 'browser',

    tooltip: {
      enabled: true,
      renderer: ({ datum, color, sectorLabelKey }) => {
        return [
          `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; color: white; font-weight: bold;">`,
          ` <strong>${datum["label"]}:</strong>`,
          `</div>`,
          `<div style="padding: 4px 8px;">`,
          `  ${Math.round(datum[sectorLabelKey])}`,
          `</div>`,
        ].join("\n");
      },
    },
    sectorLabel: {
      enabled: false
    },
    highlightStyle: {
      item: {
        fillOpacity: 0,
        // stroke: '#535455',
        strokeWidth: 1,
      },
    },
  };
  const [options, setOptions] = useState({
    theme: themeSetting ? "ag-default" : "ag-default-dark",
    autoSize: true,
    // title: {
    //   text: 'Desktop Browser Market Share 2020 vs 2022',
    //   fontSize: 18,
    //   spacing: 25,
    // },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    series: [
      {
        type: "pie",
        ...negativedonut,
        data: [],
        outerRadiusRatio: 0.7, //inner circle width
        innerRadiusRatio: 0.5, //gap btw two circle
        showInLegend: false,
        // strokes:["#ffffff"],

        strokeWidth: 0.5,
        // stroke:"#ffffff",
        // innerLabels: [
        //     { text: '85%', fontSize: 48, color: 'green' },
        //     { text: 'Coverage', margin: 4 }
        // ],
        // title: {
        //   text: 'January 2020',
        //   fontWeight: 'bold',
        // },
        // calloutLabelKey: 'browser',
        calloutLabel: {
          minAngle: 15,
        },
        calloutLine: {
          strokeWidth: 3,
        },
        strokes: ["white"],
        // innerLabels: [
        //   { text: `BF : 98324`, margin: 4 },
        //   { text: `TD : 98324`, margin: 4 },
        //   { text: `TTL : 98324`, margin: 4 },
        // ],
        // innerCircle: {
        //     fill: 'lightgreen',
        // }
      },
      {
        type: "pie",
        ...positivedonut,
        data: [],
        innerRadiusRatio: 0.8, //outer circle width
        strokeWidth: 0.4,

        // title: {
        //   text: 'September 2022',
        //   fontWeight: 'bold',
        // },
        // calloutLabelKey: 'browser',
        calloutLabel: {
          minAngle: 25,
        },
        calloutLine: {
          strokeWidth: 1,
        },
        strokes: ["white"],
      },
    ],
  });

  const [showCMtmSymbolWise, setshowCMtmSymbolWise] = useState(false);
  const [showCMtmGrouplWise, setshowCMtmGrouplWise] = useState(false);
  const [showMtmSummary, setShowMtmSummary] = useState(false);
  const [filterKey, setFilterKey] = useState("netmtm");
  const [filterKeySharing, setFilterKeySharing] = useState("getcompanymtm");
  const [groupOrProduct, setGroupOrProduct] = useState("groupname");
  const [filterOptions, setFilterOptions] = useState({ symbols: [], exchange: [], clustername: [] });
  const [MTMChartDataFromPost, setMTMChartDataFromPost] = useState([]);
  const [basecurrency, setBasecurrency] = useState("USD")

  // const [ChartData, setChartData] = useState([])

  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      theme: themeSetting == "body" ? "ag-default" : "ag-default-dark",
    }));
  }, [themeSetting]);

  useEffect(() => {
    let groupedData = {};
    let MTMDATA = [];
    if (positionChartData && positionChartData.length > 0) {
      // console.log("sending to ");
      // worker.postMessage({data:positionChartData,type:groupOrProduct})
      const filteredPositionChartData = positionChartData.filter((item) => {
        const usdFilter = item.basecurrency == basecurrency
        const exchangeCondition =
          selectedOptions.exchange.length === 0 ||
          selectedOptions.exchange.includes(item.exchange);
        const symbolCondition =
          selectedOptions.symbol.length === 0 ||
          selectedOptions.symbol.includes(item.symbol);
        const clusterCondition =
          selectedOptions.clustername?.length === 0 ||
          selectedOptions.clustername?.includes(item.clustername);

        // Include the item if both conditions are true (only if both arrays have data)
        return usdFilter && exchangeCondition && symbolCondition && clusterCondition;
      });
      groupedData = filteredPositionChartData.reduce((result, obj) => {
        const label =
          groupOrProduct == "symbol" ? obj["symbol"] : obj["groupname"];
        // const positionno = obj["positionno"];
        // const userid = obj["userid"];
        const dataAmt =
          ((obj["netmtm"]) * (-1) *
            (filterKeySharing == "getcompanymtm"
              ? obj["comsharingrate"]
              : filterKeySharing == "getbrokermtm"
                ? obj["brokersharingrate"]
                : obj["clientsharingrate"])) /
          100;

        // Check if the groupname already exists in the result
        if (result[label]) {
          // If it exists, add the netmtm to the existing group
          result[label].dataAmt += dataAmt;
        } else {
          // If it doesn't exist, create a new group
          result[label] = {
            label,
            // positionno,
            // userid,
            dataAmt,
          };
        }

        return result;
      }, {});
      MTMDATA = groupedData && Object.values(groupedData);
    }
    // setChartData(MTMDATA)
    const combinedArray =
      filterKey == "cfamt"
        ? MTMChartDataFromPost?.map((obj) => {
          const match = groupedData[obj.label];
          if (match) {
            return { ...obj, dataAmt: (obj.dataAmt * (-1) + match.dataAmt) };
          } else {
            // If there's no match, append the object to the first array
            return obj;
          }
        })
        : filterKey == "bfamt"
          ? MTMChartDataFromPost?.map(obj => ({ ...obj, dataAmt: obj.dataAmt * (-1) }))
          : MTMDATA;
    setNegativeNumberOfShades(filterNegativeValues(combinedArray)?.length);
    setPositiveNumberOfShades(
      combinedArray?.filter(
        (obj) => typeof obj.dataAmt === "number" && obj.dataAmt >= 0
      )?.length
    );
    const sumofpostdata = MTMChartDataFromPost?.reduce(
      (accumulator, currentValue) => {
        return accumulator + (currentValue.dataAmt * (-1));
      },
      0
    );
    // console.log("sumofpostdata", sumofpostdata);

    const sumoflivedata = MTMDATA?.reduce((accumulator, currentValue) => {
      return accumulator + (currentValue.dataAmt);
    }, 0);

    setSumOfBfTDTTL((prev) => {
      // console.log({ sumoflivedata, res: sumoflivedata < 0 })

      return {
        ...prev,
        percent: sumoflivedata < 0 ? (((Math.abs(sumoflivedata) / Math.abs(sumofpostdata)) * 100) * -1).toFixed(2) : ((Math.abs(sumoflivedata) / Math.abs(sumofpostdata)) * 100).toFixed(2),
        bfSum: sumofpostdata,
        tdSum: sumoflivedata,
        ttlSum: sumofpostdata + sumoflivedata,
      }
    });

    setOptions((prevOptions) => ({
      ...prevOptions,
      series: [
        {
          ...prevOptions.series[0],
          data: filterNegativeValues(combinedArray),
        },
        {
          ...prevOptions.series[1],
          data: combinedArray?.filter(
            (obj) => typeof obj.dataAmt === "number" && obj.dataAmt >= 0
          ),
        },
      ],
    }));
  }, [
    positionChartData,
    groupOrProduct,
    filterKey,
    filterKeySharing,
    // selectedOptions.exchange,
    // selectedOptions.symbol,
    // selectedOptions.clustername,
    basecurrency,
    MTMChartDataFromPost,
  ]);

  useEffect(() => {
    dispatch(
      AllChartFiltersAction({
        CMTMDonutGroupOrProduct: groupOrProduct,
        CMTMDonutFilterKey: filterKey,
        CMTMDonutFilterKeySharing: filterKeySharing,
        CMTMselectedOptionsExchage: selectedOptions.exchange,
        CMTMselectedOptionssymbol: selectedOptions.symbol,
      })
    );
  }, [
    groupOrProduct,
    filterKey,
    filterKeySharing,
    selectedOptions.exchange,
    selectedOptions.symbol,
  ]);

  const filterNegativeValues = (arrToFilter) => {
    let filteredValues = [];
    for (let i = 0; i < arrToFilter.length; i++) {
      if (arrToFilter[i].dataAmt < 0) {
        filteredValues.push({
          ...arrToFilter[i],
          dataAmt: Math.abs(arrToFilter[i].dataAmt),
        });
      }
    }
    return filteredValues;
  };

  // const handleFilterOptions = (e) => {
  //   setFilterKey(e?.target?.id);
  // };
  // useEffect(() => {
  //   const data = {
  //     groupby: groupOrProduct,
  //     fromdate: dateRange.fromdate,
  //     todate: dateRange.todate,
  //     filters: {
  //       exchange: selectedOptions?.exchange,
  //       symbol: selectedOptions?.symbol,
  //       cluster: selectedOptions?.clustername,

  //     },
  //   }
  //   const allPromises = [
  //     POST_MTMCHART_API({
  //       event: filterKeySharing,
  //       data
  //     }),
  //   ];
  //   const allApiCall = Promise.all(allPromises);
  //   allApiCall
  //     .then((responses) => {
  //       // console.log("mtmresp", responses);
  //       if (responses[0].status === 200) {
  //         // console.log("responsesdata", responses[1].data);
  //         return [responses[0].data];
  //       } else {
  //         throw new Error("api failed");
  //       }
  //     })
  //     .then((data) => {
  //       // console.log("CMTM_CHART_RESPONSE", data);
  //       setNegativeNumberOfShades(data[0]?.result?.negative?.length);
  //       setPositiveNumberOfShades(data[0]?.result?.positive?.length);
  //       setMTMChartDataFromPost([
  //         ...data[0]?.result?.negative,
  //         ...data[0]?.result?.positive,
  //       ]);
  //     })
  //     .catch((error) => console.log(error));
  // }, [dateRange, selectedOptions?.clustername, selectedOptions?.symbol, selectedOptions?.exchange, groupOrProduct, filterKeySharing]);

  const filterEnterButton = () => {
    const data = {
      groupby: groupOrProduct,
      fromdate: dateRange.fromdate,
      todate: dateRange.todate,
      basecurrency,
      filters: {
        exchange: selectedOptions?.exchange,
        symbol: selectedOptions?.symbol,
        cluster: selectedOptions?.clustername,

      },
    }
    const allPromises = [
      POST_MTMCHART_API({
        event: filterKeySharing,
        data
      }),
    ];
    const allApiCall = Promise.all(allPromises);
    allApiCall
      .then((responses) => {
        // console.log("mtmresp", responses);
        if (responses[0].status === 200) {
          // console.log("responsesdata", responses[1].data);
          return [responses[0].data];
        } else {
          throw new Error("api failed");
        }
      })
      .then((data) => {
        // console.log("CMTM_CHART_RESPONSE", data);
        setNegativeNumberOfShades(data[0]?.result?.negative?.length);
        setPositiveNumberOfShades(data[0]?.result?.positive?.length);
        setMTMChartDataFromPost([
          ...data[0]?.result?.negative,
          ...data[0]?.result?.positive,
        ]);
      })
      .catch((error) => console.log(error));

  }
  useEffect(() => {
    (async () => {
      try {
        // const { data } = await GET_FILTERS_API({ event: "getallfilters", data: {} })
        const exchangeMaster = await GET_EXCHANGE_API()
        // console.log("exchangeMaster", exchangeMaster.data.result);
        let exchangeData = exchangeMaster.data.result
        // let exchangeUsd = exchangeData?.filter(obj => obj.currency == "USD").map(obj => `${obj.exchange}`)
        let exchangeUsd = exchangeData?.map(obj => `${obj.exchange}`)
        // console.log("exchangeUsd", exchangeUsd);
        setFilterOptions(prev => ({ ...prev, exchange: exchangeUsd }));
      } catch (error) {
        console.log(error)
      }
    })()


  }, []);

  // useEffect(() => {
  //  let filteredExchange=[]
  //   positionChartData.forEach(element => {
  //     if (selectedOptions.exchange.includes(element.exchange)) {
  //       filteredExchange.push(element.exchange)
  //     }

  //   });
  // }, [positionChartData,selectedOptions])
  const handleDropdownToggle = (e, selectedkey, toUpdateKey) => {
    console.log("hi");

    if (!e) return;
    // if (filterKey == 'netmtm') return;
    let params = {
      "event": "getselectedfilters",
      "data":
      {
        "filters": {
          [selectedkey]: selectedOptions[selectedkey]
        }
      }

    }
    const filtersApi = new Promise((resolve) => {
      resolve(GET_FILTERS_API(params));
    });
    filtersApi
      .then((res) => {
        // console.log({ toUpdateKey, res });

        // if (toUpdateKey == 'symbol') { setFilterOptions(prev => ({ ...prev, symbols: res.data.result?.symbols })); }
        // else { }
        setFilterOptions(prev => ({ ...prev, [toUpdateKey]: res.data.result?.[toUpdateKey] }));
      })
      .catch((err) => console.log(err));
  }

  const handleCheckbox = (e) => {
    if (e.target.name == "cGroupOrProductWiseCheck") setGroupOrProduct(e?.target?.id);
    if (e.target.name == "filterSharingCheck") setFilterKeySharing(e?.target?.id);
    if (e.target.name == "filterbutton") setFilterKey(e?.target?.id);



    const allPromises = [
      POST_MTMCHART_API({
        event:
          e?.target?.name == "filterSharingCheck"
            ? e?.target?.id
            : filterKeySharing,
        data: {
          groupby:
            e?.target?.name == "cGroupOrProductWiseCheck"
              ? e?.target?.id
              : groupOrProduct,
          // groupby: `${e?.target?.id}`,
          basecurrency,
          fromdate: dateRange.fromdate,
          todate: dateRange.todate,
          filters: {
            exchange: selectedOptions.exchange,
            symbol: selectedOptions.symbol,
            cluster: selectedOptions.clustername
          },
        },
      }),
    ];


    const allApiCall = Promise.all(allPromises);
    allApiCall
      .then((responses) => {
        // console.log("mtmresp", responses);
        if (responses[0].status === 200) {
          // console.log("responsesdata", responses[1].data);
          return [responses[0].data];
        } else {
          throw new Error("api failed");
        }
      })
      .then((data) => {
        // console.log("dataMTM_CHART_RESPONSE", data);

        setNegativeNumberOfShades(data[0]?.result?.negative?.length);

        setPositiveNumberOfShades(data[0]?.result?.positive?.length);
        setMTMChartDataFromPost([
          ...data[0]?.result?.negative,
          ...data[0]?.result?.positive,
        ]);
      })
      .catch((error) => console.log(error));
  };

  const componentInfo = { componentname: "cmtmchartt", componenttype: "graph" }
  const [componentSetting, setComponentSetting] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfo)
        setComponentSetting(data.result)

        const setting = data.result[componentInfo.componenttype]?.setting
        // console.log({ ress: setting })
        if (setting) {
          if (setting["filterKey"]) setFilterKey(setting["filterKey"])
          if (setting["filterKeySharing"]) setFilterKeySharing(setting["filterKeySharing"])
          if (setting["groupOrProduct"]) setGroupOrProduct(setting["groupOrProduct"])
          if (setting["selectedOptions"]) setSelectedOptions(setting["selectedOptions"])
          // if (setting["filterOptions"]) setFilterOptions(setting["filterOptions"])

          const data = {
            groupby: setting["groupOrProduct"],
            fromdate: dateRange.fromdate,
            todate: dateRange.todate,
            basecurrency,
            filters: {
              exchange: setting["selectedOptions"]?.exchange,
              symbol: setting["selectedOptions"]?.symbol,
              cluster: setting["selectedOptions"]?.clustername,

            },
          }
          const allPromises = [
            POST_MTMCHART_API({
              event: setting["filterKeySharing"],
              data
            }),
          ];
          const allApiCall = Promise.all(allPromises);
          allApiCall
            .then((responses) => {
              // console.log("mtmresp", responses);
              if (responses[0].status === 200) {
                // console.log("responsesdata", responses[1].data);
                return [responses[0].data];
              } else {
                throw new Error("api failed");
              }
            })
            .then((data) => {
              // console.log("CMTM_CHART_RESPONSE", data);
              setNegativeNumberOfShades(data[0]?.result?.negative?.length);
              setPositiveNumberOfShades(data[0]?.result?.positive?.length);
              setMTMChartDataFromPost([
                ...data[0]?.result?.negative,
                ...data[0]?.result?.positive,
              ]);
            })
            .catch((error) => console.log(error));

        }
      } catch (error) {
        console.log({ error })
      }
    })()
  }, [dateRange, basecurrency])


  useEffect(() => {
    if (componentSetting === null) return
    const id = componentSetting[componentInfo.componenttype]?.id

    const body = {
      event: id ? "update" : "create",
      data: {
        ...componentInfo,
        setting: { groupOrProduct, filterKeySharing, filterKey, selectedOptions, filterOptions },
      },
    }
    if (id) body.data["id"] = id;

    (async () => {
      try {
        const { data } = await POST_COMPONENTSETTING_API(body)
      } catch (error) {
        console.log(error)
      }
    })()
  }, [groupOrProduct, filterKeySharing, filterKey, selectedOptions, componentSetting, filterOptions])

  const handleCheckboxChange = (e) => {
    let updatedExchange = [];
    let updatedSymbol = [];
    let updatedCluster = [];
    let updatedGroup = [];


    if (e.target.name == "exchange") {
      if (e.target.id === "selectAll") {
        if (selectedOptions.exchange.length === filterOptions?.exchange.length) {
          setSelectedOptions(p => ({ ...p, exchange: [] }))
          updatedExchange = []
        }
        else {
          updatedExchange = filterOptions?.exchange
          setSelectedOptions(p => ({
            ...p, exchange: filterOptions?.exchange, symbol: [],
            clustername: []
          }))

          setFilterOptions((previous) => {

            const filteredSymbols = new Set(
              positionChartData
                ?.filter((obj) => updatedExchange.includes(obj.exchange))
                .map((obj) => `${obj.symbol}`)
            );
            return { ...previous, symbols: [...filteredSymbols] }
          })


          // const filtersApi = new Promise((resolve) => {
          //   resolve(GET_FILTERS_API({
          //     "event": "getselectedfilters",
          //     "data":
          //     {
          //       "filters": {
          //         "exchange": filterOptions?.exchange,
          //         "groupname": [],
          //         "symbol": []
          //       }
          //     }

          //   }));
          // });
          // filtersApi
          //   .then((res) => {
          //     console.log("res", res.data.result.symbols);
          //     setFilterOptions(prev => ({ ...prev, symbols: res.data.result.symbols }));
          //   })
          //   .catch((err) => console.log(err));
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
          symbol: [],
          clustername: []
        }));
      }
      setFilterOptions((previous) => {

        const filteredSymbols = new Set(
          positionChartData
            ?.filter((obj) => updatedExchange.includes(obj.exchange))
            .map((obj) => `${obj.symbol}`)
        );




        return { ...previous, symbols: [...filteredSymbols] }
      })
      // const filtersApi = new Promise((resolve) => {
      //   resolve(GET_FILTERS_API({
      //     "event": "getselectedfilters",
      //     "data":
      //     {
      //       "filters": {
      //         "exchange": updatedExchange,
      //         "groupname": [],
      //         "symbol": []
      //       }
      //     }

      //   }));
      // });
      // filtersApi
      //   .then((res) => {
      //     console.log("res", res.data.result.symbols);
      //     setFilterOptions(prev => ({ ...prev, symbols: res.data.result.symbols }));
      //   })
      //   .catch((err) => console.log(err));

    }

    if (e.target.name == "symbol") {
      if (e.target.id === "selectAll") {
        if (selectedOptions.symbol.length === filterOptions?.symbols.length) {
          setSelectedOptions(p => ({ ...p, symbol: [] }))
          updatedSymbol = []
        }
        else {
          updatedSymbol = filterOptions?.symbols
          setSelectedOptions(p => ({ ...p, symbol: filterOptions?.symbols, clustername: [] }))

          setFilterOptions((previous) => {

            const filteredClusters = new Set(
              positionChartData
                ?.filter((obj) => updatedSymbol.includes(obj.symbol))
                .map((obj) => `${obj.clustername}`)
            );
            return { ...previous, clustername: [...filteredClusters] }
          })

          // const filtersApi = new Promise((resolve) => {
          //   resolve(GET_FILTERS_API({
          //     "event": "getselectedfilters",
          //     "data":
          //     {
          //       "filters": {
          //         "exchange": filterOptions?.exchange,
          //         "groupname": [],
          //         "symbol": filterOptions?.symbols,

          //       }
          //     }

          //   }));
          // });
          // filtersApi
          //   .then((res) => {
          //     console.log("res", res.data.result.symbols);
          //     setFilterOptions(prev => ({ ...prev, clustername: res.data.result.clustername }));
          //   })
          //   .catch((err) => console.log(err));
        }
      } else {
        updatedSymbol = selectedOptions.symbol.includes(e.target.value)
          ? selectedOptions.symbol.filter((symbol) => symbol !== e.target.value)
          : [...selectedOptions.symbol, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          symbol: updatedSymbol,
          clustername: []
        }));

        setFilterOptions((previous) => {

          const filteredClusters = new Set(
            positionChartData
              ?.filter((obj) => updatedSymbol.includes(obj.symbol))
              .map((obj) => `${obj.clustername}`)
          );
          return { ...previous, clustername: [...filteredClusters] }
        })
        // const filtersApi = new Promise((resolve) => {
        //   resolve(GET_FILTERS_API({
        //     "event": "getselectedfilters",
        //     "data":
        //     {
        //       "filters": {
        //         "exchange": updatedExchange,
        //         "groupname": [],
        //         "symbol": updatedSymbol
        //       }
        //     }

        //   }));
        // });
        // filtersApi
        //   .then((res) => {
        //     console.log("res", res.data.result.clustername);
        //     setFilterOptions(prev => ({ ...prev, clustername: res.data.result.clustername }));
        //   })
        //   .catch((err) => console.log(err));
      }

    }
    if (e.target.name == "clustername") {
      if (e.target.id === "selectAll") {
        if (selectedOptions?.clustername?.length === filterOptions?.clustername?.length) {
          setSelectedOptions(p => ({ ...p, clustername: [] }))
          updatedCluster = []
        }
        else {
          setSelectedOptions(p => ({ ...p, clustername: filterOptions?.clustername }))
          updatedCluster = filterOptions?.clustername
        }
      } else {
        updatedCluster = selectedOptions.clustername.includes(e.target.value)
          ? selectedOptions.clustername.filter((cluster) => cluster !== e.target.value)
          : [...selectedOptions.clustername, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          clustername: updatedCluster,
        }));
      }

    }
  };
  // const handleCheckboxsharing = (e) => {
  //   setFilterKeySharing(e?.target?.id);
  // };
  const cMtmSymbol = () => {
    showCMtmSymbolWise
      ? setshowCMtmSymbolWise(false)
      : setshowCMtmSymbolWise(true);
  };
  const cMtmGroup = () => {
    showCMtmGrouplWise
      ? setshowCMtmGrouplWise(false)
      : setshowCMtmGrouplWise(true);
  };

  // console.log(selectedOptions, filterOptions);

  //-------------------react-grid-layout font size-------------
  const layout = useSelector((state) => state.layout, shallowEqual);
  const [fontSize, setFontSize] = useState(); // font size
  useEffect(() => {
    const data = layout?.lg?.filter(item => item.i === 'j');
    // console.log({ data })
    // Calculate font size based on X and Y values or any other logic
    const calculateFontSize = () => {
      const baseSize = 8.2; // your default font size
      const xFactor = 0.8; // adjust as needed
      const yFactor = 0.8; // adjust as needed

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

  return (
    <div className={cmtmStyle.cmtmSection} style={{ fontSize: `${fontSize}px` }}>
      <div className={cmtmStyle.optionBtnSection} >
        <button
          className="dashCardHeaderBtn"
          style={{ fontSize: `${fontSize}px` }}
          onClick={() => setShowMtmSummary(prev => !prev)}>
          Mtm Summary
        </button>
        <button
          className="dashCardHeaderBtn"
          style={{ fontSize: `${fontSize}px` }}
          onClick={cMtmSymbol}>
          Symbol Wise
        </button>
        <button
          className="dashCardHeaderBtn"
          style={{ fontSize: `${fontSize}px` }}
          onClick={cMtmGroup}
        >
          Group Wise
        </button>
      </div>
      <div className={cmtmStyle.optionSection}>
        <div className={cmtmStyle.basecurrencyWrapper}>
          <Form.Select className={cmtmStyle.selectForm} onChange={e => setBasecurrency(e.target.value)} value={basecurrency} >
            <option value={'INR'}>INR</option>
            <option value={'USD'}>USD</option>
          </Form.Select>
        </div>
        <Dropdown className={`${cmtmStyle.selectionSection} dashSelect`}>
          <Dropdown.Toggle
            className={`${cmtmStyle.selectContent} selectContent`}
            style={{ fontSize: `${fontSize}px` }}
            id="exchange"
          >
            EXCHANGE
          </Dropdown.Toggle>

          <Dropdown.Menu className={cmtmStyle.dropdownOption}>
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
            {filterOptions?.exchange.map((option) => (
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
        <Dropdown className={`${cmtmStyle.selectionSection} dashSelect`} onToggle={(e) => handleDropdownToggle(e, "exchange", "symbols")}>
          < Dropdown.Toggle
            className={`${cmtmStyle.selectContent} selectContent`}
            style={{ fontSize: `${fontSize}px` }}
            id="symbol"
          >
            SYMBOL
          </Dropdown.Toggle>

          <Dropdown.Menu className={cmtmStyle.dropdownOption} >
            <Form.Check
              name="symbol"
              key="selectAll"
              type="checkbox"
              label="selectAll"
              id="selectAll"
              value="selectAll"
              checked={selectedOptions?.symbol?.length > 0 && filterOptions?.symbols?.length > 0 ? selectedOptions?.symbol?.length === filterOptions?.symbols?.length : false}
              onChange={handleCheckboxChange}
            />
            {filterOptions?.symbols.map((option) => (
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
        <Dropdown className={`${cmtmStyle.selectionSection} dashSelect`} onToggle={(e) => handleDropdownToggle(e, "symbol", "clustername")}>
          <Dropdown.Toggle
            className={`${cmtmStyle.selectContent} selectContent`}
            style={{ fontSize: `${fontSize}px` }}
            id="clustername"
          >
            CLUSTER
          </Dropdown.Toggle>

          <Dropdown.Menu className={cmtmStyle.dropdownOption}>
            <Form.Check
              name="clustername"
              key="selectAll"
              type="checkbox"
              label="selectAll"
              id="selectAll"
              value="selectAll"
              checked={selectedOptions?.clustername?.length === filterOptions?.clustername?.length}
              onChange={handleCheckboxChange}
            />
            {filterOptions?.clustername.map((option) => (
              <Form.Check
                name="clustername"
                key={option}
                type="checkbox"
                label={option}
                id={option}
                value={option}
                checked={selectedOptions?.clustername?.includes(option)}
                onChange={handleCheckboxChange}
              />
            ))}
          </Dropdown.Menu>
        </Dropdown>
        <div className={`${cmtmStyle.submitBtn} dashCardSubBtn`} >
          <button
            style={{ fontSize: `${fontSize + 3}px` }}
            // ref={btnClick}
            onClick={() => {
              filterEnterButton()
            }
            }>
            {/* <button className={`${symbStyle.expandBtn} dashCardSubBtn`} onClick={() => runCreateData(symbol, marginConfigResult)}> */}
            <IoEnter />
          </button>
        </div>
        {/* <div className={`${cmtmStyle.exchangeSelection} dashSelect`}>EXCHANGE</div>
        <div className={`${cmtmStyle.groupSelection} dashSelect`}>SYMBOL</div> */}
      </div>
      {
        groupOrProduct && filterKeySharing && (
          <div className={cmtmStyle.cMtmTopSection}>
            <Form.Check
              type="radio"
              label="Group Wise"
              id="groupname"
              name="cGroupOrProductWiseCheck"
              // checked={groupname}
              checked={groupOrProduct && groupOrProduct == "groupname"}
              onClick={(e) => handleCheckbox(e)}
              className={cmtmStyle.groupWise}
            />
            <Form.Check
              type="radio"
              label="Product Wise"
              id="symbol"
              name="cGroupOrProductWiseCheck"
              checked={groupOrProduct && groupOrProduct == "symbol"}
              onClick={(e) => handleCheckbox(e)}
              className={cmtmStyle.prodWise}
            />
          </div>
        )
      }
      <div className={cmtmStyle.cMtmBottomSection}>
        {groupOrProduct && filterKeySharing && (
          <div className={cmtmStyle.cMtmLeftSection}>
            <Form.Check
              type="radio"
              label="Client"
              id="getclientmtm"
              name="filterSharingCheck"
              // defaultChecked={filterKeySharing == "Client"}
              checked={filterKeySharing == "getclientmtm"}
              onClick={(e) => handleCheckbox(e)}
            // className={cmtmStyle.groupWise}
            />
            <Form.Check
              type="radio"
              label="Broker"
              id="getbrokermtm"
              name="filterSharingCheck"
              checked={filterKeySharing == "getbrokermtm"}
              onClick={(e) => handleCheckbox(e)}
            // className={cmtmStyle.prodWise}
            />
            <Form.Check
              type="radio"
              label="company"
              id="getcompanymtm"
              name="filterSharingCheck"
              checked={filterKeySharing == "getcompanymtm"}
              onClick={(e) => handleCheckbox(e)}
            // className={cmtmStyle.prodWise}
            />
          </div>
        )}
        <div
          // style={{ width: "45%", minWidth: "45%", height: "85%" }}
          className={cmtmStyle.cmtmChartSection}>
          <AgChartsReact options={options} updateMode="active" />
        </div>
        <div className={cmtmStyle.cmtmRightFilterSection}>
          <div className={`${cmtmStyle.cmtmBtnSection} cmtmBtnSection`}>
            <div className={cmtmStyle.BfTlBtnSection}>
              <button
                className={cmtmStyle.bfBtn}
                name="filterbutton"
                id="bfamt"
                style={
                  filterKey == "bfamt"
                    ? {
                      background: themeSetting == "body" ? "#293242" : "#2178a2",
                      color: "#ffffff",
                    }
                    : null
                }
                onClick={(e) => handleCheckbox(e)}
              >
                BF
              </button>
              <button
                className={cmtmStyle.netBtn}
                name="filterbutton"
                id="netmtm"
                style={
                  filterKey == "netmtm"
                    ? {
                      background: themeSetting == "body" ? "#293242" : "#2178a2",
                      color: "#ffffff",
                    }
                    : null
                }
                onClick={(e) => handleCheckbox(e)}
              >
                TD
              </button>
            </div>
            <button
              className={cmtmStyle.cfBtn}
              name="filterbutton"
              id="cfamt"
              style={
                filterKey == "cfamt"
                  ? {
                    background: themeSetting == "body" ? "#293242" : "#2178a2",
                    color: "#ffffff",
                  }
                  : null
              }
              onClick={(e) => handleCheckbox(e)}
            >
              TTL
            </button>
          </div>
          <div className={`${cmtmStyle.donutInfoCard} row donut-info-card`}>
            <div className={`col-md-7 ${cmtmStyle.donutInfoCardContent}`}>
              <div >bf :<span style={{ color: sumOfBFTDTTL.bfSum > 0 ? "Green" : "red" }}>{currencyFormater(sumOfBFTDTTL?.bfSum)}</span> </div>
              <div >td :<span style={{ color: sumOfBFTDTTL.tdSum > 0 ? "Green" : "red" }}> {currencyFormater(sumOfBFTDTTL?.tdSum)}</span></div>
              <div >ttl :<span style={{ color: sumOfBFTDTTL.ttlSum > 0 ? "Green" : "red" }}> {currencyFormater(sumOfBFTDTTL?.ttlSum)}</span> </div>
            </div>
            <div className={`col-md-5  ${cmtmStyle.sumOfPercent}`}>
              <span style={{ color: sumOfBFTDTTL.percent > 0 ? "Green" : "red" }} >{sumOfBFTDTTL.percent}%</span>
            </div>
          </div>
        </div>
      </div>
      <ModalPopup
        fullscreen={true}
        title="C Mtm Summary"
        flag={showMtmSummary}
        close={() => { setShowMtmSummary(prev => !prev) }}
        component={
          <CMtmSummary sharing={filterKeySharing} />
        }
      />
      <ModalPopup
        fullscreen={true}
        title="C MTM Symbol Wise"
        flag={showCMtmSymbolWise}
        close={cMtmSymbol}
        component={
          <CMTMSymbolTable sharing={filterKeySharing} type={filterKey} basecurrency={basecurrency} />
        }
      />
      <ModalPopup
        fullscreen={true}
        title="C MTM Group Wise"
        flag={showCMtmGrouplWise}
        close={cMtmGroup}
        component={
          <CMTMGroupTable sharing={filterKeySharing} type={filterKey} basecurrency={basecurrency} />
        }
      />
    </div >
  );
};

export default React.memo(CMtmChartNew);
