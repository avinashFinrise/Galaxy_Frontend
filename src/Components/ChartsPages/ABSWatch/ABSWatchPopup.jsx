import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { MdAdd } from "react-icons/md";
import { shallowEqual, useSelector } from "react-redux";
import {
  GET_ARBWATCH_API,
  GET_STRATEGY_API,
  POST_SAVEARBWATCH_API,
} from "../../../API/ApiServices";
import { redGreenColBasedOnPrev } from "../../../UtilityFunctions/grid";
import { Notification } from "../../DynamicComp/Notification";
import absStyle from "./ABSWatch.module.scss";

const ABSWatchPopup = ({ addStrategyToABSwatch, AbsPopup }) => {
  const [arbData, setArbData] = useState([]);
  const [arbitrageList, setArbitrageList] = useState([]);
  const [strategylist, setStrategyList] = useState([]);
  const ws = useSelector((state) => state?.websocket, shallowEqual);
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
  const CloseConfirm = () => {
    setNotifyData((data) => ({ ...data, confirmFlag: false }));
  };
  let rowData = [
    {
      id: 0,
      products: "",
      l1buy: 0,
      l1sell: 0,
      l2buy: 0,
      l2sell: 0,
      l3buy: 0,
      l3sell: 0,
      buylive: 0,
      selllive: 0,
      strategy: 0,
      is_dashboard: false,
    },
  ];

  const onGridReady = useCallback(() => {
    (async () => {
      setNotifyData({
        loadingFlag: true,
        loadingMsg: "loading arsWatch strategy  data...",
      });
      const strategy = await GET_STRATEGY_API();
      if (strategy.status === 200) {
        setStrategyList(strategy.data.result);
        setNotifyData({
          loadingFlag: false,
          // successFlag: true,
          // // successMsg: apicall.data.status,
          // successMsg: strategy.data.status,
        });
      } else {
        setNotifyData({
          loadingFlag: false,
          errorFlag: true,
          errorMsg: "arsWatch strategy error",
        });
      }

      const getArbWatch = await GET_ARBWATCH_API();
      if (getArbWatch.status == 200) {
        if (getArbWatch.data.result.length < 1) return;
        if (ws.status) {
          getArbWatch.data.result.forEach((val) => {
            ws.connection.send(
              JSON.stringify({
                event: "subscribe",
                stream: "spread",
                strategyid: val.strategy,
              })
            );
          });
        }

        // getArbWatch.data.result.map((val) => {
        //   const rowdata = {
        //     ...val,
        //     ...rowData[0],
        //     id: val.id,
        //     products: val.strategyname,
        //     strategy: val.strategy,
        //     is_dashboard: val.is_dashboard,
        //   };
        //   gridRef?.current?.api?.applyTransactionAsync({
        //     add: [rowdata],
        //   });
        // });

        setArbitrageList(
          getArbWatch.data.result.map((val) => {
            return {
              ...val,
              ...rowData[0],
              id: val.id,
              products: val.strategyname,
              strategy: val.strategy,
              is_dashboard: val.is_dashboard,
            };
          })
        );
      } else {
        setNotifyData({
          loadingFlag: false,
          errorFlag: true,
          errorMsg: " Something went wrong in arsWatch strategy",
        });
      }

      // getArbWatch
      //   .then((res) => {
      //     console.log(res);
      //     // setArbData(res.data.result);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
    })();
  }, []);

  useEffect(() => {
    if (!ws.status) return;
    let eventListener;

    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "spread") {
        let arbList = gridRef.current.props.rowData;
        let id = arbList.find((val) => val.strategy == newData.data.strategy);

        const rowNode = gridRef?.current?.api?.getRowNode(
          newData.data.strategy
        );
        if (rowNode) {
          gridRef?.current?.api?.applyTransactionAsync({
            update: [
              {
                ...newData.data,
                id: id?.id,
                is_dashboard: id.is_dashboard,
                // strategy: newData.data.strategy,
                products: newData.data.strategyname,
                l3buy: newData.data.l3buy ? newData.data.l3buy : 0,
                l3sell: newData.data.l3sell ? newData.data.l3sell : 0,
                prev: rowNode.data
              },
            ],
          });
        }
        // if (rowNode) {
        // }
        // else {
        //   gridRef.current.api.applyTransactionAsync({
        //     add: [newData.data],
        //   });
        // }
      }
    };
    ws.connection.addEventListener("message", eventListener);

    strategylist?.length > 0 &&
      strategylist.forEach((val) => {
        ws.connection.send(
          JSON.stringify({
            event: "subscribe",
            stream: "spread",
            strategyid: val.strategy,
          })
        );
      });

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  !AbsPopup &&
    arbitrageList.forEach((val) => {
      !val.is_dashboard &&
        ws.connection.send(
          JSON.stringify({
            event: "unsubscribe",
            stream: "spread",
            strategyid: val.strategy,
          })
        );
    });

  const getRowId = useCallback((params) => {
    return params?.data?.strategy;
  });

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      flex: 1,
      minWidth: 100,
      // // filter: true,
      resizable: true,
      floatingFilter: false, // show or hide filter below column header
      // cellDataType: false,
      width: 100,
      editable: false,
      filter: "agTextColumnFilter",
      // menuTabs: ["filterMenuTab"],
    };
  }, []);

  const numberformatter = Intl.NumberFormat("en-US", {
    // style: "currency",
    // currency: "INR",
    maximumFractionDigits: 2,
  });

  let myValueFormatter = (p) => numberformatter.format(p.value);

  let columnCreation = useMemo(() => {
    let columns = [];
    for (let key in rowData[0]) {
      if (key == "products") {
        columns.push({
          field: key,
          editable: (params) => params.data.id == 0,
          headerName: key.toUpperCase(),
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: strategylist?.map((val) => val.strategyname),
            valueListGap: 0,
          },
        });
      } else if (key == "id") {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          // headerCheckboxSelection: true,
          checkboxSelection: true,
          showDisabledCheckboxes: true,
        });
      } else if (key.includes("buy") || key.includes("sell")) {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          valueFormatter: myValueFormatter,
          cellStyle: redGreenColBasedOnPrev,
          // cellStyle: (params) => {
          //   if (params.value >= 0) {
          //     return { color: "green" };
          //   } else {
          //     return { color: "red" };
          //   }
          // },
        });
      } else if (key == "is_dashboard") {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          cellEditor: "agCheckboxCellEditor",
          editable: true,
        });
      } else {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
        });
      }
    }
    return columns;
  }, [rowData]);

  const addNewProduct = () => {
    // setArbData([...arbData, rowData[0]]);

    gridRef.current.api.applyTransactionAsync({
      add: rowData,
    });

    // setArbitrageList((previous) => [...previous, rowData[0]]);
  };

  const deleteProduct = () => {
    let selectedNodes = gridRef.current.api.getSelectedNodes();
    let id = selectedNodes[0].data.id;
    console.log(selectedNodes);

    if (selectedNodes.length < 1) return;
    let selectedIds = [];
    selectedNodes.forEach((val) => selectedIds.push(val.data.id));
    const deleteArb = new Promise((resolve, reject) => {
      resolve(POST_SAVEARBWATCH_API({ event: "delete", data: { id: [id] } }));
    });
    deleteArb
      .then((res) => {
        gridRef.current.api.applyTransactionAsync({
          remove: [selectedNodes[0].data],
        });

        setArbitrageList((previous) => previous.filter((val) => val.id !== id));
        // setStrategyList((previous) =>
        //   previous.reduce((result, current) => {
        //     if (!selectedIds.some((val) => val == current.id)) {
        //       result.push(current);
        //     }
        //     return result;
        //   }, [])
        // );

        ws.connection.send(
          JSON.stringify({
            event: "unsubscribe",
            stream: "spread",
            strategyid: id,
          })
        );
        setNotifyData((data) => ({ ...data, confirmFlag: false }))

      })
      .catch((err) => {
        console.log(err);
      });
  };

  // const saveRowsForDashboard = async () => {
  //   const selectedDataForDashboard = gridRef.current.api.getSelectedNodes();
  //   const id = selectedDataForDashboard[0].data.id;
  //   console.log(selectedDataForDashboard);
  //   let dataToSend = {
  //     event: "update",
  //     data: {
  //       id: id,
  //       is_dashboard: !selectedDataForDashboard[0].data.is_dashboard,
  //     },
  //   };

  //   const arbWatch = await POST_SAVEARBWATCH_API(dataToSend);
  //   if (arbWatch.status == 200) {
  //     setArbitrageList((previous) =>
  //       previous.map((val) => {
  //         return val.id == selectedDataForDashboard[0].data.id
  //           ? { ...val, is_dashboard: true }
  //           : val;
  //       })
  //     );
  //   }
  // };

  // console.log(arbitrageList);

  const onCellValueChanged = (params) => {
    // console.log(params);

    const id = strategylist.find(
      (val) => val.strategyname == params.newValue
    )?.id;
    if (params.colDef.field == "products") {
      const saveArbWatch = new Promise((resolve, reject) => {
        resolve(
          POST_SAVEARBWATCH_API({
            event: "create",
            data: {
              strategy: id,
            },
          })
        );
      });
      saveArbWatch
        .then((res) => {
          console.log(res);
          const nodeToRemove = gridRef.current.api.getRowNode(0).data;

          //---------------------------------add row to grid----------------------------------
          // gridRef.current.api.applyTransactionAsync({
          //   add: [
          //     {
          //       ...res.data.result,
          //       products: res.data.result.strategyname,
          //       strategy: res.data.result.strategy,
          //       l1buy: 0,
          //       l1sell: 0,
          //       l2buy: 0,
          //       l2sell: 0,
          //       l3buy: 0,
          //       l3sell: 0,
          //       buylive: 0,
          //       selllive: 0,
          //     },
          //   ],
          //   remove: [nodeToRemove],
          // });
          //----------------------------------------------------------------------------------

          setArbitrageList((previous) => [
            ...previous,
            {
              ...res.data.result,
              products: res.data.result.strategyname,
              strategy: res.data.result.strategy,
              l1buy: 0,
              l1sell: 0,
              l2buy: 0,
              l2sell: 0,
              l3buy: 0,
              l3sell: 0,
              buylive: 0,
              selllive: 0,
            },
          ]);

          console.log(ws.status);
          ws.connection.send(
            JSON.stringify({
              event: "subscribe",
              stream: "spread",
              strategyid: res.data.result.strategy,
            })
          );
        })
        .catch((err) => {
          console.log(err);
          const nodeToRemove = gridRef.current.api.getRowNode(0).data;
          gridRef.current.api.applyTransactionAsync({
            remove: [nodeToRemove],
          });

          setNotifyData({
            loadingFlag: false,
            errorFlag: true,
            errorMsg: "error",
          });
        });
    }
    if (params.colDef.field == "is_dashboard") {
      let count = 0;
      gridRef.current.api.forEachNode((val) => {
        if (val.data.is_dashboard == true) {
          count += 1;
        }
      });
      if (count <= 10) {
        const id = params.data.id;
        let dataToSend = {
          event: "update",
          data: {
            id: id,
            is_dashboard: params.data.is_dashboard,
          },
        };
        const arb = new Promise((resolve, reject) => {
          resolve(POST_SAVEARBWATCH_API(dataToSend));
        });
        arb
          .then((res) => {
            if (params.data.is_dashboard) {
              let arbToAdd = arbitrageList.find((val) => val.id == id);
              addStrategyToABSwatch({ ...arbToAdd, is_dashboard: true });
            }

            setArbitrageList((previous) =>
              previous.map((val) => {
                return val.id == id
                  ? { ...val, is_dashboard: params.data.is_dashboard }
                  : val;
              })
            );
          })
          .catch((err) => {
            setNotifyData({
              errorFlag: true,
              errorMsg: "error adding strategy to dashboard",
            });
          });
      } else {
        setArbitrageList((previous) =>
          previous.map((val) => {
            return val.id == id ? { ...val, is_dashboard: false } : val;
          })
        );
        setNotifyData({
          errorFlag: true,
          errorMsg: "Only upto 10 strategies can be added to dashboard",
        });
      }
    }
  };

  return (
    <div className="absTableSection">
      <div className={absStyle.absTableHeader}>
        {/* <button className={absStyle.rowSaveBtn} onClick={saveRowsForDashboard}>
          <span className={absStyle.textBtnContent}>
            Save rows for Dashboard
          </span>
          <span className={absStyle.btnIcon}>
            <LiaSave />
          </span>
        </button> */}
        <button className={absStyle.deleteBtn}
          // onClick={() => deleteProduct()}
          onClick={(e) => {
            e.preventDefault();
            setNotifyData((data) => ({
              ...data,
              confirmFlag: true,
              confirmMsg: "Are you sure, You want to create group name ?",
              confirmAction: (e) =>
                deleteProduct(e)
            }))
          }}
        >
          <span className={absStyle.textBtnContent}>DELETE</span>
          <span className={absStyle.btnIcon}>
            <AiOutlineDelete />
          </span>
        </button>
        <button className={absStyle.addNewBtn} onClick={addNewProduct}>
          <span className={absStyle.textBtnContent}>Add NEW</span>
          <span className={absStyle.btnIcon}>
            <MdAdd />
          </span>
        </button>
      </div>
      <div className={absStyle.absWatchTable}>
        {/* <div className="popup-custom-table"> */}
        <AgGridReact
          gridOptions={{ headerHeight: 30, }}
          className="ag-theme-alpine"
          ref={gridRef}
          rowData={arbitrageList}
          columnDefs={columnCreation}
          getRowId={getRowId}
          defaultColDef={defaultColDef}
          // getRowStyle={getRowStyle}
          // sideBar={sideBar}
          asyncTransactionWaitMillis={500}
          pagination={true}
          paginationPageSize={50}
          onCellValueChanged={onCellValueChanged}
          rowSelection={"single"}
          onGridReady={onGridReady}
          suppressRowClickSelection={true}
          rowMultiSelectWithClick={true}

        // groupIncludeFooter={true}
        // groupIncludeTotalFooter={true}
        />
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
    </div>
  );
};

export default ABSWatchPopup;
