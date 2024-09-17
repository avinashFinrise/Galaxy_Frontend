import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { GET_NETPOSITION_API } from "../../../API/ApiServices";
import { Notification } from "../../DynamicComp/Notification";
import tableStyle from "./MtmPopupTable.module.scss";

const PosSummary = () => {
  const [posSummaryData, setPosSummaryData] = useState([]);
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
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const gridRef = useRef();
  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };

  useEffect(() => {
    (async () => {
      try {
        setNotifyData((data) => ({
          ...data,
          loadingFlag: true,
          loadingMsg: "Fetching position Summary Data...",
        }));
        const apicall = await GET_NETPOSITION_API({
          event: "getpositionsummary",
        });
        if (apicall.status == 200) {
          setPosSummaryData(
            apicall.data.result.map((val) => {
              return {
                ...val,
                uniqueKey: `${val.userid_id}_${val.group_id}_${val.cluster_id}_${val.basecurrency}`,
              };
            })
          );
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
            };
          });
        }
      } catch (error) {
        console.log(error);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            // confirmFlag: false,
            errorFlag: true,
            errorMsg: "something went wrong",
            headerMsg: error.code,
          };
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!ws.status) return;

    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      let formattedData = {
        ...newData.data,
        uniqueKey: `${newData.data.userid_id}_${newData.data.group_id}_${newData.data.cluster_id}_${newData.data.basecurrency}`,
      };
      if (newData.event === "position_summary") {
        const rowNode = gridRef.current.api.getRowNode(
          formattedData.uniqueKey
        )?.id;

        if (rowNode) {
          gridRef.current.api.applyTransactionAsync({
            update: [formattedData],
          });
        } else {
          gridRef.current.api.applyTransactionAsync({
            add: [formattedData],
          });
        }
      }

      // if (newData.event === "ticker") {
      //   if (table === "mtm") {
      //     gridRef.current.api.forEachNode((rowNode) => {
      //       if (rowNode.data) {
      //         if (rowNode.data.token === newData.data.token) {
      //           let node = {
      //             ...rowNode.data,
      //             grossmtm:
      //               rowNode.data.cfamt +
      //               rowNode.data.cfqty *
      //                 newData.data.data.ltp *
      //                 rowNode.data.multiplier,
      //             netmtm: node.grossmtm - node.charges,
      //           };
      //           gridRef.current.api.applyTransactionAsync({
      //             update: [node],
      //           });
      //         }
      //       }
      //     });
      //   }
      // }
    };
    ws.connection.addEventListener("message", eventListener);

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  const columnCreation = useMemo(() => {
    let columns = [];
    if (posSummaryData.length > 0) {
      for (let key in posSummaryData[0]) {
        if (
          ["userid_id", "group_id", "cluster_id", "uniqueKey"].indexOf(key) > -1
        ) {
          columns.push({
            field: key,
            headerName: key.toUpperCase(),
            hide: true,
          });
        } else {
          columns.push({
            field: key,
            headerName: key.toUpperCase(),
            sortable: true,
            filter: true,
          });
        }
      }
    }
    return columns;
  }, [posSummaryData]);

  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      sortable: true,
      flex: 1,
      minWidth: 100,
      width: 100,
      filter: true,
      resizable: true,
    };
  }, []);
  const sideBar = useMemo(() => {
    return {
      toolPanels: ["filters"],
    };
  }, []);

  const generatePinnedRow = useMemo(() => {
    const pinnedRow = {};
    for (let key in posSummaryData[0]) {
      if (typeof posSummaryData[0][key] == "number") {
        pinnedRow[key] = 0;
      } else {
        pinnedRow[key] = "";
      }
    }

    if (posSummaryData.length > 0) {
      posSummaryData.forEach((val) => {
        console.log(val);
        for (let key in pinnedRow) {
          if (typeof pinnedRow[key] == "number") {
            pinnedRow[key] += val[key];
          }
        }
      });
    }

    return [pinnedRow];
  }, [posSummaryData]);

  const filterChanged = () => {
    const pinnedRow = {};
    for (let key in posSummaryData[0]) {
      if (typeof posSummaryData[0][key] == "number") {
        pinnedRow[key] = 0;
      } else {
        pinnedRow[key] = "";
      }
    }

    gridRef.current.api.forEachNodeAfterFilter((node) => {
      for (let key in pinnedRow) {
        if (typeof pinnedRow[key] == "number") {
          pinnedRow[key] += node.data[key];
        }
      }
    });

    gridRef.current.api.setPinnedBottomRowData([pinnedRow]);
  };

  const getRowId = useCallback((params) => {
    return params.data.uniqueKey;
  });

  return (
    <div className={`popup-tableSection ${tableStyle.popupTableSection}`}>
      <div style={{ height: "86vh" }}>
        <AgGridReact
          className="ag-theme-alpine"
          ref={gridRef}
          rowData={posSummaryData}
          columnDefs={columnCreation}
          getRowId={getRowId}
          defaultColDef={defaultColDef}
          //   getRowStyle={getRowStyle}
          sideBar={sideBar}
          asyncTransactionWaitMillis={500}
          pagination={true}
          paginationPageSize={50}
          groupIncludeFooter={true}
          groupIncludeTotalFooter={true}
          pinnedBottomRowData={generatePinnedRow}
          onFilterChanged={filterChanged}
        />
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div>
  );
};

export default PosSummary;
