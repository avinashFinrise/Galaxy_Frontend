import { useEffect, useState } from "react";
import dashStyle from "./Dashboard.module.scss";
import { GET_COMPONENTSETTING_API } from "../../API/ApiServices";
import { shallowEqual, useSelector } from "react-redux";
import { BsFillCaretDownFill, BsFillCaretUpFill } from "react-icons/bs";
import { SlSettings } from "react-icons/sl";
import { ModalPopup } from "../DynamicComp";
import { SymbolsList } from "./SymbolsList";

const componentInfo = { componentname: "selectedSymbolsInPriceCard", componenttype: "selectedSymbolsInPriceCard" }

const DashboardBottom = () => {
  const [symbolList, setSymbolList] = useState([]);
  const [SelectedSymbols, setSelectedSymbols] = useState([]);
  const [settings, setSettings] = useState({})
  const [showOptions, setShowoptions] = useState(false)
  let netposition = useSelector((state) => state?.Netposition, shallowEqual);
  let ws = useSelector((state) => state?.websocket, shallowEqual);

  let uniqueTokens = [];

  const findUniqueSymbols = (arr) => {
    let unique = arr.reduce((accumulator, currentObject) => {
      const combination = `${currentObject.symbol}_${currentObject.securitytype}`;
      if (
        !accumulator.some((obj) => {
          return `${obj.symbol}_${obj.securitytype}` === combination;
        }) &&
        (currentObject.securitytype.toUpperCase() === "FUTIDX" ||
          currentObject.securitytype.toUpperCase() === "FUTURE" ||
          currentObject.securitytype.toUpperCase() === "FUTSTK")
      ) {
        accumulator.push({
          ...currentObject,
          change:
            currentObject.bfrate > 0
              ? ((currentObject.ltp - currentObject.bfrate) /
                currentObject.bfrate) *
              100
              : 0,
        });
      }

      return accumulator;
    }, []);
    // console.log(unique);
    return unique;
  };

  //------------------------function to get current month and year------------------------------------------
  // const currentMonth = (expiryDate) => {
  //   let flag = false;
  //   var currentDate = new Date();
  //   var expiryMonth = expiryDate.substring(2, 5);
  //   var expiryYear = parseInt(expiryDate.substring(5));

  //   var currentMonth = currentDate.toLocaleString("default", {
  //     month: "short",
  //   });
  //   var currentYear = currentDate.getFullYear();
  //   if (expiryMonth === currentMonth && expiryYear === currentYear) {
  //     flag = true;
  //   }
  //   return flag;
  // };

  function compare(a, b) {
    if (a.symbol < b.symbol) {
      return -1;
    }
    if (a.symbol > b.symbol) {
      return 1;
    }
    return 0;
  }

  const fetchComponentSetting = () => {
    const componentSetting = new Promise((resolve, reject) => {
      resolve(GET_COMPONENTSETTING_API(componentInfo))
    })
    componentSetting.then(res => {

      setSettings(res.data.result[componentInfo.componentname]);
    }).catch(err => {
      console.log(err);
    })
  }

  useEffect(() => {
    fetchComponentSetting();
  }, [])


  useEffect(() => {
    if (netposition.length > 0) {

      const filtered = netposition.filter(
        (val) => val.securitytype.indexOf("FUT") > -1 && val.cfqty !== 0
      );
      let filteredAndSorted = filtered.sort(compare);
      const uniqueSymbols = filteredAndSorted.reduce((accumulator, current) => {
        const token = current.token;
        if (
          !accumulator.some((obj) => {
            return obj.token === token;
          })
        ) {
          accumulator.push({
            ...current,
            sym: `${current?.symbol}(${current.exchange}/${current.expirydate}/${current.segment})`,
            change:
              current.bfrate > 0
                ? ((current.ltp - current.bfrate) / current.bfrate) * 100
                : 0,
          });
        }
        return accumulator;
      }, []);
      // console.log(uniqueSymbols);

      setSymbolList(uniqueSymbols);
      if (settings?.id) {
        let temp = uniqueSymbols.filter(e => settings?.setting.dashboardbottom?.includes(e.sym))
        setSelectedSymbols(temp)
      }
      // setSettings(prev => ({
      //   ...prev,
      //   setting: {
      //     ...prev.setting,
      //     dashboardbottom: prev.setting.dashboardbottom.filter(e => uniqueSymbols.some(val => val.sym == e))
      //   }
      // }))
    }
  }, [netposition, settings]);

  const debounceData = []

  const updateSymbols = (newData) => {
    setSymbolList((symbolData) =>
      symbolData.map((val) => {
        return val.token === newData?.data.data.token
          ? {
            ...val,
            ltp: newData.data.data.ltp,
            change:
              val.bfrate > 0
                ? ((newData.data.data.ltp - val.bfrate) / val.bfrate) *
                100
                : 0,
          }
          : val;
      })
    );
  }


  useEffect(() => {
    if (!ws.status) return;
    let eventListener;
    let timeout = null

    let isUpdated = false

    eventListener = (e) => {
      let newData = JSON.parse(e.data);

      if (newData.event === "ticker") {
        if (!isUpdated) {
          isUpdated = true;
          timeout = setTimeout(() => {
            updateSymbols(newData)
            isUpdated = false
          }, 1000)
        }
      }
    };

    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
        clearTimeout(timeout)
      }
    };
  }, [ws.status]);

  // console.log(symbolList);

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleBoxSize = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleShowOptions = () => {
    showOptions
      ? setShowoptions(false)
      : setShowoptions(true);
  };

  const selectSymbolsFunction = (props) => {
    // console.log({ props });
    setSelectedSymbols(symbolList.filter(e => props.includes(e.sym)))
  }

  return (
    <div
      className={`${dashStyle.dashBottomSection} ${isExpanded ? dashStyle.expandedHeight : dashStyle.initialHeight} dashBottomSection`}
    // style={{ height: isExpanded ? expandedHeight : initialHeight }}
    >
      <div className={`${dashStyle.btnFeatureSection} btn-feature-section`}>
        <button onClick={toggleBoxSize}>
          {isExpanded ? <BsFillCaretDownFill /> : <BsFillCaretUpFill />}
        </button>
        <div className={dashStyle.symboleListContent}>
          <SlSettings onClick={() => setShowoptions(prev => !prev)} />
        </div>
      </div>
      <div className={`row ${dashStyle.dashbottomContent}  `}>
        {SelectedSymbols?.map((item) => {
          return (
            <div
              key={item?.token}
              className={`col-md-2 col-6 ${dashStyle.dashSingleContent}`}
            >
              <h6 className={`${dashStyle.itemHeading} itemHeading`}>
                {/* {item?.symbol} */}
                {item.sym}
              </h6>
              <p>
                <span>{item?.bfrate?.toFixed(2)}</span> |{" "}
                <span>{item?.ltp?.toFixed(2)}</span> |{" "}
                <span
                  style={{
                    color: item?.change > 0 ? "#06BE71" : "rgb(255, 0, 0)",
                  }}
                >
                  {item?.change.toFixed(2)}%
                </span>
                {/* | Change: */}
                {/* <span>{item?.change.toFixed(2)}%</span> */}
              </p>
            </div>
          );
        })}
      </div>
      <ModalPopup
        fullscreen={true}
        title={"Select Symbols"}
        flag={showOptions}
        close={toggleShowOptions}
        component={
          <SymbolsList
            allSymbols={symbolList}
            componentName="dashboardbottom"
            positonProductSetting={toggleShowOptions}
            selectSymbolsFunction={selectSymbolsFunction}
            settings={settings}
          />
        }
      />
    </div>
  );
};

export default DashboardBottom;
