import { useEffect, useState } from "react";
import { POST_COMPONENTSETTING_API } from "../../API/ApiServices";
import { Form } from "react-bootstrap";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { SelectedSymbolsAndExchangeAction } from "../../Redux/RMSAction";
import { saveToLS } from "../Dashboard/DashbordWindow/DashboardWindow";
import dstyle from "./DynamicCom.module.scss";
import { componentSettingfetchid } from "../Dashboard/Dashboard";

const ExchangeList = ({ componentName, positonProductSetting }) => {
  const [exchageList, setExchageList] = useState([]);
  const [updatedOptionsState, setUpdatedOptionsState] = useState()
  const dispatch = useDispatch();
  const selectedSymbolsAndExchange = useSelector(
    (state) => state?.selectedSymbolsAndExchange,
    shallowEqual
  );
  const [updatedOptions, setUpdatedOptions] = useState({ ...selectedSymbolsAndExchange })
  const position = useSelector((state) => state?.positionChart);

  useEffect(() => {
    (async () => {
      try {
        setExchageList([...new Set(position?.map(obj => `${obj.exchange}`))]);
        // const apiData = await GET_FILTERS_API({ event: "getallfilters" });
        // console.log(apiData);
        // if (apiData) {
        //   console.log("apiData", apiData);
        //   setExchageList(apiData?.data?.result?.exchange);
        // }
      } catch (error) {
        console.log("apiCall", error);
      }
    })();
  }, []);
  const handleCheckboxChange = async (e) => {
    // let updatedExchange = [];
    // let updatedSymbol = [];

    const { name, value } = e.target;
    // const updatedOptions = { ...selectedSymbolsAndExchange };
    setUpdatedOptions(prev => ({
      ...prev,

      [componentName]: prev?.[componentName]?.includes(value) ? prev?.[componentName]?.filter(
        (exchange) => exchange !== value
      ) : [...prev?.[componentName], value]
    }))
    console.log({ updatedOptions });

    // if (!updatedOptions[componentName]) {
    //   updatedOptions[componentName] = []; // Initialize the array if it doesn't exist
    // }

    // if (updatedOptions[componentName].includes(value)) {
    //   // If the value is already in the array, remove it
    //   updatedOptions[componentName] = updatedOptions[componentName].filter(
    //     (exchange) => exchange !== value
    //   );
    // } else {
    //   // If the value is not in the array, add it
    //   // updatedOptions[componentName].push(value);
    //   updatedOptions[componentName] = [...updatedOptions[componentName], value];
    // }
    // Update the state with the new selected options
    // setSelectedOptions(updatedOptions);

    // const componentSettingPost = await POST_COMPONENTSETTING_API({
    //   event:
    //     selectedSymbolsAndExchange?.[componentName]?.length > 0 ? "update" : "create",
    //   data: {
    //     id: componentSettingfetchid,
    //     componentname: "selectedSymbolAndExchangeComponent",
    //     componenttype: "selectedSymbolAndExchange",

    //     setting: updatedOptions,
    //   },
    // })
    // setUpdatedOptionsState(updatedOptions)
    // dispatch(SelectedSymbolsAndExchangeAction(updatedOptions));

    // if (e.target.name == "symbol") {
    //     updatedSymbol = selectedOptions[componentName].includes(e.target.value)
    //         ? selectedOptions[componentName].filter((symbol) => symbol !== e.target.value)
    //         : [...selectedOptions[componentName], e.target.value];

    //     setSelectedOptions(updatedSymbol);
    // }
  };
  const handleSave = async () => {
    saveToLS("ExchangeAndSymbolSettings", updatedOptions);
    dispatch(SelectedSymbolsAndExchangeAction(updatedOptions));
    // saveToLS("layouts", layouts);
    const componentSettingPost = await POST_COMPONENTSETTING_API({
      event:
        componentSettingfetchid !== undefined || null ? "update" : "create",
      data: {
        ...(componentSettingfetchid && { id: componentSettingfetchid }),
        componentname: "selectedSymbolAndExchangeComponent",
        componenttype: "selectedSymbolAndExchange",

        setting: updatedOptions,
      },
    })
    console.log("selectedSymbolsAndExchange", updatedOptions);
    positonProductSetting();
  };
  // console.log("exchageList", exchageList, selectedSymbolsAndExchange);
  return (
    <div className={dstyle.exchFilterSection}>
      <div className="row">
        {exchageList?.map((item, i) => {
          return (
            <Form.Group className="mb-3 col-md-3  col-6">
              <Form.Check
                type="checkbox"
                label={item}
                name="symbol"
                id={item}
                value={item}
                checked={updatedOptions?.[componentName]?.includes(
                  item
                )}
                onChange={handleCheckboxChange}
              // onChange={(e) => props.handleUserPermision(e)}
              // checked={props.data.permissions.isdashboard}
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

export default ExchangeList;
