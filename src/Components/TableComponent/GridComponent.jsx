import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { shallowEqual, useSelector } from "react-redux";


import { formatValue } from "../../UtilityFunctions/grid";
import useGridSettings from "../CustomHook/useGridSettings";
import { Notification } from "../DynamicComp/Notification";


const defaultPinnedRow = { positionno: "Total", bfqty: 0, buyqty: 0, sellqty: 0, netqty: 0, cfqty: 0 }

function GridComponent({
  tableData,
  groupData,
  excludeColumns,
  table,
  view,
  onDataFromTable,
}) {
  const [filterSetting, setFilterSetting] = useState({});
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const mtm = useSelector((state) => state?.mtm, shallowEqual);
  const positionType = useSelector(
    (state) => state.positionTypeInMtm,
    shallowEqual
  );

  const PositionChartFilters = useSelector(
    (state) => state.AllChartFiltersAction,
    shallowEqual
  );

  const gridRef = useRef();



  let componentName =
    table == "mtm"
      ? `${table}_${positionType}_${view}`
      : `${table}_${view}_${PositionChartFilters?.PositionExchange}`;

  const componentInfoRef = useRef({ componentname: componentName, componenttype: "table" })

  // const defaultColDef = useMemo(() => {
  //   return {
  //     // editable: true,
  //     sortable: true,
  //     flex: 1,
  //     minWidth: 100,
  //     // // filter: true,
  //     resizable: true,
  //     // filter: "agTextColumnFilter",
  //     floatingFilter: false,
  //     // cellDataType: false,
  //     width: 100,
  //     editable: true,
  //     filter: "agTextColumnFilter",
  //     // menuTabs: ["filterMenuTab"],
  //   };
  // }, []);



  // useEffect(() => {
  //   // let componentName =
  //   //   table == "mtm" ? `${table}_${positionType}_${view}` : `${table}_${view}`;
  //   (async () => {
  //     try {
  //       const componentSettingfetch = await GET_COMPONENTSETTING_API({
  //         componentname: componentName,
  //       });
  //       setFilterSetting(componentSettingfetch?.data?.result?.table);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   })();
  // }, []);


  // useEffect(() => {
  //   if (tableData.length > 0) {
  //     if (table === "position") {
  //       filterSetting?.setting?.filters
  //         ? gridRef.current.api.setFilterModel(filterSetting?.setting.filters)
  //         : gridRef.current.api.setFilterModel({
  //           exchange: {
  //             values: PositionChartFilters?.PositionExchange
  //               ? [PositionChartFilters.PositionExchange]
  //               : [],
  //             filterType: "set",
  //           },
  //         });
  //     } else {
  //       gridRef.current.api.setFilterModel(filterSetting?.setting.filters);
  //     }

  //     // gridRef.current.api.
  //   }
  // }, [tableData]);

  useEffect(() => {
    if (!ws.status) return;
    if (table === "mtm" && positionType === "bf") return;

    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "netposition") {
        const rowNode = gridRef.current.api.getRowNode(
          newData.data.positionno
        )?.id;
        const newNode =
          newData.data.basecurrency === "USD"
            ? {
              ...newData.data,
              arbmtm: newData.data.netmtm * newData.data.usdrate,
            }
            : newData.data;

        if (rowNode) {
          gridRef.current.api.applyTransactionAsync({
            update: [newNode],
          });
        } else {
          gridRef.current.api.applyTransactionAsync({
            add: [newNode],
          });
        }
      }

      if (newData.event === "ticker") {
        if (table === "mtm") {
          gridRef.current.api.forEachNode((rowNode) => {
            if (rowNode.data) {
              if (rowNode.data.token == newData.data.token) {
                let node = {
                  ...rowNode.data,
                  grossmtm:
                    rowNode.data.cfamt +
                    rowNode.data.cfqty *
                    newData.data.data.ltp *
                    rowNode.data.multiplier,
                };
                gridRef.current.api.applyTransactionAsync({
                  update: [node],
                });
              }
            }
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
  }, [ws]);

  const getRowId = useCallback((params) => {
    return params.data.positionno;
  });

  const autoGroupColumnDef = useMemo(() => {
    return {
      minWidth: 300,
      pinned: "left",
    };
  }, []);

  // const filterByDollarMtm = (node) => {
  //   {
  //     if (node.data.basecurrency === "USD") {
  //       return true;
  //     }
  //     return false;
  //   }
  // };



  // const columnCreation = useMemo(() => {
  //   let columns = [];

  //   if (tableData) {
  //     // console.log(gridRef.current.api.getFilterModel());

  //     for (let key in tableData[0]) {
  //       if (!excludeColumns.includes(key)) {
  //         if (groupData.indexOf(key) > -1) {
  //           columns.push({
  //             field: key, rowGroup: true, hide: true, filter: true, sortable: true, rowGroupIndex: groupData.indexOf(key),
  //           });
  //         } else if (["grossmtm", "netmtm", "charges", "companynetmtm"].indexOf(key) > -1) {
  //           columns.push({
  //             hide: table == "position" ? true : false,
  //             headerName: key.toUpperCase(),
  //             field: key,
  //             sortable: true,
  //             filter: false,
  //             valueFormatter: formatValue,
  //             aggFunc: "sum",
  //             cellStyle: redGreenRowText
  //           });
  //         } else if (key === "arbmtm") {
  //           columns.push({
  //             hide: table == "position" ? true : mtm === "usd" || mtm === "" ? true : false,

  //             headerName: key.toUpperCase(),
  //             field: key,
  //             sortable: true,
  //             filter: false,
  //             valueFormatter: formatValue,
  //             aggFunc: "sum",
  //             cellStyle: redGreenRowText
  //           });
  //         } else if (key.includes("qty")) {
  //           columns.push({
  //             hide: table == "mtm" ? true : false,
  //             headerName: key.toUpperCase(),
  //             field: key,
  //             sortable: true,
  //             filter: false,
  //             aggFunc: "sum",
  //             valueFormatter: formatValue,
  //           });
  //         } else if (["segment", "clustername"].indexOf(key) > -1) {
  //           columns.push({
  //             headerName: key,
  //             field: key,
  //             sortable: true,
  //             filter: true,
  //             hide: true,
  //           });
  //         } else {
  //           columns.push({
  //             headerName: key,
  //             field: key,
  //             sortable: true,
  //             // filter: false,
  //           });
  //         }
  //       }
  //     }
  //   }
  //   if (view == "symbol" && table == "position") {
  //     for (let i = 0; i < columns.length; i++) {
  //       if (columns[i]["field"] == "exchange") {
  //         columns[i] = {
  //           field: "exchange",
  //           headerName: "Exchange",
  //           filter: true,
  //           hide: true,
  //           rowGroup: false,
  //         };
  //       }
  //     }
  //   }

  //   return columns;
  // }, [tableData]);

  function generateColDef(key) {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, hide: true, filter: false }
    if (groupData.indexOf(key) > -1) {
      option['filter'] = true
      option['rowGroup'] = true
      option['rowGroupIndex'] = groupData.indexOf(key)

    }

    if (key.indexOf('qty') > -1) {
      option['aggFunc'] = "sum"
      option['valueFormatter'] = formatValue
      option['hide'] = false

    }
    return option
  }
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


  const { gridProps, onReady, GridNotifyData } = useGridSettings({
    gridApi: gridRef,
    componentInfo: componentInfoRef.current,
    // onReload: onGridReady,
    colDef: { generateColDef, row: tableData[0] },
    // groupBy: ["basecurrency"],
    settings: {
      sideBar: true
    }
  })
  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };

  useEffect(() => {
    setNotifyData(GridNotifyData)
  }, [GridNotifyData])
  useEffect(() => {
    if (!tableData?.length) return
    onReady()
  }, [tableData])

  // const sideBar = useMemo(() => {
  //   return {
  //     toolPanels: ["filters"],
  //   };
  // }, []);

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

  //   // const componentSetting = await POST_COMPONENTSETTING_API(tableSetting);
  //   // console.log(componentSetting);
  // };

  const [pinnedRow, setPinnedRow] = useState(defaultPinnedRow)

  const handleTotal = () => {
    const pinnedRowNode = gridRef.current?.api?.getPinnedBottomRow(0);
    const trow = { ...pinnedRowNode, ...defaultPinnedRow }


    gridRef.current.api.forEachNodeAfterFilterAndSort(({ data }) => {
      if (data) {
        trow["bfqty"] += data["bfqty"]
        trow["buyqty"] += data["buyqty"]
        trow["sellqty"] += data["sellqty"]
        trow["netqty"] += data["netqty"]
        trow["cfqty"] += data["cfqty"]
      }
    })
    setPinnedRow(trow)
    // gridRef.current.api.setPinnedBottomRowData([trow])
  }

  return (
    <>
      <AgGridReact
        {...gridProps}
        onModelUpdated={handleTotal}
        // className="ag-theme-alpine"
        getRowId={getRowId}
        ref={gridRef}
        onGridReady={handleTotal}
        // columnDefs={columnCreation}
        rowData={tableData}
        // asyncTransactionWaitMillis={500}
        pagination={true}
        paginationPageSize={50}
        animateRows={false}
        rowSelection={"multiple"}
        autoGroupColumnDef={autoGroupColumnDef}
        // groupIncludeTotalFooter={true}
        // groupIncludeFooter={true}
        // maintainColumnOrder={true
        groupDisplayType={"singleColumn"}
        // sideBar={{ toolPanels: ["filters"] }}
        // sideBar={sideBar}
        // showOpenedGroup={true}
        suppressAggFuncInHeader={true}
        // defaultColDef={defaultColDef}
        pinnedBottomRowData={[pinnedRow]}
      // onFilterChanged={() => {
      //   // let filterModel = gridRef.current.api.getFilterModel();
      //   handleComponentSetting();
      // }}
      // isExternalFilterPresent={() => (mtm === "dollarMtm" ? true : false)}
      // doesExternalFilterPass={(node) => filterByDollarMtm(node)}
      // onFilterModified={handleComponentSetting}
      // onRowGroupOpened={() => {
      //   if (mtm !== "arb") return;
      //   gridRef.current.api.forEachNode((node) => {
      //     if (node.level == 1) {
      //       gridRef.current.api.setRowNodeExpanded(node, false, false);
      //     }
      //   });
      // }}
      />
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </>
  );
}

export default React.memo(GridComponent);
