import { useEffect, useState } from "react";
import { POST_COMPONENTSETTING_API } from "../../API/ApiServices";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { SelectedSymbolsAndExchangeAction } from "../../Redux/RMSAction";
import { saveToLS } from "../Dashboard/DashbordWindow/DashboardWindow";
import dstyle from "./DynamicCom.module.scss";
import { componentSettingfetchid } from "../Dashboard/Dashboard";

const SymbolList = ({ componentName, selectedCurrencyINR, symbSetting }) => {
  const [symbolList, setSymbolList] = useState([]);
  const dispatch = useDispatch();
  const selectedSymbolsAndExchange = useSelector(
    (state) => state?.selectedSymbolsAndExchange
  );
  const position = useSelector((state) => state?.positionChart);
  // useEffect(() => {
  //   (async () => {
  //     try {
  //       if (componentName != "SymbolLimits" && selectedCurrencyINR[0] != "USD") {
  //         setSymbolList([...new Set(position?.map(obj => `${obj.symbol}`))]);
  //       }
  //       // const apiData = await GET_FILTERS_API({ event: "getallfilters" });
  //       // // console.log(apiData);
  //       // if (apiData) {
  //       //   console.log("selectedCurrencyINR[0]", componentName, selectedCurrencyINR[0]);
  //       //   if (componentName != "SymbolLimits" && selectedCurrencyINR[0] != "USD") {
  //       //     setSymbolList(apiData?.data?.result?.symbols);
  //       //   }
  //       // }
  //     } catch (error) {
  //       console.log("error", error);
  //     }
  //   })();
  // }, []);


  useEffect(() => {
    if (componentName == "SymbolLimits" && selectedCurrencyINR[0] == "USD") {
      console.log("filteredsymbols", (position?.filter(obj => obj.basecurrency.toLowerCase() == "usd").map(obj => obj.symbol)));

      setSymbolList([...new Set(position?.filter(obj => obj.basecurrency.toLowerCase() == "usd").map(obj => obj.symbol))])
    } else if (componentName != "SymbolLimits" && selectedCurrencyINR[0] == "INR") {
      setSymbolList([...new Set(position?.filter(obj => obj.basecurrency.toLowerCase() == "inr").map(obj => obj.symbol))])
    }
    else {
      setSymbolList([...new Set(position?.map(obj => `${obj.symbol}`))]);
    }
  }, [position, selectedCurrencyINR])


  const handleCheckboxChange = async (e) => {
    // let updatedExchange = [];
    // let updatedSymbol = [];

    const { name, value } = e.target;
    const updatedOptions = { ...selectedSymbolsAndExchange };

    if (!updatedOptions[componentName]) {
      updatedOptions[componentName] = []; // Initialize the array if it doesn't exist
    }

    if (updatedOptions[componentName].includes(value)) {
      // If the value is already in the array, remove it
      updatedOptions[componentName] = updatedOptions[componentName].filter(
        (symbol) => symbol !== value
      );
    } else {
      // If the value is not in the array, add it
      updatedOptions[componentName].push(value);
    }

    // Update the state with the new selected options
    // setSelectedOptions(updatedOptions);
    dispatch(SelectedSymbolsAndExchangeAction(updatedOptions));


    // const componentSettingPost = await POST_COMPONENTSETTING_API({
    //   event:
    //     selectedSymbolsAndExchange?.[componentName]?.length > 0 ? "update" : "create",
    //   data: {
    //     // id: 40,
    //     componentname: "selectedSymbolAndExchangeComponent",
    //     componenttype: "selectedSymbolAndExchange",

    //     setting: updatedOptions,
    //   },
    // })
    // if (e.target.name == "symbol") {
    //     updatedSymbol = selectedOptions[componentName].includes(e.target.value)
    //         ? selectedOptions[componentName].filter((symbol) => symbol !== e.target.value)
    //         : [...selectedOptions[componentName], e.target.value];

    //     setSelectedOptions(updatedSymbol);
    // }
  };

  const handleSave = async () => {
    saveToLS("ExchangeAndSymbolSettings", selectedSymbolsAndExchange);
    const componentSettingPost = await POST_COMPONENTSETTING_API({
      event:
        componentSettingfetchid ? "update" : "create",
      data: {
        ...(componentSettingfetchid && { id: componentSettingfetchid }),
        componentname: "selectedSymbolAndExchangeComponent",
        componenttype: "selectedSymbolAndExchange",

        setting: selectedSymbolsAndExchange,
      },
    })
    // saveToLS("layouts", layouts);
    symbSetting();
  };
  // console.log("symbolList", symbolList, selectedSymbolsAndExchange);
  return (
    <div className={dstyle.symblFilterSection}>
      <div className="row">
        {symbolList?.map((item, i) => {
          return (
            <Form.Group className="mb-3 col-3">
              <Form.Check
                type="checkbox"
                label={item}
                name="symbol"
                id={item}
                value={item}
                checked={selectedSymbolsAndExchange?.[componentName]?.includes(
                  item
                )}
                onChange={handleCheckboxChange}
              />
            </Form.Group>
          );
        })}
      </div>
      <div className={dstyle.btnSection}>
        <button onClick={handleSave}>save</button>
      </div>
    </div>
  );
};

export default SymbolList;
