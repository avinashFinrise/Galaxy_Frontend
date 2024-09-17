import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GET_NETPOSITION_API } from "../../API/ApiServices";
import { shallowEqual, useSelector } from "react-redux";
import { AgGridReact } from "ag-grid-react";
import { formatValue } from "../../UtilityFunctions/grid";
import { Notification } from "../DynamicComp/Notification";
import useGridSettings from "../CustomHook/useGridSettings";

let excludeColumns = [
  "ex_buyamt",
  "ex_buyqty",
  "ex_charges",
  "ex_sellamt",
  "ex_sellqty",
  "arbmtm",
  "bfamt",
  "cfamt",
  "buyamt",
  "sellamt",
  "netamt",
  "id",
  "positionno",
  "sender",
  "userid_id",
  "ctclid",
  "accountcode",
  // "segment",
  "segment_id",
  "exchange_id",
  "securitytype",
  "securitytype_idmembercode",
  "multiplier",
  "divider",
  "token",
  "membercode",
  "securitytype_id",
  // "opttype",
  // "strikeprice",
  "date",
  "charges",
  "group_master_id",
  "ltp",
  "user_config_id",
  "group_config_id",
  "configname",
  "expirybuybrokrate",
  "expirysellbrokrate",
  "broktype",
  "brokersharingrate",
  "clientsharingrate",
  "comsharingrate",
  "usdcost",
  "isusdlive",
  "usdrate",
  "cluster_id",
  "group_id",
  // "clustername",
  "createddate",
  "updateddate",
  "configName",
  "cluster",
  "group_config",
  "user_config",
  "group",
  "user",
  "buybrokrate",
  "sellbrokrate",
  "basecurrency",
  // "exchange",
  "bfrate",
  "cfrate",
  "netrate",
  "buyrate",
  "sellrate",
  "netmtm",
  "grossmtm",
];

let defaultGroupingBySymbol = [
  "exchange",
  "symbol",
  "expirydate",
  "opttype",
  "strikeprice",
  "groupname",
  "userid",
];
let defaultGroupingByGroup = [
  "groupname",
  "userid",
  "exchange",
  "symbol",
  "expirydate",
  "opttype",
  "strikeprice",
];

const defaultColDef = {
  // editable: true,
  // sortable: true,
  flex: 1,
  minWidth: 100,
  // // filter: true,
  resizable: true,
  // filter: "agTextColumnFilter",
  floatingFilter: true,
  // cellDataType: false,
  width: 100,
  editable: true,
  filter: "agTextColumnFilter",
}

const defaultTotalRow = { bfqty: 0, buyqty: 0, sellqty: 0, netqty: 0, cfqty: 0 }



function CompanyPositionGrid({ view, dateRange }) {
  const [positionData, setPositionData] = useState([]);
  const [filterSetting, setFilterSetting] = useState({});
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const filterOptions = useSelector(
    (state) => state.AllChartFiltersAction,
    shallowEqual
  );
  const gridRef = useRef();

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

  // console.log(PositionChartFilters);

  const sharingKey = useMemo(() => {
    if (filterOptions.CPositionWiseCheckSharing === "Client") {
      return "clientsharingrate";
    } else if (filterOptions.CPositionWiseCheckSharing === "Broker") {
      return "brokersharingrate";
    } else if (filterOptions.CPositionWiseCheckSharing === "Cos") {
      return "comsharingrate";
    } else {
      return "comsharingrate";
    }
  }, [filterOptions.CPositionWiseCheckSharing]);
  const componentInfoRef = useRef({ componentname: `companyposition_${view}_${filterOptions.CPositinExchange}_${filterOptions.CPositionWiseCheckSharing}`, componenttype: 'table' })

  // const componentName = useMemo(() => {

  //   return `companyposition_${view}_${filterOptions.CPositinExchange}_${filterOptions.CPositionWiseCheckSharing}`;
  // }, [view, filterOptions.CPositinExchange, filterOptions.CPositionWiseCheckSharing]);

  const groupData = useMemo(() => {
    return view === "group" ? defaultGroupingByGroup : defaultGroupingBySymbol;
  }, [view]);

  const fetchApiData = async () => {
    try {
      setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: "Loading Netposition" })
      const positionApi = await GET_NETPOSITION_API({
        event: "getnetposition",
        data: dateRange,
      });
      setNotifyData({ ...NotifyData, loadingFlag: false })
      if (positionApi.data.result.length < 1) setNotifyData({ ...NotifyData, loadingFlag: false, errorFlag: true, errorMsg: 'Netposition is Empty' })
      setPositionData(calculateCompanyposition(positionApi.data.result));
      calculateTotal()
    } catch (error) {
      setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: error?.response?.data?.reason })
    }

  }


  useEffect(() => {
    fetchApiData();
    // (async () => {
    //   const positionApi = await GET_NETPOSITION_API({
    //     event: "getnetposition",
    //     data: dateRange,
    //   });

    //   if (positionApi) {
    //     setPositionData(calculateCompanyposition(positionApi.data.result));
    //     calculateTotal()
    //     // gridRef.current.api.setFilterModel({
    //     //   exchange: {
    //     //     values: [filterOptions.CPositinExchange],
    //     //     filterType: "set",
    //     //   },
    //     // });
    //   }
    //   try {
    //     const componentSettingfetch = await GET_COMPONENTSETTING_API({
    //       componentname: componentName,
    //     });
    //     setFilterSetting(componentSettingfetch?.data?.result?.table);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // })();
  }, []);

  // useEffect(() => {

  //   if (positionData.length > 0) {
  //     filterSetting?.setting?.filters
  //       ? gridRef.current.api.setFilterModel(filterSetting?.setting.filters)
  //       : gridRef.current.api.setFilterModel({
  //         exchange: {
  //           values: [filterOptions.CPositinExchange],
  //           filterType: "set",
  //         },
  //       });
  //   }
  // }, [positionData]);


  useEffect(() => {
    if (!ws.status) return;

    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "netposition") {
        const rowNode = gridRef.current.api.getRowNode(
          newData.data.positionno
        )?.id;
        if (rowNode) {
          gridRef.current.api.applyTransactionAsync({
            update: [
              calculateCompanypositionFromSocket(newData.data),
              // {
              //   ...newData.data,
              //   cfqty: newData["cfqty"] * (newData["comsharingrate"] / 100),
              //   cfamt: newData["cfamt"] * (newData["comsharingrate"] / 100),
              // },
            ],
          });
        } else {
          gridRef.current.api.applyTransactionAsync({
            add: [
              calculateCompanypositionFromSocket(newData.data),
              // {
              //   ...newData.data,
              //   cfqty: newData["cfqty"] * (newData["comsharingrate"] / 100),
              //   cfamt: newData["cfamt"] * (newData["comsharingrate"] / 100),
              // },
            ],
          });
        }
      }
    };
    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  const calculateCompanyposition = (arr) => {
    let newArr = arr.map((val) => {
      return {
        ...val,
        bfqty: val["bfqty"] * (val[sharingKey] / 100) * -1,
        sellqty: val["buyqty"] * (val[sharingKey] / 100),
        buyqty: val["sellqty"] * (val[sharingKey] / 100),
        netqty: val["netqty"] * (val[sharingKey] / 100) * -1,
        cfqty: val["cfqty"] * (val[sharingKey] / 100) * -1,

        // cfqty: val["cfqty"] * (val["comsharingrate"] / 100),
        // cfamt: val["cfamt"] * (val["comsharingrate"] / 100),

        // companynetmtm: val["netmtm"] * (val["comsharingrate"] / 100),
      };
    });

    return newArr;
  };

  const calculateCompanypositionFromSocket = (val) => {
    return {
      ...val,
      bfqty: val["bfqty"] * (val[sharingKey] / 100) * -1,
      sellqty: val["buyqty"] * (val[sharingKey] / 100) * -1,
      buyqty: val["sellqty"] * (val[sharingKey] / 100) * -1,
      netqty: val["netqty"] * (val[sharingKey] / 100) * -1,
      cfqty: val["cfqty"] * (val[sharingKey] / 100) * -1,
      // companynetmtm: val["netmtm"] * (val["comsharingrate"] / 100),
    };
  };

  const getRowId = useCallback((params) => {
    return params.data.positionno;
  });

  const autoGroupColumnDef = useMemo(() => {
    return {
      minWidth: 300,
      pinned: "left",
    };
  }, []);

  const generateColDef = useCallback((key) => {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, hide: true, filter: false, editable: false }

    if (groupData.indexOf(key) > -1) {
      option['rowGroup'] = true
      option['filter'] = true
      option['rowGroupIndex'] = groupData.indexOf(key)
    }

    if (key == 'clustername') {
      option['hide'] = true
      option['filter'] = true
    }

    if (key.includes("qty")) {
      option['hide'] = false
      option['aggFunc'] = "sum"
      option['valueFormatter'] = formatValue

    }


    return option
  }, [])

  const { gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo: componentInfoRef.current,
    onReload: fetchApiData,
    colDef: { generateColDef, row: positionData[0] },
    // groupBy: ["basecurrency"],
    settings: {
      sideBar: true
    }
  })
  useEffect(() => {
    setNotifyData(GridNotifyData)
  }, [GridNotifyData])

  useEffect(() => {
    if (!positionData?.length) return
    onReady()
  }, [positionData])


  // const columnCreation = useMemo(() => {
  //   let columns = [];
  //   if (positionData) {
  //     for (let key in positionData[0]) {
  //       if (!excludeColumns.includes(key)) {
  //         if (groupData.indexOf(key) > -1) {
  //           columns.push({
  //             field: key,
  //             rowGroup: true,
  //             hide: true,
  //             filter: true,
  //             rowGroupIndex: groupData.indexOf(key),
  //           });
  //         } else if (key.includes("qty")) {
  //           columns.push({
  //             headerName: key.toUpperCase(),
  //             field: key,
  //             sortable: true,
  //             filter: false,
  //             aggFunc: "sum",
  //             valueFormatter: formatValue,
  //           });
  //         } else if (["segment", "clustername"].indexOf(key) > -1) {
  //           columns.push({
  //             headerName: key.toUpperCase(),
  //             field: key,
  //             sortable: true,
  //             filter: true,
  //             hide: true,
  //           });
  //         } else {
  //           columns.push({
  //             headerName: key.toUpperCase(),
  //             field: key,
  //             sortable: true,
  //             // filter: false,
  //           });
  //         }
  //       }
  //     }
  //   }
  //   return columns;
  // }, [positionData]);

  const sideBar = useMemo(() => {
    return {
      toolPanels: ["filters"],
    };
  }, []);

  // const handleComponentSetting = () => {
  //   let tableSetting = {
  //     ...filterSetting,
  //     componentname: filterSetting?.componentname
  //       ? filterSetting?.componentname
  //       : componentName,
  //     componenttype: "table",
  //     setting: { filters: gridRef.current.api.getFilterModel() },
  //   };

  //   onDataFromTable(tableSetting);
  // };

  const [total, setTotal] = useState(defaultTotalRow)

  const calculateTotal = () => {
    const totalRow = { ...defaultTotalRow }
    gridRef.current.api.forEachNodeAfterFilterAndSort(({ data }) => {
      if (data) {
        Object.keys(defaultTotalRow).forEach(k => totalRow[k] += data[k])
      }
    })
    setTotal(totalRow)
    // gridRef.current.api.setPinnedBottomRowData([totalRow])

  }

  return (
    <>
      <div style={{ height: '80vh' }}>
        <AgGridReact
          {...gridProps}
          // className="ag-theme-alpine"
          getRowId={getRowId}
          ref={gridRef}
          // columnDefs={columnCreation}
          rowData={positionData}
          // asyncTransactionWaitMillis={500}
          pagination={true}
          paginationPageSize={50}
          animateRows={false}
          rowSelection={"multiple"}
          autoGroupColumnDef={autoGroupColumnDef}
          pinnedBottomRowData={[total]}

          onModelUpdated={calculateTotal}
          // maintainColumnOrder={true}
          groupDisplayType={"singleColumn"}
          // sideBar={{ toolPanels: ["filters"] }}
          // sideBar={sideBar}
          // showOpenedGroup={true}
          suppressAggFuncInHeader={true}
        // defaultColDef={defaultColDef}
        // onFilterChanged={() => {
        //   handleComponentSetting();
        //   calculateTotal()
        // }}
        />
      </div>
      <div>
        <Notification
          notify={NotifyData}
          CloseError={CloseError}
          CloseSuccess={CloseSuccess}
        />
      </div>

    </>
  );
}

export default React.memo(CompanyPositionGrid);
