import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { SlSettings } from "react-icons/sl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { ModalPopup } from "../../DynamicComp";
// export { default as ExchangeList } from './ExchangeList'
import ChartDataLabels from "chartjs-plugin-datalabels";
import { GET_COMPONENTSETTING_API, GET_FILTERS_API, POST_COMPONENTSETTING_API } from "../../../API/ApiServices";
import {
  AllChartFiltersAction,
} from "../../../Redux/RMSAction";
import useApi from "../../CustomHook/useApi";
import ExchangeList from "../../DynamicComp/ExchangeList";
import PosSummary from "./PosSummary";
import posStyle from "./PositionBar.module.scss";
import PositionGroupWiseTable from "./PositionGroupWiseTable";
import PositionSymbolWiseTable from "./PositionSymbolWiseTable";
// import { getLighterColorShades } from './colorShades';

const ADDISTIOAL_BAR_SPACE = 10

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  // Legend,
  ChartDataLabels
);





function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

let transformedData = {
  labels: [],
  datasets: [],
};

let userIdToColorMap = {}; // Store background colors for each user ID
const PositionBar = () => {
  const { data, loading, error, makeApiCall } = useApi(GET_FILTERS_API);

  const positionChartData = useSelector(
    (state) => state?.positionChart, shallowEqual
  );
  const selectedSymbolsAndExchange = useSelector(
    (state) => state?.selectedSymbolsAndExchange
  );
  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );

  const dispatch = useDispatch();

  const [showPosSymboleWise, setShowPosSymboleWise] = useState(false);
  const [showPosGroupeWise, setShowPosGroupWise] = useState(false);
  const [showPosEditSetting, setShowPosEditSetting] = useState(false);
  const [showPosSumary, setShowPosSummary] = useState(false);
  const [userIdsColors, setUserIdsColors] = useState(localStorage.getItem("userColor") ? JSON.parse(localStorage.getItem("userColor")) : {})


  const [exchange, setExchange] = useState(["NSEFO"]);

  const CMEData = {
    labels: [],
    datasets: [],
  };

  const [chartData, setChartData] = useState(CMEData);

  // useEffect(() => {
  //   ws.onmessage = (e) => {
  //     // console.log(JSON.parse(data.data));
  //     let npdata = JSON.parse(e.data)
  //     // console.log("npallsoketdata", npdata);
  //     if (npdata?.event == "position_chart_data") {
  //       console.log("position_chart_data", npdata?.data);
  //       // setPositionData(previous=>[...previous,npdata.data])
  //       console.log("exchangestate", exchange);
  //       if (npdata?.data?.exchange === exchange) {

  //         console.log("npdata.data.exchange", npdata?.data?.exchange);
  //         dispatch(PostionChartAction(npdata?.data?.data))

  //       }
  //     }
  //     // npdata.event==='position' && setPositionData(prev=>prev.push(npdata.data))
  //   }
  //   // makeApiCall(GET_NETPOSITION_API,{"viewtype":"chart","exchange":"cme"})
  // }, [exchange])

  useEffect(() => {
    localStorage.setItem("userColor", JSON.stringify(userIdsColors))
  }, [userIdsColors])


  useEffect(() => {

    if (positionChartData?.length > 0) {
      // console.log("positionChartData", positionChartData);
      positionChartData.forEach((entry, i) => {
        if (i === 0) {
          transformedData.datasets = transformedData.datasets.map(e => ({ ...e, data: [] }))
        }

        if (exchange?.includes(entry?.exchange)) {
          const symbol = entry.symbol;
          const userId = entry.userid;
          const cfqty = entry.cfqty;

          let existingLabelIndex = transformedData.labels.indexOf(symbol);

          if (existingLabelIndex === -1) {
            transformedData.labels.push(symbol);
            existingLabelIndex = transformedData.labels.indexOf(symbol);
          }

          let existingUserIDIndex = transformedData.datasets.findIndex(ds => ds.label[0] === userId);


          if (existingUserIDIndex === -1) {
            let backgroundColor = null;

            if (!userIdsColors[userId]) {
              let color = getRandomColor()
              setUserIdsColors(previous => ({ ...previous, [userId]: color }))
              backgroundColor = color
            } else backgroundColor = userIdsColors[userId]


            userIdToColorMap[userId] = backgroundColor;

            const newData = {
              label: [userId],
              backgroundColor: backgroundColor,
              data: [],
            };
            newData.data[existingLabelIndex] = cfqty
            transformedData.datasets.push(newData);
          } else {
            const currData = transformedData.datasets[existingUserIDIndex].data[existingLabelIndex]
            if (currData) {
              transformedData.datasets[existingUserIDIndex].data[existingLabelIndex] += cfqty
            } else { transformedData.datasets[existingUserIDIndex].data[existingLabelIndex] = cfqty }

            // transformedData.datasets[existedUser].data[symbolInde] = cfqty
          }
        }
      })

      transformedData.datasets.unshift({
        label: 'Totals',
        data: transformedData.datasets.map(obj => 0),
        datalabels: {
          // clamp: true,
          display: "auto",
          align: "center",
          formatter: (value, ctx) => {
            let sum = 0;
            let dataArr = ctx.chart.data.datasets;

            dataArr.forEach((dataset) => {
              if (dataset.data[ctx.dataIndex]) sum += dataset.data[ctx.dataIndex];
            });
            return Math.round(sum);
          },
        },
      })
      const toPop = []
      transformedData.labels.forEach((label, i) => {
        let total = 0;
        transformedData.datasets.forEach(ds => {
          if (!isNaN(ds.data[i])) total += ds.data[i]
        })
        if (total === 0) toPop.push(i)
      })

      toPop.forEach((i, index) => {
        transformedData.labels.splice(i - index, 1)
        transformedData.datasets.forEach(e => {
          e.data.splice(i - index, 1)
        })
      })
      setChartData({ ...transformedData });
    }

  }, [positionChartData, exchange]);

  useEffect(() => {
    dispatch(AllChartFiltersAction({ PositionExchange: exchange }));
  }, [exchange]);

  // let positiveSum = 0
  // let negativeSum = 0
  // const options =


  const options = {
    maintainAspectRatio: false,

    // animation: {
    //   duration: 0, // Set the animation duration to 0 to disable animations
    // },
    animation: false,
    labels: false,
    responsive: true,
    order: 2,
    // theme: "ag-default-dark",

    // datalabels: {
    //   color: "white", // Change the color of the data labels to make them visible on dark bars
    //   anchor: "end", // Position the data labels at the end of the bars
    //   align: "top", // Position the data labels at the top of the bars
    //   formatter: function (value, context) {
    //     // You can format the label as needed. In this example, we're simply displaying the value.
    //     return value;
    //   },
    // },
    // plugins: {
    //   legend: false,
    //   datalabels: {
    //     formatter: (value, ctx) => {
    //       let datasets = ctx.chart.data.datasets; // Tried `.filter(ds => !ds._meta.hidden);` without success
    //       if (ctx.datasetIndex === datasets.length - 1) {
    //         let sum = 0;
    //         datasets.map(dataset => {
    //           sum += dataset.data[ctx.dataIndex];
    //         });
    //         return sum.toLocaleString(/* ... */);
    //       }
    //       else {
    //         return '';
    //       }

    //     },
    //     anchor: 'end',
    //     align: 'end'
    //   }
    // },
    plugins: {
      datalabels: {

        anchor: "end",
        align: "top",
        display: "auto",
        // offset: -22,

        formatter: (value, context) => {
          // const datasetArray = []


          // context.chart.data.datasets.forEach((dataset) => {
          //   if (dataset.data[context.dataIndex] != undefined) {
          //     datasetArray.push(dataset.data[context.dataIndex])
          //   }
          // })


          // let sum = datasetArray.reduce((total, datapoint) => total + datapoint, 0)
          // if (context.datasetIndex == datasetArray.length - 1)
          //   return Math.round(sum)
          // else
          return null
        },
        font: {
          size: 14,
        },
        color: '#fff',
        backgroundColor: "#0404049e",
        padding: {
          top: 2, // Adjust as needed
          bottom: 0, // Adjust as needed
          left: 4, // Adjust as needed
          right: 4, // Adjust as needed
        },
        borderRadius: '4',
      },
      legend: {
        display: false,
      },

      // afterDraw: (chart) => {

    },
    scales: {
      // labels: false,
      x: {
        stacked: true,

        grid: {
          display: false,
          color: "rgba(10, 10,10, 10)",
        },
      },

      y: {

        // max: positiveSum,
        // min: negativeSum,
        stacked: true,
        // ticks: {
        //   color: themeSetting == "body" ? "#000" : "#fff",
        //   font: {
        //     size: 11,
        //   },

        //   // stepSize: 1,
        //   // beginAtZero: true,
        // },
        // grid: {
        //   display: false
        // }
      },
    },
    maxBarThickness: 100,
    layout: {
      padding: {
        top: 15,
        bottom: 15
      }
    }
  }


  // useEffect(() => {


  //   // setOptions(p => ({
  //   //   ...p,
  //   //   scales: {
  //   //     ...p.scales,
  //   //     y: {
  //   //       max: posNeg.pos + posNeg.pos * ADDISTIOAL_BAR_SPACE / 100,
  //   //       min: posNeg.neg + posNeg.neg * ADDISTIOAL_BAR_SPACE / 100,
  //   //       stacked: true,
  //   //     },
  //   //   }
  //   // }))
  // }, [posNeg])

  // useEffect(() => {
  //   setPosNeg({ pos: 0, neg: 0 })
  // }, [chartData])

  const positionProductSymbol = () => {
    showPosSymboleWise
      ? setShowPosSymboleWise(false)
      : setShowPosSymboleWise(true);
  };
  const positionProductGroup = () => {
    showPosGroupeWise ? setShowPosGroupWise(false) : setShowPosGroupWise(true);
  };
  const positonProductSetting = () => {
    showPosEditSetting
      ? setShowPosEditSetting(false)
      : setShowPosEditSetting(true);
  };
  const posSummary = () => {
    showPosSumary ? setShowPosSummary(false) : setShowPosSummary(true);
  };
  // const handleButtonClick = (name) => {
  //   setActiveBtnName(name);
  // };
  // const handleButtonClick = (e) => {
  //   setActiveBtnName(
  //     e.target.name
  //   );
  // };

  const handleDataChange = (e) => {
    if (exchange == e?.target?.id) return
    const selectedExchange = e?.target?.id;

    // Check if the selected exchange is already in the list
    if (exchange.includes(selectedExchange)) {
      // If yes, remove it
      const updatedExchanges = exchange.filter(ex => ex !== selectedExchange);
      setExchange(updatedExchanges);
    } else {
      // If not, add it to the list (limited to two exchanges)
      const updatedExchanges = [...exchange, selectedExchange];
      setExchange(updatedExchanges);
    }
    // setExchange(e?.target?.id);
    setChartData({});
    transformedData = {
      labels: [],
      datasets: [],
    };

    userIdToColorMap = {};
  };


  //----------------------- SAVE WORKSPACE ------------------------------------------------

  const componentInfo = { componentname: "positionbar", componenttype: "graph" }
  const [componentSetting, setComponentSetting] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfo)
        setComponentSetting(data.result)

        const setting = data.result[componentInfo.componenttype]?.setting
        if (setting && setting["exchange"]) {
          setExchange(setting["exchange"])
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
        setting: { exchange },
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
  }, [exchange])

  //----------------------- END SAVE WORKSPACE ------------------------------------------------

  //-------------------react-grid-layout font size-------------
  const layout = useSelector((state) => state.layout, shallowEqual);
  const [fontSize, setFontSize] = useState(); // font size
  useEffect(() => {
    const data = layout?.lg?.filter(item => item.i === 'c');
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
    <div className={posStyle.positionSection}>
      <div className={posStyle.headerSection}>
        {/* <button
          onClick={posSummary}
          className={`${posStyle.symbBtn} dashCardHeaderBtn`}
        >
          POS. Summary
        </button> */}
        <button style={{ fontSize: `${fontSize}px` }} className="dashCardHeaderBtn" onClick={positionProductSymbol}>
          Symbol Wise
        </button>
        <button style={{ fontSize: `${fontSize}px` }} className="dashCardHeaderBtn" onClick={positionProductGroup}>
          Group Wise
        </button>
      </div>
      <div className={posStyle.posSetting} style={{ fontSize: `${fontSize + 3}px` }} onClick={positonProductSetting}>
        <SlSettings />
      </div>
      {/* <ResponsiveContainer
        width="100%"
        // height="85%"
        // height="clamp(80%, 26vh, 100%)"
        height="78%"
      > */}
      <div style={{ height: "78%", width: "100%" }}>
        <Bar
          width="100%"
          data={chartData}
          options={options}
          redraw={false}
          updateMode="active"
        />
      </div>
      {/* </ResponsiveContainer> */}
      <div className={`${posStyle.posBtnSection} posBtnSection`}>
        {/* <button
          // className={activeBtnName ? "btn-animation" : "active-animation"}
          // className={`${posStyle.buton} ${activeBtnName ? `${posStyle.active}` : ''}`}
          // onClick={handleButtonClick}
          id='cme'
          onClick={(e) => handleDataChange(e)}
          style={{ background: (exchange == "CME" ? '#fffff' : '#293242') }}
        >
          CME
        </button> */}
        {selectedSymbolsAndExchange?.["position"]?.map((selectedExchange) => {
          const isInSecondArray = [...new Set(positionChartData?.map(obj => `${obj.exchange}`))].includes(selectedExchange);
          if (isInSecondArray) {
            return (<button
              key={selectedExchange}
              id={selectedExchange}
              onClick={(e) => handleDataChange(e)}
              // style={ 
              //   exchange === selectedExchange
              //     ? {
              //       background: themeSetting == "body" ? "#293242" : "#2178a2",
              //       color: "#ffffff",
              //     }
              //     : null
              // }
              style={{
                color: exchange.includes(selectedExchange) ? "#ffffff" : null,
                background: exchange.includes(selectedExchange) ? themeSetting == "body" ? "#293242" : "#2178a2" : null,
                fontSize: `${fontSize}px`
              }}
            >
              {selectedExchange}
            </button>)
          }
        })}
      </div>

      <ModalPopup
        fullscreen={true}
        title={"Position Table"}
        flag={showPosSymboleWise}
        close={positionProductSymbol}
        component={<PositionSymbolWiseTable exchange={exchange} />}
      />
      <ModalPopup
        fullscreen={true}
        title={"Position Table"}
        flag={showPosGroupeWise}
        close={positionProductGroup}
        component={<PositionGroupWiseTable exchange={exchange} />}
      />
      <ModalPopup
        size={"lg"}
        fullscreen={false}
        title={"Edit Exchange"}
        flag={showPosEditSetting}
        close={positonProductSetting}
        component={
          <ExchangeList
            componentName="position"
            positonProductSetting={positonProductSetting}
          />
        }
      />
      <ModalPopup
        fullscreen={true}
        title={"Position Summary"}
        flag={showPosSumary}
        close={posSummary}
        component={<PosSummary />}
      />
    </div>
  );
};

export default React.memo(PositionBar);
