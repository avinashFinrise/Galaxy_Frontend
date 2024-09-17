import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { memo, useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { TbReload } from "react-icons/tb";
import { shallowEqual, useSelector } from "react-redux";
import {
  GET_COMPONENTSETTING_API,
  GET_MARGIN_CHART_API,
  GET_NETPOSITION_API,
  POST_COMPONENTSETTING_API,
} from "../../../API/ApiServices";
import {
  calculateMargin,
  createMarginDataset,
} from "../../../UtilityFunctions/MarginCalculation";
import useApi from "../../CustomHook/useApi";
import { Notification } from "../../DynamicComp/Notification";
import mgStyle from "./MarginAndExpoGroup.module.scss";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const divider = 10000000;


const MarginAndExpoGroup = () => {
  const [marginData, setMarginData] = useState({
    data1: {
      labels: [],
      datasets: [
        {
          // label: 'Value 1',
          backgroundColor: "#CC0047",
          data: [],
          barPercentage: 0.8, // Adjust this value to decrease/increase gap between bars
          categoryPercentage: 0.8, // Adjust this value to control the space allocated for each category
          barThickness: 4, // Keep the bar thickness at 8
          maxBarThickness: 8, // Keep the maximum bar thickness at 8
          minBarLength: 2,
        },
      ],
    },
    data2: {
      labels: [],
      datasets: [
        {
          // label: 'Value 1',
          backgroundColor: "#6E0792",
          data: [],
          barPercentage: 0.8, // Adjust this value to decrease/increase gap between bars
          categoryPercentage: 0.8, // Adjust this value to control the space allocated for each category
          barThickness: 4, // Keep the bar thickness at 8
          maxBarThickness: 9, // Keep the maximum bar thickness at 8
          minBarLength: 2,
        },
      ],
    },
  });
  const position = useSelector((state) => state?.positionChart, shallowEqual);
  const get_position = useSelector((state) => state?.Netposition, shallowEqual);
  const get_spanData = useSelector((state) => state.spanData, shallowEqual);

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

  // const data1 = {
  //     labels: ['Trinity', 'Water', 'Cosmic', 'Fin doc', 'Nova', 'Nova 1'],
  //     datasets: [
  //         {
  //             label: 'Value 1',
  //             backgroundColor: '#CC0047',
  //             data: [20, 15, 20, 35, 22, 14, 32, 10],
  //             barPercentage: 0.8,    // Adjust this value to decrease/increase gap between bars
  //             categoryPercentage: 0.8, // Adjust this value to control the space allocated for each category
  //             barThickness: 8,       // Keep the bar thickness at 8
  //             maxBarThickness: 8,    // Keep the maximum bar thickness at 8
  //             minBarLength: 2,
  //         },
  //     ],
  // };

  const options = {
    maintainAspectRatio: false,
    tooltips: {},
    // Animation: false,
    responsive: true,
    plugins: {
      datalabels: {

        anchor: "end",
        align: "start",
        offset: -25,

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
    },
    scales: {
      x: {
        grid: {
          display: false,
          offset: true,
          color: "rgba(10, 10, 10, 10)",
        },
      },
      y: {
        grid: {
          display: false,
          color: "rgba(10, 10, 10, 10)",
        },
      },
    },
    layout: {
      padding: {
        top: 20
      },
    }
  };

  const [showMargin, setShowMargin] = useState(false);
  const [showExpoGroup, setShowExpoGroup] = useState(false);
  // const [showEditeGroupSetting, setShowEditGroupSetting] = useState(false);
  // const [spanData, setSpanData] = useState({});
  const [groupByKey, setGroupByKey] = useState();
  const { data, loading, error, makeApiCall } = useApi();
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const groupByKeyList = [
    "userid",
    "groupname",
    "clustername",
    "symbol",
    "exchange",
    "expirydate",
    "securitytype",
    "strikeprice", "segment",
    "opttype",
    "ctclid", "accountcode", "membercode", "sender"
  ];



  const getMarginData = () => {
    const apiCall = new Promise((resolve) => {
      resolve(GET_MARGIN_CHART_API({ event: "margin", type: "symbol" }));
    });
    apiCall
      .then((res) => {
        let symbol = [];
        let marginValues = [];
        let exposureValues = [];
        // console.log({ lol: res.data })
        res.data.result.map((val) => {
          symbol.push(val.symbol);
          marginValues.push(val.margin);
          exposureValues.push(val.exposure);
        });

        setMarginData((previous) => ({
          ...previous,
          data1: {
            ...previous.data1,
            labels: symbol,
            datasets: [{ ...previous.data1.datasets, data: marginValues }],
          },
          data2: {
            ...marginData.data2,
            labels: symbol,
            datasets: [{ ...previous.data2.datasets, data: exposureValues }],
          },
        }));
        // setFilterOptions(res.data.result)
      })
      .catch((err) => console.log(err));
  };

  // to calculate margins and expo on frontend uncomment below useeffect 
  // useEffect(() => {
  //   (async () => {
  //     // const span = await GET_SPANDATA_API();
  //     // if (span) {
  //     //   setSpanData(span.data.result);
  //     // }
  //     if (get_position.length > 0) {
  //       const createDataByKey = (dataCreationKey) => {
  //         // setGroupByKey(dataCreationKey);
  //         const res = createMarginDataset(dataCreationKey, position);
  //         let newRes = res.map((val) => {
  //           const [margin, exposure] = calculateMargin(
  //             val?.data,
  //             get_spanData,
  //             position
  //           );
  //           // console.log("res", res, margin, exposure);
  //           val["margin"] = margin;
  //           val["exposure"] = exposure;
  //           // console.log("*************", val);
  //           return val;
  //         });

  //         // console.log("=======================>", newRes);
  //
  //         let labels = newRes.map((val) => val[dataCreationKey]);
  //         let margins = newRes.map((val) => val.margin / divider);
  //         let exposures = newRes.map((val) => val.exposure / divider);


  //         const md = marginData;
  //         md.data1.labels;
  //         md.data1.datasets[0].data = margins;
  //         md.data2.labels;
  //         md.data2.datasets[0].data = exposures;
  //         setMarginData((previous) => ({
  //           ...previous,
  //           data1: {
  //             ...previous.data1,
  //             labels: labels,
  //             datasets: [{ ...previous.data1.datasets, data: margins }],
  //           },
  //           data2: {
  //             ...previous.data2,
  //             labels: labels,
  //             datasets: [{ ...previous.data2.datasets, data: exposures }],
  //           },
  //         }));
  //       };
  //       createDataByKey(groupByKey);
  //     }
  //   })();
  // }, [get_position, get_spanData]);

  //=====================================================================================end===============

  const getSpanDataByZerodha = (key) => {

    setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: "Loading Margin & Exposures Data" })

    const getSpan = new Promise((resolve, reject) => {
      resolve(GET_NETPOSITION_API({ event: "span_expo_calc", data: { wise: key, position: [] } }))
    })

    getSpan.then(res => {
      // console.log({ lol: res.data })
      setNotifyData({ ...NotifyData, loadingFlag: false })
      const { result } = res.data
      let margins = [];
      let exposures = []
      let labels = []
      for (let key in result) {
        labels.push(key)
        margins.push(+((result[key].margin / divider).toFixed(3)))
        exposures.push(+((result[key].exposure / divider).toFixed(3)))
      }

      setMarginData((previous) => ({
        ...previous,
        data1: {
          ...previous.data1,
          labels: labels,
          datasets: [{ ...previous.data1.datasets, data: margins }],
        },
        data2: {
          ...previous.data2,
          labels: labels,
          datasets: [{ ...previous.data2.datasets, data: exposures }],
        },
      }));

    }).catch(err => {
      setNotifyData({ ...NotifyData, loadingFlag: false, errorFlag: true, errorMsg: err.response.data.result, headerMsg: "Margin Exposure" })
      console.log(err);
    })
  }

  const componentInfo = { componentname: "marginandexposure", componenttype: "graph" }
  const [componentSetting, setComponentSetting] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfo)
        setComponentSetting(data.result)

        const setting = data.result[componentInfo.componenttype]?.setting
        // console.log({ ress: setting })
        if (setting) {
          if (setting["groupByKey"]) setGroupByKey(setting["groupByKey"])
          console.log("settinggroupByKey", setting["groupByKey"])
          getSpanDataByZerodha(setting["groupByKey"])

          // if (setting["filterKeySharing"]) setFilterKeySharing(setting["filterKeySharing"])
          // if (setting["groupOrProduct"]) setGroupOrProduct(setting["groupOrProduct"])
          // if (setting["selectedOptions"]) setSelectedOptions(setting["selectedOptions"])
          // if (setting["filterOptions"]) setFilterOptions(setting["filterOptions"])
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
        setting: { groupByKey },
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
  }, [componentSetting, groupByKey])






  const marginTable = () => {
    showMargin ? setShowMargin(false) : setShowMargin(true);
  };
  const ExpoGroupTableShow = () => {
    showExpoGroup ? setShowExpoGroup(false) : setShowExpoGroup(true);
  };

  // const marExpoSetting = () => {
  //   showEditeGroupSetting
  //     ? setShowEditGroupSetting(false)
  //     : setShowEditGroupSetting(true);
  // };

  let filteredPositionByINR = useMemo(() => {
    let filtered = position?.filter((val) => val.basecurrency === "INR");
    return filtered;
  }, [position]);


  const createDataByKey = (dataCreationKey) => {
    setGroupByKey(dataCreationKey);

    const res = createMarginDataset(dataCreationKey, filteredPositionByINR);
    let newRes = res.map((val) => {
      const [margin, exposure] = calculateMargin(
        val.data,
        get_spanData,
        filteredPositionByINR
      );
      val["margin"] = margin;
      val["exposure"] = exposure;
      // console.log("*************", val);
      return val;
    });
    const divider = 10000000;
    let labels = newRes.map((val) => val[dataCreationKey]);
    let margins = newRes.map((val) => val.margin / divider);
    let exposures = newRes.map((val) => val.exposure / divider);
    // console.log("============>new res", newRes);
    // console.log("margins", margins);
    // console.log("exposures", exposures);
    setMarginData((previous) => ({
      ...previous,
      data1: {
        ...previous.data1,
        labels: labels,
        datasets: [{ ...previous.data1.datasets, data: margins }],
      },
      data2: {
        ...previous.data2,
        labels: labels,
        datasets: [{ ...previous.data2.datasets, data: exposures }],
      },
    }));

    // let grouped = position.reduce((result, currentItem) => {
    //   const { [dataCreationKey]: uniqueKey, cfqty, token } = currentItem;
    //   if (!result[uniqueKey]) {
    //     result[uniqueKey] = [];
    //   }
    //   result[uniqueKey].push({
    //     userid: uniqueKey,
    //     cfqty: cfqty,
    //     token: token,
    //   });
    //   return result;
    // }, {});

    // console.log("grouped", grouped);
  };

  //-------------------react-grid-layout font size-------------
  const layout = useSelector((state) => state.layout, shallowEqual);
  const [fontSize, setFontSize] = useState(); // font size
  useEffect(() => {
    const data = layout?.lg?.filter(item => item.i === 'h');
    // console.log({ data })
    // Calculate font size based on X and Y values or any other logic
    const calculateFontSize = () => {
      const baseSize = 7.6; // your default font size
      const xFactor = 0.8; // adjust as needed
      const yFactor = 0.9; // adjust as needed

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
    <div className={mgStyle.mgAndExpoSection}>
      <div className={`mgAndExpoHeader ${mgStyle.mgAndExpoHeader}`}>
        {/* <div> */}
        <Form.Select
          // onChange={(e) => createDataByKey(e.target.value)}
          onChange={(e) => {
            getSpanDataByZerodha(e.target.value);
            setGroupByKey(e.target.value)
          }}
          value={groupByKey}
          className={mgStyle.selectForm}
          defaultValue={'Please Select'}
          style={{ fontSize: `${fontSize}px` }}
        >
          <option disabled={true}>Select </option>
          {groupByKeyList.map((val) => (
            <option style={{ fontSize: `${fontSize}px` }} key={val} value={val}>
              {val}
            </option>
          ))}
        </Form.Select>
        {/* </div> */}
        {/* <div onClick={() => createDataByKey(groupByKey)}> */}
        <div onClick={(e) => getSpanDataByZerodha(groupByKey)} style={{ fontSize: `${fontSize + 1}px` }}>
          <TbReload />
        </div>
        {/* <div className={mgStyle.groupSetting} onClick={marExpoSetting}>
          <SlSettings />
        </div> */}
      </div>
      <div className={`${mgStyle.mgAndExpoContent} mgAndExpoContent`}>
        <p onClick={marginTable} style={{ fontSize: `${fontSize + 3}px` }}>Margin (in Cr.)</p>
        <div style={{ width: "100%", height: "85%" }}>
          {/* <div className={mgStyle.chartSection}> */}
          <Bar data={marginData.data1} options={options} updateMode="active" />
          {/* </div> */}
        </div>
      </div>
      <div className={`${mgStyle.mgAndExpoContent} mgAndExpoContent`}>
        <p onClick={ExpoGroupTableShow} style={{ fontSize: `${fontSize + 3}px` }}>Expo (in Cr.)</p>
        <div style={{ width: "100%", height: "85%" }}>
          {/* <div className={mgStyle.chartSection}> */}
          <Bar
            data={marginData.data2}
            options={options}
            redraw={false}
            updateMode="active"
          />

          {/* </div> */}
        </div>
      </div>
      {/* <ModalPopup
        fullscreen={true}
        title={"Margin Group"}
        flag={showMargin}
        close={marginTable}
        component={<MarginGroupTable />}
      />
      <ModalPopup
        fullscreen={true}
        title={"Expo Group"}
        flag={showExpoGroup}
        close={ExpoGroupTableShow}
        component={<ExpoGroupTable />}
      /> */}
      {/* <ModalPopup
        size={"xl"}
        fullscreen={false}
        title={"Edit Margin & Expo Grouping"}
        flag={showEditeGroupSetting}
        close={marExpoSetting}
        component={"check box"}
      /> */}
      <div>
        <Notification
          notify={NotifyData}
          CloseError={CloseError}
          CloseSuccess={CloseSuccess}
        />
      </div>
    </div >
  );
};

export default memo(MarginAndExpoGroup);
