import { memo, useEffect, useState } from "react";
import { AgChartsReact } from "ag-charts-react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import {
  POST_MTMCHART_API,
  POST_COMPONENTSETTING_API,
  GET_COMPONENTSETTING_API
} from "../../../API/ApiServices";
import { ColorShades } from "./ColorShades";
import { ModalPopup } from "../../DynamicComp";
import MtmSymbolWiseTable from "./MtmSymbolWiseTable";
import MtmGroupWiseTable from "./MtmGroupWiseTable";
import {
  AllChartFiltersAction,
  PositionTypeInMtmAction,
} from "../../../Redux/RMSAction";
import MTMProfitLoss from "./MTMProfitLoss";
import MtmSummary from "./MtmSummary";
import { currencyFormater } from "../../../UtilityFunctions/grid";
import mtmStyle from "./MTMDonut.module.scss";

const hexColorred = "#FF0000"; // Red
const hexColorgreen = "#047244"; // Green

const MTMDonut = () => {
  const PositionChartData = useSelector(state => state?.positionChart);
  // console.log({ PositionChartData })
  // console.log({ PositionChartData });
  const dispatch = useDispatch();
  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );
  // const PositionChartData = useSelector(s => Object.values(s.toeknNetposition).flat())



  const dateRange = useSelector((state) => state.dateRange, shallowEqual);
  const ws = useSelector((state) => state?.websocket);
  const [negativeNumberOfShades, setNegativeNumberOfShades] = useState(5);
  const [positiveNumberOfShades, setPositiveNumberOfShades] = useState(10);
  const lighterShadesofred = ColorShades(hexColorred, negativeNumberOfShades);
  const lighterShadesofgreen = ColorShades(
    hexColorgreen,
    positiveNumberOfShades
  );
  const [showSymbolWise, setShowSymbolWise] = useState(false);
  const [showGroupWise, setShowGroupWise] = useState(false);
  const [showProfit, setShowProfit] = useState(false);
  const [showLoss, setShowLoss] = useState(false);
  const [showMtmSummary, setShowMtmSummary] = useState(false);

  const [bfOrTd, setBfOrTd] = useState('');
  const [MTMChartDataFromPost, setMTMChartDataFromPost] = useState([]);
  const [groupOrProduct, setGroupOrProduct] = useState("groupname");
  const [dollarMtmORarbMtmState, setDollarMtmORarbMtmState] = useState("usd");
  const [sumOfBFTDTTL, setSumOfBfTDTTL] = useState({
    percent: 0,
    bfSum: 0,
    tdSum: 0,
    ttlSum: 0,
  });


  const negativedonut = {
    sectorLabelKey: "netmtm",
    angleKey: "netmtm",
    //   sectorLabel: {
    //     color: 'white',
    //     fontWeight: 'bold',
    //     formatter: ({ datum, sectorLabelKey }) => {
    //       return numFormatter.format(datum[sectorLabelKey]);
    //     },
    //   },
    fills: [...lighterShadesofred],
    strokeWidth: 0,
    // legendItemKey: 'groupname',

    tooltip: {
      enabled: true,
      renderer: ({ datum, color, sectorLabelKey }) => {
        return [
          `<div style="background-color: ${color}; padding: 4px 8px; border-top-left-radius: 5px; border-top-right-radius: 5px; color: white; font-weight: bold;">`,
          ` <strong>
            ${datum["groupname"] ? datum["groupname"] : datum["symbol"]}
          </strong>`,
          `</div>`,
          `<div style="padding: 4px 8px;">`,
          `  -${Math.round(datum[sectorLabelKey])}`,
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
    sectorLabelKey: "netmtm",
    angleKey: "netmtm",
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
          `<strong>${datum["groupname"] ? datum["groupname"] : datum["symbol"]
          }</strong> `,
          `</div>`,
          `<div style="padding: 4px 8px;">`,
          ` ${Math.round(datum[sectorLabelKey])}`,
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
        label: {
          enabled: false, // Set this to false to hide labels on the chart
        },

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
        label: {
          enabled: false, // Set this to false to hide labels on the chart
        },
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
  useEffect(() => {
    setOptions((prev) => ({
      ...prev,
      theme: themeSetting == "body" ? "ag-default" : "ag-default-dark",
    }));
  }, [themeSetting]);
  useEffect(() => {
    // console.log("Data Changed")
    let groupedData = {};
    let MTMDATA = [];
    if (PositionChartData && PositionChartData.length > 0) {
      const filteredPositionChartData = PositionChartData.filter((item) => {
        if (dollarMtmORarbMtmState == "usd") {
          // If dollarMtmORarbMtmState is "usd", only return items with basecurrency "USD".
          return item.basecurrency == "USD";
        } else {
          // If dollarMtmORarbMtmState is not "usd", return everything.
          return true;
        }
      });
      groupedData = filteredPositionChartData.reduce((result, obj) => {
        const groupname =
          groupOrProduct == "symbol" ? obj["symbol"] : obj["groupname"];
        const netmtm =
          dollarMtmORarbMtmState == "arb"
            ? obj["basecurrency"] == "USD" ? obj["netmtm"] * obj["usdrate"] : obj["netmtm"]
            : obj["netmtm"];
        const basecurrency = obj["basecurrency"];
        // Check if the groupname already exists in the result
        if (result[groupname]) {
          // If it exists, add the netmtm to the existing group
          result[groupname].netmtm += netmtm;
        } else {
          // If it doesn't exist, create a new group
          result[groupname] = {
            groupname,
            netmtm,
          };
        }

        return result;
      }, {});
      MTMDATA = groupedData && Object.values(groupedData);
      // console.log("groupedData", groupedData);
    }
    // Iterate through the second array and update the netmtm value if a matching groupname is found
    // const combinedArray =
    //   bfOrTd == "td"
    //     ? MTMChartDataFromPost?.map((obj) => {
    //       const match = groupedData[obj.groupname];
    //       if (match) {
    //         return { ...obj, netmtm: (obj.netmtm += match.netmtm) };
    //       } else {
    //         // If there's no match, append the object to the first array
    //         return obj;
    //       }
    //     })
    //     : bfOrTd == "bf"
    //       ? MTMChartDataFromPost
    //       : MTMDATA;

    const combinedArray =
      bfOrTd == "td"
        ? MTMDATA
        : bfOrTd == "bf"
          ? MTMChartDataFromPost
          : MTMChartDataFromPost?.map((obj) => {
            const match = groupedData[obj[groupOrProduct]];
            if (match) {
              return { ...obj, netmtm: (obj.netmtm + match.netmtm) };
            } else {
              // If there's no match, append the object to the sumofbf array
              return obj;
            }
          });

    setNegativeNumberOfShades(filterNegativeValues(combinedArray)?.length);
    setPositiveNumberOfShades(
      combinedArray?.filter(
        (obj) => typeof obj.netmtm === "number" && obj.netmtm >= 0
      )?.length
    );
    const sumofpostdata = MTMChartDataFromPost.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue.netmtm;
      },
      0
    );

    const sumoflivedata = MTMDATA.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.netmtm;
    }, 0);

    setSumOfBfTDTTL((prev) => ({
      ...prev,
      percent: sumoflivedata < 0 ? (((Math.abs(sumoflivedata) / Math.abs(sumofpostdata)) * 100) * -1).toFixed(2) : ((Math.abs(sumoflivedata) / Math.abs(sumofpostdata)) * 100).toFixed(2),
      bfSum: sumofpostdata,
      tdSum: sumoflivedata,
      ttlSum: sumofpostdata + sumoflivedata,
    }));
    // console.log("sumoftd", sumoftd);
    // setSumOfTd(sumofbf - sumoftd)
    // console.log("filterNegativeValues ", filterNegativeValues(combinedArray));
    // console.log(
    //   "filterPositiveValues ",
    //   combinedArray?.filter(
    //     (obj) => typeof obj.netmtm === "number" && obj.netmtm >= 0
    //   )
    // );
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
            (obj) => typeof obj.netmtm === "number" && obj.netmtm >= 0
          ),
        },
      ],
    }));
  }, [
    PositionChartData,
    groupOrProduct,
    dollarMtmORarbMtmState,
    MTMChartDataFromPost,
    bfOrTd,
  ]);



  useEffect(() => {
    const data = {
      groupby: groupOrProduct,
      fromdate: dateRange.fromdate,
      todate: dateRange.todate,
      mtmtype: dollarMtmORarbMtmState,
    }
    const allPromises = [
      POST_MTMCHART_API({
        event: "getmtm",
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
        // console.log("dataMTM_CHART_RESPONSE", data);
        setNegativeNumberOfShades(data[0]?.result?.negative?.length);
        setPositiveNumberOfShades(data[0]?.result?.positive?.length);
        setMTMChartDataFromPost([
          ...data[0]?.result?.negative,
          ...data[0]?.result?.positive,
        ]);
      })
      .catch((error) => console.log(error));
  }, [dateRange, dollarMtmORarbMtmState, groupOrProduct]);
  // console.log("options", PositionChartData);
  const filterNegativeValues = (arrToFilter) => {
    let filteredValues = [];
    for (let i = 0; i < arrToFilter?.length; i++) {
      if (arrToFilter[i].netmtm < 0) {
        filteredValues.push({
          ...arrToFilter[i],
          netmtm: Math.abs(arrToFilter[i].netmtm),
        });
      }
    }
    return filteredValues;
  };

  // const dollarMtmORarbMtmFunction = (e) => {
  //   setDollarMtmORarbMtmState(e?.target?.id);
  //   dispatch(MtmAction(e.target.id));
  // };

  //----------------------- SAVE WORKSPACE ------------------------------------------------

  const componentInfo = { componentname: "mtmdonut", componenttype: "graph" }
  const [componentSetting, setComponentSetting] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfo)
        setComponentSetting(data.result)

        const setting = data.result[componentInfo.componenttype]?.setting
        // console.log({ ress: setting })
        if (setting) {
          if (setting["groupOrProduct"]) setGroupOrProduct(setting["groupOrProduct"])
          if (setting["bfOrTd"]) setBfOrTd(setting["bfOrTd"])
          if (setting["dollarMtmORarbMtmState"]) setDollarMtmORarbMtmState(setting["dollarMtmORarbMtmState"])
        }
      } catch (error) {
        console.log({ error })
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
        setting: { groupOrProduct, bfOrTd, dollarMtmORarbMtmState },
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
  }, [groupOrProduct, bfOrTd, dollarMtmORarbMtmState])


  //----------------------- END SAVE WORKSPACE ------------------------------------------------

  const handleCheckbox = (e) => {
    let groupOrProductVariable;
    if (e?.target?.name == "Wisecheck") {
      if (groupOrProduct == "groupname") {
        setGroupOrProduct("symbol");
        groupOrProductVariable = "symbol";
      }
      if (groupOrProduct == "symbol") {
        setGroupOrProduct("groupname");
        groupOrProductVariable = "groupname";
      }
    }
    if (e?.target?.name == "dollararbbuttons") {
      // dispatch(MtmAction(e.target.id));
      setDollarMtmORarbMtmState(e?.target?.id);
      setBfOrTd("");
    }
    if (e?.target?.name == "bfortd") {
      bfOrTd == e?.target?.id
        ? dispatch(PositionTypeInMtmAction(""))
        : dispatch(PositionTypeInMtmAction(e.target.id));
      bfOrTd == e?.target?.id ? setBfOrTd("") : setBfOrTd(e?.target?.id);
    }

    const allPromises = [
      // GET_MTMCHART_API({ type: `${e?.target?.id}`, exchange: "NSEFO" }),
      // POST_MTMCHART_API({ type: `${e?.target?.id}`, exchange: "NSEFO" }),
      POST_MTMCHART_API({
        event: "getmtm",
        data: {
          groupby:
            e?.target?.name == "Wisecheck"
              ? groupOrProductVariable
              : groupOrProduct,
          fromdate: dateRange.fromdate,
          todate: dateRange.todate,
          mtmtype:
            e?.target?.name == "dollararbbuttons"
              ? e?.target?.id
              : dollarMtmORarbMtmState,
          // "mtmtype": dollarMtmORarbMtmState
        },
      }),
    ];
    const allApiCall = Promise.all(allPromises);
    allApiCall
      .then((responses) => {
        if (responses[0].status === 200) {
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
  useEffect(() => {
    dispatch(
      AllChartFiltersAction({
        MTMDonutGroupOrProduct: groupOrProduct,
        MTMDonutDollarMtmORarbMtmState: dollarMtmORarbMtmState,
      })
    );
  }, [groupOrProduct, dollarMtmORarbMtmState]);

  const mtmSymbolWise = () => {
    showSymbolWise ? setShowSymbolWise(false) : setShowSymbolWise(true);
  };
  const mtmGroupWise = () => {
    showGroupWise ? setShowGroupWise(false) : setShowGroupWise(true);
  };
  const mtmProfit = () => {
    showProfit ? setShowProfit(false) : setShowProfit(true);
  };
  const mtmLoss = () => {
    showLoss ? setShowLoss(false) : setShowLoss(true);
  };

  const mtmSummary = () => {
    showMtmSummary ? setShowMtmSummary(false) : setShowMtmSummary(true);
  };

  //-------------------react-grid-layout font size-------------
  const layout = useSelector((state) => state.layout, shallowEqual);
  const [fontSize, setFontSize] = useState(); // font size
  useEffect(() => {
    const data = layout?.lg?.filter(item => item.i === 'b');
    // console.log({ data })
    // Calculate font size based on X and Y values or any other logic
    const calculateFontSize = () => {
      const baseSize = 9.4; // your default font size
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
    <div className={mtmStyle.mtmSection} style={{ fontSize: `${fontSize}px` }}>
      <div className={mtmStyle.charTabletBtnSection}>
        {/* <button
          onClick={mtmSummary}
          className={`${mtmStyle.symbBtn} dashCardHeaderBtn`}
        >
          MTM Summary
        </button> */}
        {dollarMtmORarbMtmState !== "arb" && (
          <button
            onClick={mtmSymbolWise}
            className={`${mtmStyle.symbBtn} dashCardHeaderBtn`}
            style={{ fontSize: `${fontSize}px` }}
          >
            Symbol Wise
          </button>
        )}
        <button
          onClick={mtmGroupWise}
          className={`${mtmStyle.grpBtn} dashCardHeaderBtn`}
          style={{ fontSize: `${fontSize}px` }}
        >
          Group Wise
        </button>
      </div>
      <div className={`row ${mtmStyle.mtmBodySection}`}>
        <div className={`col-7 ${mtmStyle.donutSection}`}>
          <div
            style={{
              width: "100%",
              // height="clamp(100px,60%, 100%)"
              height: "90%",
              // minHeight={150}
            }}
            className={mtmStyle.responsiveConteiner}
          >
            <AgChartsReact
              className="symbolwiselimitschart"
              options={options}
              updateMode="active"
            />
          </div>
          <div className={mtmStyle.plSection}>
            <p onClick={mtmProfit} className={mtmStyle.profitContent} style={{ fontSize: `${fontSize}px` }}>
              <span className={mtmStyle.contentBox} style={{ height: `${fontSize - 4}px`, width: `${fontSize - 4}px` }}></span> P : <span>{options?.series[1]?.data?.length}</span>
            </p>
            <p onClick={mtmLoss} className={mtmStyle.lossContent} style={{ fontSize: `${fontSize}px` }}>
              <span className={mtmStyle.contentBox} style={{ height: `${fontSize - 4}px`, width: `${fontSize - 4}px` }}></span> L : <span>{options?.series[0]?.data?.length}</span>
            </p>
          </div>
        </div>
        <div className={`col-5 filter-section ${mtmStyle.filterSection}`}>
          {groupOrProduct && (
            <div className={mtmStyle.mtmTopSection}>
              <span >Group Wise</span>
              <div>
                <label
                  title={
                    groupOrProduct == "groupname"
                      ? "Activate Product Wise"
                      : "Activate Group Wise"
                  }
                  aria-label={
                    groupOrProduct == "symbol"
                      ? "Activate Group Wise"
                      : "Activate Product Wise"
                  }
                  className={mtmStyle.container}
                  // style={{
                  //   background: `${
                  //     groupOrProduct == "symbol" ? "#ff2b2b" : "#1b7f55"
                  //   }`,
                  // }}
                  style={
                    groupOrProduct == "symbol"
                      ? { background: "#eb984e", border: "1px solid #eb984e" }
                      : { background: "#eb984e", border: "1px solid #eb984e" }
                  }
                >
                  <input
                    type="checkbox"
                    // label="Group Wise"
                    id="groupname"
                    name="Wisecheck"
                    // inline
                    // checked={groupwise}
                    checked={groupOrProduct && groupOrProduct == "symbol"}
                    onClick={(e) => handleCheckbox(e)}
                    className={`${mtmStyle.groupWise} groupWiseToggle`}
                  />
                  <div className={mtmStyle.circleCheck}></div>
                </label>
              </div>
              <span >Product Wise</span>
            </div>
          )}
          <div className={mtmStyle.mtmBottomSection}>
            <div className={`${mtmStyle.mtmBtnSection} mtmBtnSection`}>
              <div className={mtmStyle.dollarMtmSection}>
                <button
                  className={mtmStyle.dollarMtm}
                  // disabled={(groupwise || productwise) == true ? false : true}
                  name="dollararbbuttons"
                  id="usd"
                  onClick={(e) => handleCheckbox(e)}
                  style={
                    dollarMtmORarbMtmState == "usd"
                      ? {
                        background:
                          themeSetting == "body" ? "#293242" : "#2178a2",
                        color: "#ffffff"
                      }
                      : null
                  }
                // id="dollarMtm"
                // onClick={dollarMtmORarbMtmFunction}
                >
                  MTM
                </button>
                <div className={mtmStyle.subBtn}>
                  <button
                    className={mtmStyle.bfBtn}
                    // disabled={dollarMtmORarbMtmState == "dollarMtm" ? false : true}
                    disabled={dollarMtmORarbMtmState == "usd" ? false : true}
                    id="bf"
                    name="bfortd"
                    style={
                      dollarMtmORarbMtmState == "usd" && bfOrTd == "bf"
                        ? {
                          background:
                            themeSetting == "body" ? "#293242" : "#2178a2",
                          color: "#ffffff"
                        }
                        : null
                    }
                    onClick={(e) => handleCheckbox(e)}
                  >
                    BF
                  </button>
                  <button
                    className={mtmStyle.tdBtn}
                    //disabled={dollarMtmORarbMtmState == "dollarMtm" ? false : true}
                    disabled={dollarMtmORarbMtmState == "usd" ? false : true}
                    id="td"
                    name="bfortd"
                    style={
                      dollarMtmORarbMtmState == "usd" && bfOrTd == "td"
                        ? {
                          background:
                            themeSetting == "body" ? "#293242" : "#2178a2",
                          color: "#ffffff",
                        }
                        : null
                    }
                    onClick={(e) => handleCheckbox(e)}
                  >
                    TD
                  </button>
                </div>
              </div>
              <div className={`${mtmStyle.border} mtmCardBorder`}></div>
              <div className={mtmStyle.arbMtmSection}>
                <button
                  className={mtmStyle.arbMtm}
                  // disabled={(groupwise || productwise) == true ? false : true}
                  name="dollararbbuttons"
                  id="arb"
                  onClick={(e) => handleCheckbox(e)}
                  style={
                    dollarMtmORarbMtmState == "arb"
                      ? {
                        background:
                          themeSetting == "body" ? "#293242" : "#2178a2",
                        color: "#ffffff",
                      }
                      : null
                  }
                // id="arbMtm"
                // onClick={dollarMtmORarbMtmFunction}
                >
                  ARB MTM
                </button>
                <div className={mtmStyle.subBtn}>
                  <button
                    className={mtmStyle.bfBtn}
                    // disabled={
                    //   (dollarMtmORarbMtmState == "arbMtm") == true ? false : true
                    // }
                    disabled={
                      (dollarMtmORarbMtmState == "arb") == true ? false : true
                    }
                    id="bf"
                    name="bfortd"
                    style={
                      dollarMtmORarbMtmState == "arb" && bfOrTd == "bf"
                        ? {
                          background:
                            themeSetting == "body" ? "#293242" : "#2178a2",
                          color: "#ffffff",
                        }
                        : null
                    }
                    onClick={(e) => handleCheckbox(e)}
                  >
                    BF
                  </button>
                  <button
                    className={mtmStyle.tdBtn}
                    // disabled={dollarMtmORarbMtmState == "arbMtm" ? false : true}
                    disabled={dollarMtmORarbMtmState == "arb" ? false : true}
                    id="td"
                    name="bfortd"
                    style={
                      dollarMtmORarbMtmState == "arb" && bfOrTd == "td"
                        ? {
                          background:
                            themeSetting == "body" ? "#293242" : "#2178a2",
                          color: "#ffffff",
                        }
                        : null
                    }
                    onClick={(e) => handleCheckbox(e)}
                  >
                    TD
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={`${mtmStyle.donutInfoCard} row donut-info-card`}>
            <div className={`col-md-7 ${mtmStyle.donutInfoCardContent}`} >
              <div style={{ fontSize: `${fontSize}px`, paddingBottom: `${fontSize - 7}px` }}>bf : <span style={{ color: sumOfBFTDTTL.bfSum > 0 ? "Green" : "red" }}>{currencyFormater(sumOfBFTDTTL?.bfSum)} {dollarMtmORarbMtmState === "usd" ? "$" : "₹"}</span> </div>
              <div style={{ fontSize: `${fontSize}px`, paddingBottom: `${fontSize - 7}px` }}>td : <span style={{ color: sumOfBFTDTTL.tdSum > 0 ? "Green" : "red" }}> {currencyFormater(sumOfBFTDTTL?.tdSum)} {dollarMtmORarbMtmState === "usd" ? "$" : "₹"}</span></div>
              <div style={{ fontSize: `${fontSize}px` }}>ttl : <span style={{ color: sumOfBFTDTTL.ttlSum > 0 ? "Green" : "red" }}> {currencyFormater(sumOfBFTDTTL?.ttlSum)} {dollarMtmORarbMtmState === "usd" ? "$" : "₹"}</span> </div>
            </div>
            <div className={`col-md-5  ${mtmStyle.sumOfPercent}`}>
              <span style={{ color: sumOfBFTDTTL.percent > 0 ? "Green" : "red" }} >{sumOfBFTDTTL.percent}%</span>
            </div>
          </div>
        </div>
      </div>

      <ModalPopup
        fullscreen={true}
        title={`${dollarMtmORarbMtmState.toUpperCase()} MTM Table`}
        flag={showSymbolWise}
        close={mtmSymbolWise}
        component={<MtmSymbolWiseTable bftd={bfOrTd} basecurrency={dollarMtmORarbMtmState} />}
      />
      <ModalPopup
        fullscreen={true}
        title={`${dollarMtmORarbMtmState.toUpperCase()} MTM Table`}
        flag={showGroupWise}
        close={mtmGroupWise}
        component={<MtmGroupWiseTable bftd={bfOrTd} basecurrency={dollarMtmORarbMtmState} />}
      />
      <ModalPopup
        fullscreen={true}
        title={"Profit"}
        flag={showProfit}
        close={mtmProfit}
        component={<MTMProfitLoss basecurrency={dollarMtmORarbMtmState} />}
      />
      <ModalPopup
        fullscreen={true}
        title={"Loss"}
        flag={showLoss}
        close={mtmLoss}
        component={<MTMProfitLoss basecurrency={dollarMtmORarbMtmState} />}
      />

      <ModalPopup
        fullscreen={true}
        title={"Mtm Summary"}
        flag={showMtmSummary}
        close={mtmSummary}
        component={<MtmSummary />}
      />
    </div >
  );
};

export default memo(MTMDonut);
