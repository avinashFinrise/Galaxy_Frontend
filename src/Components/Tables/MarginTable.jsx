import { useEffect, useState } from "react";
import useApi from "../CustomHook/useApi";
import { useSelector } from "react-redux";
import { Notification } from "../DynamicComp/Notification";
import GridComponent from "../TableComponent/GridComponent";

const MarginTable = () => {
  const [marginData, setMarginData] = useState([]);
  const { data, loading, error, makeApiCall } = useApi();
  const ws = useSelector((state) => state?.websocket);
  let excludeColumns = [];

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

  // const CloseConfirm = () => {
  //   setNotifyData((data) => ({ ...data, confirmFlag: false }));
  // };

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };

  useEffect(() => {
    // makeApiCall(GET_MARGIN_CHART_API, { event: "margin", type: "symbol" });
  }, []);

  useEffect(() => {
    if (loading) {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "loading...",
      }));
    }
    if (data?.httpstatus === 200 && !loading) {
      setMarginData(data?.result);
      setNotifyData((data) => ({ ...data, loadingFlag: false }));
      // setNotifyData(prev => { return { ...prev, loadingFlag: false, confirmFlag: false, successFlag: true, successMsg:data.status } })
    } else if (error) {
      console.log(error);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          // confirmFlag: false,
          errorFlag: true,
          errorMsg: "Something went wrong",
          headerMsg: error.code,
        };
      });
    }
  }, [data, error, loading]);

  // const convertToObject = (arr) => {
  //     const newObj = arr.reduce((objDict, obj) => {
  //         // objDict[obj.positionno] = obj;
  //         return objDict;
  //     }, {})
  //     return newObj;
  // }

  return (
    <>
      <div>
        {marginData && (
          <GridComponent
            tableData={marginData}
            //  defaultGrouping={defaultGroupingBySymbol}
            excludeColumns={excludeColumns}
          />
        )}
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      // CloseConfirm={CloseConfirm}
      />
    </>
  );
};

export default MarginTable;
