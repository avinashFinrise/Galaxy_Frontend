import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { memo, useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { SlSettings } from "react-icons/sl";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { GET_COMPONENTSETTING_API, POST_COMPONENTSETTING_API } from "../../../API/ApiServices";
import { AllChartFiltersAction } from "../../../Redux/RMSAction";
import { ModalPopup } from "../../DynamicComp";
import ExchangeList from "../../DynamicComp/ExchangeList";
import posStyle from "../PositionChart/PositionBar.module.scss";
import CPositionGroupWiseTable from "./CPositionGroupWiseTable";
import CPositionSymbolWiseTable from "./CPositionSymbolWiseTable";
import PositionSummary from "./PositionSummary";

const toLook = {
  Cos: "comsharingrate",
  Broker: "brokersharingrate",
  Client: "clientsharingrate"
}

// import { getLighterColorShades } from './colorShades';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels

);
let userIdToColorMap = {}; // Store background colors for each user ID
let transformedData = {
  labels: [],
  datasets: [],
};
const CPositionProductWiseChart = () => {
  const dispatch = useDispatch();
  const selectedSymbolsAndExchange = useSelector(
    (state) => state?.selectedSymbolsAndExchange,
    shallowEqual
  );
  const PositionChartData = useSelector(
    (state) => state?.positionChart,
    shallowEqual
  );
  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );
  function getRandomColor() {
    const colors = [
      "#5499C7",
      "#EB984E",
      "#58D68D",
      "#3498DB",
      "#0a454c",
      "#6D1679",
      "#D04C14",
      "#008EA8",
    ]; // Add more colors if needed
    return colors[Math.floor(Math.random() * colors?.length)];
  }
  const data = {
    labels: [],
    datasets: [],
  };
  const [showPosSymboleWise, setShowPosSymboleWise] = useState(false);
  const [showPosGroupeWise, setShowPosGroupWise] = useState(false);
  const [showPosEditSetting, setShowPosEditSetting] = useState(false);
  const [showPosSummary, setShowPosSummary] = useState(false);
  const [exchange, setExchange] = useState(["NSEFO"]);
  const [PositionWiseCheck, setPositionWiseCheck] = useState("Client");
  const [chartdata, setChartData] = useState(data);

  const PositionProductSymbol = () => {
    showPosSymboleWise
      ? setShowPosSymboleWise(false)
      : setShowPosSymboleWise(true);
  };
  const PositionProductGroup = () => {
    showPosGroupeWise ? setShowPosGroupWise(false) : setShowPosGroupWise(true);
  };
  const positonProductSetting = () => {
    showPosEditSetting
      ? setShowPosEditSetting(false)
      : setShowPosEditSetting(true);
  };

  // const [options, setOptions] = useState(
  const options = {
    maintainAspectRatio: false,
    animation: false,
    responsive: true,
    labels: false,
    plugins: {
      datalabels: {
        anchor: "end",
        align: "top",
        display: "auto",
        formatter: (value, context) => {
          // console.log({ context })
          // const datasetArray = []
          // context.chart.data.datasets.forEach((dataset) => {
          //   if (dataset.data[context.dataIndex] != undefined) {
          //     datasetArray.push(dataset.data[context.dataIndex])
          //   }
          // })

          // function totalSum(total, datapoint) {
          //   return total + datapoint;
          // }
          // // console.log({ datasetArray })
          // let sum = datasetArray.reduce(totalSum, 0)


          // if (context.datasetIndex == datasetArray.length - 1) {


          //   return Math.round(sum)
          // }
          // else
          // return ''
          return null
        },
        font: {
          size: 14, // Set the desired font size
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
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
          color: "rgba(10, 10,10, 10)",
        },
      },
      y: {
        // max: 10000,
        // min: -10000,
        stacked: true,
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
  //   console.log({ yminMax })
  //   console.log({ yminMax: Math.max(...yminMax.map(e => Math.abs(e))) })
  //   // setOptions(p => (
  //   //   {
  //   //     ...p,
  //   //   }))
  // }, [yminMax])


  useEffect(() => {
    if (PositionChartData?.length > 0) {
      PositionChartData.forEach((entry, i) => {
        if (i === 0) {
          transformedData.datasets = transformedData.datasets.map(e => ({ ...e, data: [] }))
        }
        if (
          // entry?.exchange == exchange
          exchange?.includes(entry?.exchange)
        ) {
          const symbol = entry.symbol;
          const userId = entry.userid;


          let existingLabelIndex = transformedData.labels.indexOf(symbol);

          if (existingLabelIndex === -1) {
            transformedData.labels.push(symbol);
            existingLabelIndex = transformedData.labels.indexOf(symbol);
          }

          // let dataset = transformedData.datasets.find(
          //   (ds) => ds.label[0] === userId
          // );
          let existingUserIDIndex = transformedData.datasets.findIndex(ds => ds.label[0] === userId);
          // if (!dataset) {
          //   const backgroundColor = getRandomColor();
          //   userIdToColorMap[userId] = backgroundColor;

          //   dataset = {
          //     label: [userId],
          //     backgroundColor: backgroundColor,
          //     data: Array(transformedData.labels.length).fill(0.0),
          //   };
          //   transformedData.datasets.push(dataset);
          // }

          // dataset.data[existingLabelIndex] = cposition;

          const cposition = (entry.cfqty * entry[toLook[PositionWiseCheck]] / 100) * -1


          if (existingUserIDIndex === -1) {
            const backgroundColor = getRandomColor();
            userIdToColorMap[userId] = backgroundColor;

            const newData = {
              label: [userId],
              backgroundColor: backgroundColor,
              data: [],
            };
            newData.data[existingLabelIndex] = cposition
            transformedData.datasets.push(newData);
          } else {
            const currData = transformedData.datasets[existingUserIDIndex].data[existingLabelIndex]
            if (currData) {
              transformedData.datasets[existingUserIDIndex].data[existingLabelIndex] += cposition
            } else { transformedData.datasets[existingUserIDIndex].data[existingLabelIndex] = cposition }

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
            dataArr.map((dataset) => {
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







    // console.log("transformedData",transformedData);

    // console.log("converted position chart data", JSON.stringify(transformedData, null, 2));
  }, [PositionChartData, exchange, PositionWiseCheck]);
  // console.log({ chartdata })
  useEffect(() => {
    dispatch(
      AllChartFiltersAction({
        CPositionWiseCheckSharing: PositionWiseCheck,
        CPositinExchange: exchange,
      })
    );
  }, [exchange, PositionWiseCheck]);

  const handleDataChange = (e) => {
    // if (exchange == e?.target?.id) return
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

  const handleCheckbox = (e) => {
    setPositionWiseCheck(e?.target?.id);
    setChartData({});
    transformedData = {
      labels: [],
      datasets: [],
    };

    userIdToColorMap = {};
  };


  //----------------------- SAVE WORKSPACE ------------------------------------------------

  const componentInfo = { componentname: "cposiitonproductwise", componenttype: "graph" }
  const [componentSetting, setComponentSetting] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfo)
        setComponentSetting(data.result)

        const setting = data.result[componentInfo.componenttype]?.setting
        // console.log({ ress: setting })
        if (setting) {
          if (setting["PositionWiseCheck"]) setPositionWiseCheck(setting["PositionWiseCheck"])
          if (setting["exchange"]) setExchange(setting["exchange"])
        }
      } catch (error) {
        console.log({ error })
      }
    })()
  }, [])

  useEffect(() => {
    console.log("Called")
    if (componentSetting === null) return
    const id = componentSetting[componentInfo.componenttype]?.id

    const body = {
      event: id ? "update" : "create",
      data: {
        ...componentInfo,
        setting: { PositionWiseCheck, exchange },
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
  }, [PositionWiseCheck, exchange])


  //----------------------- END SAVE WORKSPACE ------------------------------------------------

  //-------------------react-grid-layout font size-------------
  const layout = useSelector((state) => state.layout, shallowEqual);
  const [fontSize, setFontSize] = useState(); // font size
  useEffect(() => {
    const data = layout?.lg?.filter(item => item.i === 'g');
    // console.log({ data })
    // Calculate font size based on X and Y values or any other logic
    const calculateFontSize = () => {
      const baseSize = 8; // your default font size
      const xFactor = 0.8; // adjust as needed
      const yFactor = 0.8; // adjust as needed

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
    <div className={`${posStyle.positionSection} position-section`}>
      <div className={posStyle.categorySection} style={{ fontSize: `${fontSize}px` }}>
        <Form.Check
          type="radio"
          label="Client"
          id="Client"
          name="Sharing"
          // checked={clientPositionWiseCheck}
          checked={PositionWiseCheck == "Client"}
          onClick={(e) => handleCheckbox(e)}
          className={posStyle.groupWise}
        />
        <Form.Check
          type="radio"
          label="Broker"
          id="Broker"
          name="Sharing"
          // checked={brokerPositionWiseCheck}
          checked={PositionWiseCheck == "Broker"}
          onClick={(e) => handleCheckbox(e)}
          className={posStyle.groupWise}
        />
        <Form.Check
          type="radio"
          label="Cos"
          id="Cos"
          name="Sharing"
          // checked={cosPositionWiseCheck}
          checked={PositionWiseCheck == "Cos"}
          onClick={(e) => handleCheckbox(e)}
          className={posStyle.groupWise}
        />
      </div>
      {/* <div className={posStyle.mobCategorySection}>
        <Form.Select aria-label="Default select example">
          <option value="Client">Client</option>
          <option value="Broker">Broker</option>
          <option value="Cos">Cos</option>
        </Form.Select>
      </div> */}
      <div className={`${posStyle.headerSection} ${posStyle.cPosheaderSection}`}>
        <button className="dashCardHeaderBtn" onClick={() => { setShowPosSummary(prev => !prev) }} style={{ fontSize: `${fontSize}px` }}>
          Pos Summary
        </button>
        <button className="dashCardHeaderBtn" onClick={PositionProductSymbol} style={{ fontSize: `${fontSize}px` }}>
          Symbol Wise
        </button>
        <button className="dashCardHeaderBtn" onClick={PositionProductGroup} style={{ fontSize: `${fontSize}px` }}>
          Group Wise
        </button>
      </div>
      <div className={posStyle.posSetting} onClick={positonProductSetting} style={{ fontSize: `${fontSize + 3}px` }}>
        <SlSettings />
      </div>
      <div style={{ height: "78%", width: "100%" }} >
        <Bar
          data={chartdata}
          options={options}
          redraw={false}
          updateMode="active"
        />
      </div>

      <div className={`${posStyle.posBtnSection} posBtnSection`}>
        {selectedSymbolsAndExchange?.["CPositionProductWise"]?.map(
          (selectedExchange) => {
            const isInSecondArray = [...new Set(PositionChartData?.map(obj => `${obj.exchange}`))].includes(selectedExchange);
            if (isInSecondArray) {
              return (<button
                key={selectedExchange}
                id={selectedExchange}
                onClick={(e) => handleDataChange(e)}
                style={
                  // exchange === selectedExchange
                  exchange.includes(selectedExchange)
                    ? {
                      background:
                        themeSetting == "body" ? "#293242" : "#2178a2",
                      color: "#ffffff",
                    }
                    : null
                }
              >
                {selectedExchange}
              </button>
              )
            }
          }
        )}
      </div>
      <ModalPopup
        fullscreen={true}
        title={"C Position Summary"}
        flag={showPosSummary}
        close={() => { setShowPosSummary(prev => !prev) }}
        component={<PositionSummary />}
      />
      <ModalPopup
        fullscreen={true}
        title={"C Position Product Wise"}
        flag={showPosSymboleWise}
        close={PositionProductSymbol}
        component={<CPositionSymbolWiseTable sharing={PositionWiseCheck} />}
      />
      <ModalPopup
        fullscreen={true}
        title={"C Position Product Wise"}
        flag={showPosGroupeWise}
        close={PositionProductGroup}
        component={<CPositionGroupWiseTable sharing={PositionWiseCheck} />}
      />
      <ModalPopup
        size={"lg"}
        fullscreen={false}
        title={"Edit Exchange "}
        flag={showPosEditSetting}
        close={positonProductSetting}
        component={
          <ExchangeList
            componentName="CPositionProductWise"
            positonProductSetting={positonProductSetting}
          />
        }
      />
    </div >
  );
};

export default memo(CPositionProductWiseChart);
