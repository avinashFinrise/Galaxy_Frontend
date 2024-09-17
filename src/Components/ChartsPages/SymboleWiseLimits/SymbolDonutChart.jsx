import { AgChartsReact } from "ag-charts-react";
import { memo, useEffect, useRef, useState } from "react";
import { Dropdown, Form } from "react-bootstrap";
import { IoEnter, IoExpand } from "react-icons/io5";
import { SlSettings } from "react-icons/sl";
import { shallowEqual, useSelector } from "react-redux";
import {
  GET_COMPONENTSETTING_API,
  GET_MARGIN_CONFIG_API,
  GET_NETPOSITION_API,
  POST_COMPONENTSETTING_API,
} from "../../../API/ApiServices";
import {
  calculateMargin,
  createMarginDataset,
} from "../../../UtilityFunctions/MarginCalculation";
import { getRandomColor } from "../../../UtilityFunctions/grid";
import { ModalPopup } from "../../DynamicComp";
import { Notification } from "../../DynamicComp/Notification";
import SymbolList from "../../DynamicComp/SymbolList";
import SymbWiseLimitTable from "./SymbWiseLimitTable";
import SymbolCard from "./SymbolPriceCard/SymbolCard";
import symbStyle from "./SymbolWiseLimits.module.scss";

// function getData2020() {
//   return [
//     { browser: "Chrome", share: 0.6869, year: 2020 },
//     { browser: "Edge", share: 0.4463, year: 2020 },
//     // { browser: 'Safari', share: 0.087, year: 2020 },
//     // { browser: 'Firefox', share: 0.0955, year: 2020 },
//     //   { browser: 'Other', share: 0.0843, year: 2020 },
//   ];
// }

// // https://gs.statcounter.com/browser-market-share/desktop/worldwide/#quarterly-202203-202203-bar
// function getData2022() {
//   return [
//     { browser: "Chrome", share: 0.6695, year: 2022 },
//     { browser: "Edge", share: 0.1086, year: 2022 },
//     { browser: "Safari", share: 0.0891, year: 2022 },
//     { browser: "Firefox", share: 0.0757, year: 2022 },
//     //   { browser: 'Other', share: 0.0681, year: 2022 },
//   ];
// }
let symbolWise_limit_chart_id
const SymbolDonutChart = () => {
  const btnClick = useRef()
  const [userIdsColors, setUserIdsColors] = useState(localStorage.getItem("userColor") ? JSON.parse(localStorage.getItem("userColor")) : {})
  const [isComponentFetched, setIsComponenetFetched] = useState(false)
  const [filteredSymbols, setFilteredSymbols] = useState([]);
  const [marginData, setMarginData] = useState([]);
  const [showSymbSetting, setShowSymbSetting] = useState(false);
  const [showSymbDataTable, setShowSymbDataTable] = useState(false);
  const [filterOptionsNotSelected, setFilterOptionsNotSelected] = useState(false);
  const [symbol, setSymbol] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ currency: ["USD", "INR"] });

  const [selectedOptions, setSelectedOptions] = useState(
    {
      currency: [],
      exchange: [],
      cluster: [],
      groupname: [],
    });


  const selectedSymbolsAndExchange = useSelector(
    (state) => state?.selectedSymbolsAndExchange
  );
  const position = useSelector((state) => state?.positionChart);
  const [spanData, setSpanData] = useState({});
  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );
  const get_spanData = useSelector((state) => state.spanData, shallowEqual);

  const [marginConfigResult, setMarginConfigResult] = useState();
  const [showchangeBtn, setShowSettingBtn] = useState(false);
  const [selectSymbol, setSelectSymbol] = useState(false)
  // useEffect(() => {
  //   // Assuming filterOptionsSymbol and selectedOptionsSymbol are retrieved from local storage
  //   const filterOptionsSymbol = JSON.parse(localStorage.getItem('filterOptionsSymbol'));
  //   const selectedOptionsSymbol = JSON.parse(localStorage.getItem('selectedOptionsSymbol'));
  //   // Function to filter and compare values
  //   if (filterOptionsSymbol && selectedOptionsSymbol) {
  //     const filterAndCompare = (symbol, selected) => {
  //       const filteredOptions = {};

  //       selected && Object.keys(selected).forEach(key => {
  //         // console.log("key", key);
  //         if (key === 'currency') {
  //           // Compare currency directly
  //           filteredOptions[key] = selected[key].filter(currency => symbol[key]?.includes(currency));
  //         } else {
  //           // Compare other options after _
  //           // filteredOptions[key] = selected[key]?.filter(option => symbol[key]?.toString().split("_")[1]?.includes(option));
  //           filteredOptions[key] = selected[key].filter(option => symbol[key].map(val => val.split("_")[val?.split("_")?.length - 1]).includes(`${option}`))
  //         }
  //       });

  //       return filteredOptions;
  //     };

  //     // Filter and compare values
  //     const filteredValues = filterAndCompare(filterOptionsSymbol?.filterOptionsSymbol, selectedOptionsSymbol?.selectedOptionsSymbol);

  //     // Update state with filtered values
  //     setFilterOptions(filterOptionsSymbol?.filterOptionsSymbol)
  //     setSelectedOptions(filteredValues);
  //   }
  // }, []);
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
      left: 2,
    },
    series: [
      {
        type: "pie",
        ...innerPie,
        data: [],
        outerRadiusRatio: 0.7, //inner circle width
        showInLegend: false,
        strokeWidth: 0.5,
        // title: {
        //   text: 'January 2020',
        //   fontWeight: 'bold',
        // },
        strokes: ["white"],
      },
      {
        type: "pie",
        ...outerDonut,
        data: [],
        showInLegend: false,
        innerRadiusRatio: 0.8,
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
        strokeWidth: 0.5,
        strokes: ["white"],
      },
    ],
  });

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

  // useEffect(() => {
  //   const runCreateData = async (key) => {
  //     await createDataByKey(key, symbol);
  //   };

  //   // Run the functions one after the other
  //   (async () => {
  //     await runCreateData("symbol");
  //     await runCreateData("userid");
  //   })();
  // }, [position, get_span, selectedOptions.cluster, selectedOptions.exchange, selectedOptions.groupname, symbol]);


  useEffect(() => {
    (async () => {
      try {
        const componentSettingfetch = await GET_COMPONENTSETTING_API({
          componentname: "symbolWise_limit_chart",
        });

        symbolWise_limit_chart_id = componentSettingfetch?.data?.result?.symbolwise?.id
        // setLimitReachedComponnentSetting(
        //   componentSettingfetch?.data?.result?.symbolwise?.setting
        // );
        // if (componentSettingfetch?.data?.result?.symbolwise?.setting) {
        //   console.log("symbolwise", componentSettingfetch?.data?.result?.symbolwise?.setting);

        //   setSelectedOptions(componentSettingfetch?.data?.result?.symbolwise?.setting?.selectedOptions)
        //   setFilterOptions({ ...(componentSettingfetch?.data?.result?.symbolwise?.setting?.filterOptions), currency: ["USD", "INR"] })
        // }

        if (componentSettingfetch?.data?.result?.symbolwise?.setting) {
          const filterAndCompare = (symbol, selected) => {
            const filteredOptions = {};

            selected && Object.keys(selected).forEach(key => {
              // console.log("key", key);
              if (key === 'currency') {
                // Compare currency directly
                filteredOptions[key] = selected[key].filter(currency => symbol[key]?.includes(currency));
              } else {
                // Compare other options after _
                // filteredOptions[key] = selected[key]?.filter(option => symbol[key]?.toString().split("_")[1]?.includes(option));
                filteredOptions[key] = selected[key].filter(option => symbol[key].map(val => val.split("_")[val?.split("_")?.length - 1]).includes(`${option}`))
              }
            });

            return filteredOptions;
          };

          // Filter and compare values
          const filteredValues = filterAndCompare(componentSettingfetch?.data?.result?.symbolwise?.setting?.filterOptions, componentSettingfetch?.data?.result?.symbolwise?.setting?.selectedOptions);

          // Update state with filtered values
          setSymbol(componentSettingfetch?.data?.result?.symbolwise?.setting?.symbol)
          setFilterOptions(componentSettingfetch?.data?.result?.symbolwise?.setting?.filterOptions)
          setSelectedOptions(filteredValues);

          if (componentSettingfetch?.data?.result?.symbolwise?.setting?.symbol) {

            const marginConfigPromise = await GET_MARGIN_CONFIG_API({
              symbol: componentSettingfetch?.data?.result?.symbolwise?.setting?.symbol,
            });
            setMarginConfigResult(marginConfigPromise?.data?.result)

          }
          // console.log("MarginConfigResult", marginConfigResult);
          // if (selectedOptions.currency == "USD") {
          //   runCreateData(symbol,  marginConfigResult)
          // } else {
          //   getSpanDataByZerodha()
          // }

          setIsComponenetFetched(true)
        }


      } catch (error) {
        console.log(error);
      }
    })();
  }, [])

  useEffect(() => {
    if (!isComponentFetched) return
    btnClick.current.click()
  }, [marginConfigResult, isComponentFetched])


  const runCreateData = async (symbolProp, marginConfigResultProp) => {

    if (selectedOptions.currency[0] == "USD" && symbolProp == null || undefined) {
      setSelectSymbol(true)
    } else {
      await createDataByKey("userid", symbolProp, marginConfigResultProp)
      // saveToLS("selectedSymbol", symbolProp)
      // saveToLS("selectedOptionsSymbol", selectedOptions)
      // saveToLS("filterOptionsSymbol", filterOptions)
      await createDataByKey("symbol", symbolProp, marginConfigResultProp)

      const componentSettingPost = await POST_COMPONENTSETTING_API({
        event: symbolWise_limit_chart_id ? "update" : "create",
        data: {

          ...(symbolWise_limit_chart_id && { id: symbolWise_limit_chart_id }),
          componentname: "symbolWise_limit_chart",
          componenttype: "symbolwise",

          setting: { symbol: symbolProp, selectedOptions: selectedOptions, filterOptions: filterOptions },
        },
      });

    }
  };

  const symbSetting = () => {
    showSymbSetting ? setShowSymbSetting(false) : setShowSymbSetting(true);
  };
  const emptySymbolSetting = () => {
    setSelectSymbol(!selectSymbol)
  };
  const emptyFilterSetting = () => {
    setFilterOptionsNotSelected(!filterOptionsNotSelected)
  };

  const symbWiseLimitsTable = async () => {
    showSymbDataTable
      ? setShowSymbDataTable(false)
      : setShowSymbDataTable(true);

    const marginConfig = await GET_MARGIN_CONFIG_API({ symbol: symbol });
    if (marginConfig) {
      let limits = marginConfig.data.result;


      const filteredPosition = position?.filter(
        (e) => e.symbol == symbol && e.exchange_id == selectedOptions?.exchange[0]
      );

      if (filteredPosition[0]?.basecurrency == "INR") {
        const res = createMarginDataset("userid", filteredPosition);
        let newRes = res.map((val) => {
          const [margin, exposure] = calculateMargin(
            val.data,
            get_spanData,
            filteredPosition
          );
          val["margin"] = margin;
          // console.log("*************", val);
          return val;
        });

        let marginLimits = limits.map((limit) => {
          const matchedObj = newRes.find((res) => limit.userid === res.userid);
          return matchedObj
            ? {
              ...limit,
              usedlimit: matchedObj.margin,
              pendinglimit: limit.allowed - matchedObj.margin,
            }
            : { ...limit, usedlimit: 0, pendinglimit: limit.allowed };
        });

        setMarginData(marginLimits);
      } else {
        console.log("calculate lot margin if basecurrency is USD");
      }
    }
  };

  const createDataByKey = async (dataCreationKey, selectedSymbol, marginConfigResultProp) => {
    if (selectedOptions?.currency.length == 0 && selectedOptions?.exchange.length === 0 && selectedOptions?.cluster.length === 0 && selectedOptions?.groupname.length === 0) {
      console.log("select filters first");
      setFilterOptionsNotSelected(true)
    }
    else {



      const filteredPosition = position?.filter((obj) =>
        (selectedOptions?.currency.length === 0 || (selectedOptions?.currency[0] === "INR") ||
          obj.symbol === selectedSymbol) &&
        (selectedOptions?.currency.length === 0 ||
          selectedOptions?.currency?.some((selectedCurrency) =>
            obj.basecurrency.includes(selectedCurrency)
          )) &&
        (selectedOptions?.exchange.length === 0 ||
          selectedOptions?.exchange?.some((selectedExchange) =>
            obj.exchange_id.toString().includes(selectedExchange.toString())
          )) &&
        (selectedOptions?.cluster.length === 0 ||
          selectedOptions?.cluster?.some((selectedCluster) =>
            obj.cluster_id.toString().includes(selectedCluster.toString())
          )) &&
        (selectedOptions?.groupname.length === 0 ||
          selectedOptions?.groupname?.some((selectedGroup) =>
            obj.group_id.toString().includes(selectedGroup.toString())
          ))

      );


      let totalSum = 0;
      // function yourAsyncFunction() {
      const matchingConfig = marginConfigResultProp?.filter((obj1) => {
        return filteredPosition?.some((obj2) => {
          return obj1.exchange.toString() == obj2.exchange_id.toString() &&
            obj1.cluster.toString() == obj2.cluster_id.toString() &&
            obj1.group.toString() == obj2.group_id.toString() &&
            obj1.symbol.toString() == obj2.symbol.toString()
        })
      })
      // console.log("matchingConfig", matchingConfig);
      // filteredPosition?.forEach((position) => {

      //   const matchingConfig = marginConfigResult?.filter(
      //     (config) =>
      //       // config.date === position.date &&
      //       config.exchange.toString() == position.exchange_id.toString() &&
      //       config.cluster.toString() == position.cluster_id.toString() &&
      //       config.group.toString() == position.group_id.toString() &&
      //       config.symbol.toString() == position.symbol.toString()
      //   );


      if (matchingConfig) {

        matchingConfig && matchingConfig?.map(marginConfigs => {

          totalSum += marginConfigs?.allowed;
        })
      }
      // });
      // const matchingConfig = async () => {
      //   const filteredResult = await Promise.all(
      //     marginConfigResultProp?.map(async (obj1) => {
      //       const isMatch = await filteredPosition?.some(async (obj2) => {
      //         // Perform asynchronous operations here if needed

      //         // Synchronous comparison
      //         return (
      //           obj1.exchange.toString() === obj2.exchange_id.toString() &&
      //           obj1.cluster.toString() === obj2.cluster_id.toString() &&
      //           obj1.group.toString() === obj2.group_id.toString() &&
      //           obj1.symbol.toString() === obj2.symbol.toString()
      //         );
      //       });

      //       // Return the matching object if there is a match
      //       return isMatch ? obj1 : null;
      //     })
      //   );

      //   // Remove null values from the array (non-matching objects)
      //   return filteredResult.filter((item) => item !== null);
      // };

      // // Call the matchingConfig function
      // matchingConfig().then((result) => {
      //   console.log(result);
      //   result && result?.map(marginConfigs => {

      //     totalSum += marginConfigs?.allowed;
      //   })
      //   // Continue with the code that should run after the filtering operation is complete
      // })
      // if (matchingConfig) {

      //   matchingConfig && matchingConfig?.map(marginConfigs => {

      //     totalSum += marginConfigs?.allowed;
      //   })
      // }
      // }
      // yourAsyncFunction()

      let newRes
      if (selectedOptions?.currency[0] == "INR") {
        const res = createMarginDataset(dataCreationKey, filteredPosition);

        newRes = res.map((val) => {
          const [margin, exposure] = calculateMargin(
            val?.data,
            get_spanData,
            filteredPosition
          );

          val["margin"] = margin;
          val["exposure"] = exposure;

          return val;
        });
      } else if (selectedOptions?.currency[0] == "USD") {
        const groupedData = filteredPosition?.reduce((result, obj) => {
          const symbol = obj[`${dataCreationKey}`];

          const cfqty = obj["cfqty"];

          // Check if the symbol already exists in the result
          if (result[symbol]) {
            // If it exists, add the netmtm to the existing group

            result[symbol].margin = (result[symbol].margin || 0) + cfqty;

          } else {
            // If it doesn't exist, create a new group
            result[symbol] = {
              symbol,
              margin: cfqty,

            };
          }

          return result;
        }, {});
        newRes = Object.values(groupedData)
      }
      // console.log("newRes", newRes);
      // console.log("Total Sum:", totalSum, newRes);


      const fills = []

      const dataset = (prevOptions) => {
        return dataCreationKey == "userid"
          ? newRes?.map((obj) => {
            const { userid, ...rest } = obj; // Destructure the "userid" key

            let backgroundColor = null;

            if (!userIdsColors[userid]) {
              let color = getRandomColor()
              setUserIdsColors(previous => ({ ...previous, [userid]: color }))
              backgroundColor = color
            } else backgroundColor = userIdsColors[userid]

            fills.push(backgroundColor)

            return { ["symbol"]: userid, ...rest }; // Create a new object with the new key
          })
          : prevOptions
      }

      setOptions((prevOptions) => ({
        ...prevOptions,
        series: [
          {
            ...prevOptions.series[0],
            data:
              dataCreationKey == "symbol"
                ? [
                  ...newRes?.filter((obj) => obj.symbol === selectedSymbol),
                  {
                    symbol: "remaining",
                    margin:
                      totalSum -
                      Math.abs(newRes?.filter((obj) => obj?.symbol === selectedSymbol)[0]
                        ?.margin),
                  },
                ]
                : prevOptions.series[0].data,
          },
          {
            fills: fills,
            ...prevOptions.series[1],
            data: dataset(prevOptions?.series[1]?.data)
            //   data: dataCreationKey == "userid"
            //     ? newRes?.map((obj) => {
            //       const { userid, ...rest } = obj; // Destructure the "userid" key

            //       return { ["symbol"]: userid, ...rest }; // Create a new object with the new key
            //     })
            //     : prevOptions?.series[1]?.data
          },
        ],
      }));
    }
    // }
  };

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       if (symbol != null || undefined) {
  //         const marginConfigPromise = await GET_MARGIN_CONFIG_API({
  //           symbol: symbol,
  //         });
  //         // const [marginConfigResponse] = await Promise.all([

  //         //   marginConfigPromise,
  //         // ]);
  //         setMarginConfigResult(marginConfigPromise?.data?.result);

  //         // runCreateData(symbol, marginConfigPromise?.data?.result)
  //       }


  //     } catch (error) {
  //       console.log(error);
  //     }
  //   })();
  // }, [symbol]);

  const handleDataChange = async (e) => {
    setSymbol(e?.target?.id);

    const marginConfigPromise = GET_MARGIN_CONFIG_API({
      symbol: e?.target?.id,
    });
    let updatedExchange;
    try {
      const [marginConfigResponse] = await Promise.all([

        marginConfigPromise,
      ]);
      setMarginConfigResult(marginConfigResponse?.data?.result);
      runCreateData(e?.target?.id, marginConfigResponse?.data?.result)

    } catch (error) {
      setNotifyData((data) => ({ ...data, errorFlag: true, errorMsg: error.response.data.reason }));
      console.log("magin", error.response.data.reason);
    }
  };

  const selectAllCheckedExchange = selectedOptions?.exchange?.length === filterOptions?.exchange?.length;
  const selectAllCheckedcluster = selectedOptions?.cluster?.length === filterOptions?.cluster?.length;
  const selectAllCheckedGroupName = selectedOptions?.groupname?.length === filterOptions?.groupname?.length;

  const handleCheckboxChange = async (e) => {

    let updatedCurrency = [];
    let updatedExchange = [];
    let updatedCluster = [];
    let updatedGroup = [];
    if (e.target.name == "currency") {
      updatedCurrency = selectedOptions.currency.includes(e.target.value)
        ? selectedOptions.currency.filter(
          (currency) => currency !== e.target.value
        )
        : [...selectedOptions.currency, e.target.value];

      setSelectedOptions((previous) => ({
        ...previous,
        currency: [e.target.value],
        exchange: [],
        cluster: [],
        groupname: [],
      }));

      if (e.target.value == "INR") {
        setFilterOptions((previous) => ({
          ...previous,
          exchange: [...new Set(position?.filter(obj => obj.basecurrency.toLowerCase() == e.target.value.toLowerCase()).map(obj => `${obj.exchange + "_" + obj.exchange_id}`))],
          cluster: [],
          groupname: [],

        }))
        setSymbol()
      }
      if (e.target.value == "USD") {
        setFilterOptions((previous) => ({
          ...previous,
          exchange: [...new Set(position?.filter(obj => obj.basecurrency.toLowerCase() == e.target.value.toLowerCase()).map(obj => `${obj.exchange + "_" + obj.exchange_id}`))],
          cluster: [],
          groupname: [],
        }))
      }
    }


    if (e.target.name == "exchange") {
      // console.log({ filterOptions, selectedOptions })
      if (e.target.id == "selectAll") {
        const allSelectedExchange = selectAllCheckedExchange ? [] : filterOptions?.exchange.map(option => option.split('_')[option?.split('_')?.length - 1])
        setSelectedOptions((previous) => ({
          ...previous,
          exchange: allSelectedExchange,
          cluster: [],
          groupname: [],
        }));

        updatedExchange = allSelectedExchange
        setFilterOptions((previous) => {

          const filteredClusters = new Set(
            position
              ?.filter((obj) => updatedExchange.includes(obj.exchange_id.toString()))
              .map((obj) => `${obj.clustername + "_" + obj.cluster_id}`)
          );


          // console.log({ filteredClusters })

          return { ...previous, cluster: [...filteredClusters] }
        })

      } else {
        updatedExchange = selectedOptions.exchange.includes(e.target.value)
          ? selectedOptions.exchange.filter(
            (exchange) => exchange !== e.target.value
          )
          : [...selectedOptions.exchange, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          exchange: updatedExchange,
          cluster: [],
          groupname: [],
        }));

        setFilterOptions((previous) => {

          const filteredClusters = new Set(
            position
              ?.filter((obj) => updatedExchange.includes(obj.exchange_id.toString()))
              .map((obj) => `${obj.clustername + "_" + obj.cluster_id}`)
          );

          return { ...previous, cluster: [...filteredClusters] }
        })
      }
    }


    if (e.target.name == "cluster") {
      if (e.target.id == "selectAll") {
        const allselectedCluster = selectAllCheckedcluster ? [] : filterOptions?.cluster.map(option => option.split('_')[option?.split('_')?.length - 1])
        setSelectedOptions((previous) => ({
          ...previous,
          cluster: allselectedCluster,
          groupname: [],
        }));



        setFilterOptions((previous) => {

          const filteredGroup = new Set(
            position
              ?.filter((obj) => allselectedCluster.includes(obj.cluster_id.toString()))
              .map((obj) => `${obj.groupname + "_" + obj.group_id}`)
          );

          return {
            ...previous,

            groupname: [...filteredGroup],
          }
        })


        // const getFilters = await GET_FILTERS_API({
        //   event: "getselectedfilters",
        //   data: {
        //     filters: {
        //       exchange: selectedOptions.exchange,
        //       cluster: filterOptions?.cluster,
        //     },
        //   },
        // });
        // if (getFilters) {
        //   console.log(getFilters);
        //   setFilterOptions((previous) => ({
        //     ...previous,
        //     groupname: getFilters.data.result.groupname,
        //   }));
        // }

      } else {
        updatedCluster = selectedOptions.cluster.includes(e.target.value)
          ? selectedOptions.cluster.filter(
            (cluster) => cluster !== e.target.value
          )
          : [...selectedOptions.cluster, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          cluster: updatedCluster,
        }));
        // const getFilters = await GET_FILTERS_API({
        //   event: "getselectedfilters",
        //   data: {
        //     filters: {
        //       exchange: selectedOptions.exchange,
        //       cluster: updatedCluster,
        //     },
        //   },
        // });
        // if (getFilters) {
        //   console.log(getFilters);
        //   setFilterOptions((previous) => ({
        //     ...previous,
        //     groupname: getFilters.data.result.groupname,
        //   }));
        // }
        setFilterOptions((previous) => {
          // console.log("position", position)
          // console.log("filteredClusters", position
          //   ?.filter((obj) => updatedCluster.includes(obj.cluster_id.toString())));
          const filteredGroup = new Set(
            position
              ?.filter((obj) => updatedCluster.includes(obj.cluster_id.toString()))
              .map((obj) => `${obj.groupname + "_" + obj.group_id}`)
          );

          return {
            ...previous,

            groupname: [...filteredGroup],
          }
        })
      }
    }

    if (e.target.name == "groupname") {
      if (e.target.id == "selectAll") {
        const allselectedGroupName = selectAllCheckedGroupName ? [] : filterOptions?.groupname.map(option => option.split('_')[option.split('_').length - 1])
        setSelectedOptions((previous) => ({
          ...previous,
          groupname: allselectedGroupName,
        }));


      } else {
        updatedGroup = selectedOptions.groupname.includes(e.target.value)
          ? selectedOptions.groupname.filter(
            (group) => group !== e.target.value
          )
          : [...selectedOptions.groupname, e.target.value];

        setSelectedOptions((previous) => ({
          ...previous,
          groupname: updatedGroup,
        }));
      }
    }
  };

  const getSpanDataByZerodha = async () => {
    if (selectedOptions.currency[0] != "INR") return

    const componentSettingPost = await POST_COMPONENTSETTING_API({
      event: symbolWise_limit_chart_id ? "update" : "create",
      data: {

        ...(symbolWise_limit_chart_id && { id: symbolWise_limit_chart_id }),
        componentname: "symbolWise_limit_chart",
        componenttype: "symbolwise",

        setting: { symbol: symbol, selectedOptions: selectedOptions, filterOptions: filterOptions },
      },
    });
    let filteredPosition = []
    filteredPosition = position?.filter((obj) =>
      (selectedOptions?.currency.length === 0 || (selectedOptions?.currency[0] === "INR") ||
        obj.symbol === symbol) &&
      (selectedOptions?.currency.length === 0 ||
        selectedOptions?.currency?.some((selectedCurrency) =>
          obj.basecurrency.includes(selectedCurrency)
        )) &&
      (selectedOptions?.exchange.length === 0 ||
        selectedOptions?.exchange?.some((selectedExchange) =>
          obj.exchange_id.toString().includes(selectedExchange.toString())
        )) &&
      (selectedOptions?.cluster.length === 0 ||
        selectedOptions?.cluster?.some((selectedCluster) =>
          obj.cluster_id.toString().includes(selectedCluster.toString())
        )) &&
      (selectedOptions?.groupname.length === 0 ||
        selectedOptions?.groupname?.some((selectedGroup) =>
          obj.group_id.toString().includes(selectedGroup.toString())
        ))
    );

    setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: "Loading Limit Data" })

    const getSpan = new Promise((resolve, reject) => {
      resolve(GET_NETPOSITION_API({ event: "span_expo_calc", data: { wise: 'userid', position: filteredPosition } }))
    })
    getSpan.then(res => {
      setNotifyData({ ...NotifyData, loadingFlag: false })
      const { result } = res.data
      let margins = [];
      for (let key in result) {

        margins.push({ symbol: key, margin: result[key].margin })

      }

      setOptions((prevOptions) => ({
        ...prevOptions,
        series: [
          { ...prevOptions.series[0], data: [], },
          { ...prevOptions.series[1], data: margins },
        ],
      }));

    }).catch(err => {
      setNotifyData({ ...NotifyData, loadingFlag: false, errorFlag: true, errorMsg: err?.response?.data?.result })
      console.log(err);
    })
  }

  //-------------------react-grid-layout font size-------------
  const layout = useSelector((state) => state.layout, shallowEqual);
  const [fontSize, setFontSize] = useState(); // font size
  useEffect(() => {
    const data = layout?.lg?.filter(item => item.i === 'd');
    // console.log({ data })
    // Calculate font size based on X and Y values or any other logic
    const calculateFontSize = () => {
      const baseSize = 8.8; // your default font size
      const xFactor = 0.8; // adjust as needed
      const yFactor = 0.9; // adjust as needed

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
    <>


      <div className={symbStyle.symbolWiseLimitSection}>
        <div className={symbStyle.symbHeaderSection}>
          <button
            onClick={symbWiseLimitsTable}
            className={`${symbStyle.symbExpandBtn} dashCardHeaderBtn`}
            style={{ fontSize: `${fontSize + 1.5}px` }}
          >
            <span className={symbStyle.textBtnContent}>Expand</span>
            <span className={symbStyle.btnIcon}>
              <IoExpand />
            </span>
          </button>
          <div
            className={symbStyle.symbolSetting}
            style={{ fontSize: `${fontSize + 5}px` }}
            onClick={symbSetting}>
            <SlSettings />
          </div>
        </div>
        <div className={symbStyle.synbolSettingSection} style={{ fontSize: `${fontSize}px` }}>
          {/* <div
            className={symbStyle.synbolSettingContent}
            style={{ position: "absolute", bottom: "5rem", fontSize: `${fontSize}px` }}
          >
            <div className={symbStyle.pendingLimit}>Pending Limits</div>
            <div className={symbStyle.usedLimit}>Used Limits</div>
          </div> */}
          <div
            className={symbStyle.synbolSettingContent}
            style={{ width: "100%", fontSize: `${fontSize}px` }}
          >
            <div className="dashSelect">
              <Dropdown className={`${symbStyle.exchangeSelection} dashSelect`}>
                <Dropdown.Toggle
                  className={`${symbStyle.selectContent} selectContent`}
                  style={{ fontSize: `${fontSize}px` }}
                  id="currency"
                >
                  Currency
                  {selectedOptions.currency?.map(elem => ` ${elem}`)}
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className={symbStyle.dropdownOption}
                  style={{ fontSize: `${fontSize}px` }}>
                  {filterOptions?.currency?.map((option) => (
                    <Form.Check
                      name="currency"
                      key={option}
                      type="checkbox"
                      label={option}
                      id={option}
                      value={option}
                      checked={selectedOptions.currency.includes(option)}
                      onChange={handleCheckboxChange}
                    />
                  ))}

                </Dropdown.Menu>
              </Dropdown>

            </div>
            <div className="dashSelect">
              <Dropdown className={`${symbStyle.exchangeSelection} dashSelect`}>
                <Dropdown.Toggle
                  className={`${symbStyle.selectContent} selectContent`}
                  style={{ fontSize: `${fontSize}px` }}
                  id="exchange"
                >
                  Exchange
                  {/* {selectedOptions.exchange?.map(elem => ` ${elem}`)} */}
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className={symbStyle.dropdownOption}
                  style={{ fontSize: `${fontSize}px` }}>
                  <Form.Check
                    name="exchange"
                    type="checkbox"
                    label="Select All"
                    id="selectAll"
                    value="selectAll"
                    checked={selectAllCheckedExchange}
                    onChange={handleCheckboxChange}
                  />
                  {filterOptions?.exchange?.map((option) => (
                    <Form.Check
                      name="exchange"
                      key={option}
                      type="checkbox"
                      label={option.split('_')[0]}
                      id={option}
                      value={option.split('_')[1]}
                      checked={selectedOptions.exchange.includes(option.split('_')[1])}
                      onChange={handleCheckboxChange}
                    />
                  ))}
                  {/* <Form.Select
                  onChange={handleCheckboxChange}
                  name={"exchange"}
                  size="sm"
                >
                  {filterOptions?.exchange?.map((val) => (
                    <option value={val}>{val}</option>
                  ))}
                </Form.Select> */}
                </Dropdown.Menu>
              </Dropdown>
              {/* <Form.Select
              onChange={handleCheckboxChange}
              name="exchange"
              className={symbStyle.selectForm}
            >
              <option value="exchnage" hidden>
                exchnage
              </option>
              {filterOptions?.exchange?.map((val) => (
                <option value={val}>{val}</option>
              ))}
            </Form.Select> */}
            </div>
            <div className="dashSelect">
              <Dropdown className={`${symbStyle.exchangeSelection} dashSelect`}>
                <Dropdown.Toggle
                  className={`${symbStyle.selectContent} selectContent`}
                  style={{ fontSize: `${fontSize}px` }}
                  id="cluster"
                >
                  Cluster
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className={symbStyle.dropdownOption}
                  style={{ fontSize: `${fontSize}px` }}>
                  <Form.Check
                    name="cluster"
                    type="checkbox"
                    label="Select All"
                    id="selectAll"
                    value="selectAll"
                    checked={selectAllCheckedcluster}
                    onChange={handleCheckboxChange}
                  />
                  {filterOptions?.cluster?.map((option) => (
                    <Form.Check
                      name="cluster"
                      key={option}
                      type="checkbox"
                      label={option.split('_')[0]}
                      id={option}
                      value={option.split('_')[1]}
                      checked={selectedOptions.cluster.includes(option.split('_')[1])}
                      onChange={handleCheckboxChange}
                    />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className="dashSelect">
              <Dropdown className={`${symbStyle.exchangeSelection} dashSelect`}>
                <Dropdown.Toggle
                  className={`${symbStyle.selectContent} selectContent`}
                  style={{ fontSize: `${fontSize}px` }}
                  id="groupname"
                >
                  Group
                </Dropdown.Toggle>

                <Dropdown.Menu
                  className={symbStyle.dropdownOption}
                  style={{ fontSize: `${fontSize}px` }}>
                  <Form.Check
                    name="groupname"
                    type="checkbox"
                    label="Select All"
                    id="selectAll"
                    value="selectAll"
                    checked={selectAllCheckedGroupName}
                    onChange={handleCheckboxChange}
                  />
                  {filterOptions?.groupname?.map((option) => (
                    <Form.Check
                      name="groupname"
                      key={option}
                      type="checkbox"
                      label={option.split('_').slice(0, -1).join('_')}
                      id={option}
                      value={option.split('_')[option.split('_')?.length - 1]}
                      checked={selectedOptions?.groupname?.includes(option.split('_')[option.split('_')?.length - 1])}
                      onChange={handleCheckboxChange}
                    />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div className={`${symbStyle.expandBtn} dashCardSubBtn`} >
              <button
                style={{ fontSize: `${fontSize + 3}px` }}
                ref={btnClick}
                onClick={() => {
                  // console.log({ CURR: selectedOptions.currency })
                  if (selectedOptions.currency[0] == "USD") {
                    runCreateData(symbol, marginConfigResult)
                  } else if (selectedOptions.currency[0] == "INR") {
                    getSpanDataByZerodha()
                  }
                }
                }>
                {/* <button className={`${symbStyle.expandBtn} dashCardSubBtn`} onClick={() => runCreateData(symbol, marginConfigResult)}> */}
                <IoEnter />
              </button>
            </div>
          </div>
        </div>
        <div className={symbStyle.symbolWiseLimitInfo}>
          {/* <ResponsiveContainer
                    width="50%"
                    //  height="clamp(170px,60%, 100%)"
                    height="60%"
                    minHeight={170}
                > */}
          <div
            style={{
              width: "50%",
              height: "82%",
              maxHeight: "100%",
              minHeight: "170px",
            }}
          >
            <AgChartsReact options={options} updateMode="active" />
            <div
              className={symbStyle.symbolPendigUsedLimit}
              style={{ fontSize: `${fontSize}px` }}
            >
              <div className={symbStyle.pendingLimit} ><span style={{ height: `${fontSize - 4}px`, width: `${fontSize - 4}px` }}></span>Pending Limits</div>
              <div className={symbStyle.usedLimit}><span style={{ height: `${fontSize - 4}px`, width: `${fontSize - 4}px` }}></span>Used Limits</div>
            </div>
          </div>

          {/* </ResponsiveContainer> */}
          <SymbolCard fontSize={fontSize} />
        </div>

        {selectedOptions?.currency[0] == "USD" &&
          <div
            className={`${symbStyle.symbBtnSection} symbBtnSection`}
          // style={{ height: "1rem" }}
          >
            <div className={`row ${symbStyle.symbBtn}`} style={{ fontSize: `${fontSize}px` }}>
              {selectedSymbolsAndExchange?.["SymbolLimits"]?.map(
                (selectedExchange) => {
                  const isInSecondArray = [...new Set(position?.filter(obj => obj.basecurrency.toLowerCase() == "usd").map(obj => obj.symbol))].includes(selectedExchange);
                  if (isInSecondArray) {
                    return (<button
                      key={selectedExchange}
                      id={selectedExchange}
                      className="mb-1"
                      onClick={(e) => handleDataChange(e)}
                      style={
                        symbol === selectedExchange
                          ? {
                            background:
                              themeSetting == "body" ? "#293242" : "#2178a2",
                            color: "#ffffff",
                          }
                          : null
                      }
                    >
                      {selectedExchange}
                    </button>)
                  }
                }
              )}
            </div>


            {/* <div className={symbStyle.symbBtn}>
          <button>6J</button>
          <button>6E</button>
          <button>6B</button>
          <button>DINR</button>
          <button>-</button>
        </div> */}
          </div>}
        <ModalPopup
          fullscreen={false}
          size="sm"
          title={"Select Exchange"}
          flag={showchangeBtn}
          close={() =>
            showchangeBtn ? setShowSettingBtn(false) : setShowSettingBtn(true)
          }
          component={
            <div>
              <ul style={{ display: "block" }}>
                Select Exchange
                <li>
                  {filterOptions?.exchange?.map((option) => (
                    <Form.Check
                      name="exchange"
                      key={option}
                      type="checkbox"
                      label={option.split('_')[0]}
                      id={option}
                      value={option.split('_')[1]}
                      checked={selectedOptions.exchange.includes(option.split('_')[1])}
                      onChange={handleCheckboxChange}
                    />
                  ))}
                </li>
              </ul>
            </div>
          }
        />
        <ModalPopup
          size={"sm"}
          // fullscreen={true}
          title={"Select Symbol First"}
          flag={selectSymbol}
          close={emptySymbolSetting}
          component={<div>No Symbol Selected</div>}
        />
        <ModalPopup
          size={"sm"}
          // fullscreen={true}
          title={"Select Filter Options First"}
          flag={filterOptionsNotSelected}
          close={emptyFilterSetting}
          component={<div>No Filters Selected</div>}
        />
        <ModalPopup
          // size={"xl"}
          fullscreen={true}
          title={"Edit Symbol wise Limits"}
          flag={showSymbSetting}
          close={symbSetting}
          component={<SymbolList componentName="SymbolLimits" selectedCurrencyINR={selectedOptions?.currency} symbSetting={symbSetting} />}
        />
        <ModalPopup
          fullscreen={true}
          title={"Symbol wise Limits"}
          flag={showSymbDataTable}
          close={symbWiseLimitsTable}
          component={<SymbWiseLimitTable />}
        />

      </div >
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </>
  );
};

export default memo(SymbolDonutChart);

const numFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0,
});
const innerPie = {
  sectorLabelKey: "margin",
  angleKey: "margin",
  // sectorLabel: {
  //     color: 'white',
  //     fontWeight: 'bold',
  //     formatter: ({ datum, sectorLabelKey }) => {
  //         return numFormatter.format(datum[sectorLabelKey]);
  //     },
  // },
  fills: ["#57cc8b", "#075792", "#f4b944", "#fb7451", "#b7b5ba"],
  strokeWidth: 0,
  legendItemKey: "symbol",
  tooltip: {
    renderer: ({ datum, color, sectorLabelKey }) => {
      return [
        `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; color: white; font-weight: bold;">`,
        datum["year"],
        `</div>`,
        `<div style="padding: 4px 8px;">`,
        `  <strong>${datum["symbol"]}:</strong> ${Math.round(
          datum[sectorLabelKey]
        )}`,
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
      strokeWidth: 0,
    },
  },
};
const outerDonut = {
  sectorLabelKey: "margin",
  angleKey: "margin",
  // sectorLabel: {
  //     color: 'white',
  //     fontWeight: 'bold',
  //     formatter: ({ datum, sectorLabelKey }) => {
  //         return numFormatter.format(datum[sectorLabelKey]);
  //     },
  // },
  strokeWidth: 0,
  legendItemKey: "symbol",
  tooltip: {
    renderer: ({ datum, color, sectorLabelKey }) => {
      return [
        `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; color: white; font-weight: bold;">`,
        datum["year"],
        `</div>`,
        `<div style="padding: 4px 8px;">`,
        `  <strong>${datum["symbol"]}:</strong> ${Math.round(
          datum[sectorLabelKey]
        )}`,
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
      strokeWidth: 0,
    },
  },
};
