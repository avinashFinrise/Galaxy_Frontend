import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiFillDelete } from "react-icons/ai";
import { BiPlus } from "react-icons/bi";
import { IoExpand } from "react-icons/io5";
import { shallowEqual, useSelector } from "react-redux";
import {
  GET_ARBWATCH_API,
  POST_SAVEARBWATCH_API,
} from "../../../API/ApiServices";
import { redGreenColBasedOnPrev } from "../../../UtilityFunctions/grid";
import { ModalPopup } from "../../DynamicComp";
import { Notification } from "../../DynamicComp/Notification";
import CardFallback from "../../Fallback/CardFallback";
import absStyle from "./ABSWatch.module.scss";
import ABSWatchPopup from "./ABSWatchPopup";
import Addstrategy from "./Addstrategy";

const ABSWatch = ({ skeletonProps }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [arbData, setArbData] = useState([]);
  const [showAbsWatchTable, setShowAbsWatchTable] = useState(false);
  const [showCreateStrategy, setShowCreateStrategy] = useState(false);
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  const userControlSettings = useSelector((state) => state.userControlSettings, shallowEqual);
  // const userData=
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
  const absWatchTable = () => {
    showAbsWatchTable
      ? setShowAbsWatchTable(false)
      : setShowAbsWatchTable(true);
  };
  const toggleCreateStrategy = () => {
    setShowCreateStrategy(!showCreateStrategy);
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
      action: "",
    },
  ];

  const removeRowsFromDashboard = async () => {
    const selectedDataForDashboard = gridRef?.current?.api.getSelectedNodes();
    const id = selectedDataForDashboard[0].data.id;
    let dataToSend = {
      event: "update",
      data: {
        id: id,
        is_dashboard: false,
      },
    };

    const arbWatch = await POST_SAVEARBWATCH_API(dataToSend);
    if (arbWatch.status == 200) {
      gridRef.current.api.applyTransactionAsync({ remove: [selectedDataForDashboard[0].data] })
      // setArbData((previous) => previous.filter((val) => val.id !== id));
    }
  };
  const actionButton = (p) => (
    <>
      <AiFillDelete onClick={removeRowsFromDashboard} />
    </>
  );

  const onGridReady = useCallback(() => {
    setIsLoading(true);
    (async () => {
      // setNotifyData((data) => ({
      //   ...data,
      //   loadingFlag: true,
      //   loadingMsg: "fetching absWatch data ...",
      // }));

      const getArbWatch = await GET_ARBWATCH_API();
      if (getArbWatch.status == 200) {
        // console.log(getArbWatch);
        let dashboardData = [];
        // setNotifyData({
        //   loadingFlag: false,
        // });

        if (getArbWatch.data.result.length < 1) return;
        dashboardData = getArbWatch.data.result.filter(
          (val) => val.is_dashboard == true
        );

        setArbData(
          dashboardData.map((val) => {
            return {
              ...val,
              ...rowData[0],
              id: val.id,
              products: val.strategyname,
              strategy: val.strategy,
            };
          })
        );

        // dashboardData.map((val) => {
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
      } else {
        setNotifyData({ errorFlag: true, errorMsg: "absWatch error ", });
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
    setIsLoading(false)
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
                id: id.id,
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

    return () => {
      if (eventListener) {
        ws.connection.removeEventListener("message", eventListener);
      }
    };
  }, [ws.status]);

  useEffect(() => {
    if (!ws.status) return;
    if (arbData.length < 1) return;

    arbData.forEach((val) => {
      ws.connection.send(
        JSON.stringify({
          event: "subscribe",
          stream: "spread",
          strategyid: val.strategy,
        })
      );
    });

    return () => {
      if (arbData?.length > 0) {
        arbData.forEach((val) => {
          ws.connection.send(
            JSON.stringify({
              event: "unsubscribe",
              stream: "spread",
              strategyid: val.strategy,
            })
          );
        });
      }
    };
  }, [arbData, ws]);

  const getRowId = useCallback((params) => {
    return params?.data?.strategy;
  });

  const numberformatter = Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  });

  let myValueFormatter = (p) => numberformatter.format(p.value);
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
      floatingFilter: false

      // menuTabs: ["filterMenuTab"],
    };
  }, []);

  let columnCreation = useMemo(() => {
    let columns = [];
    for (let key in rowData[0]) {
      if (
        [
          "id",
          "is_dashboard",
          // "strategy",
          "l1buy",
          "l1sell",
          "l2buy",
          "l2sell",
          "l3buy",
          "l3sell",
        ].indexOf(key) > -1
      ) {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          // headerCheckboxSelection: true,
          // checkboxSelection: true,
          // showDisabledCheckboxes: true,
          hide: true,
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
      } else if (key == "action") {
        columns.push({
          field: key,
          headerName: key.toUpperCase(),
          cellRenderer: actionButton,
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

  const addStrategyToABSwatch = (data) => {
    setArbData((previous) => [...previous, data]);
  };

  return isLoading ? <CardFallback {...skeletonProps} /> : (
    <>
      <div className={absStyle.absSection}>
        <div className={absStyle.buttonSection}>
          {userControlSettings?.setting_control?.is_strategycreator && <button
            onClick={toggleCreateStrategy}
            className={`${absStyle.createBtn} dashCardHeaderBtn`}
          >
            <span className={absStyle.textBtnContent}>Create</span>
            <span className={absStyle.btnIcon}>
              <BiPlus />
            </span>
          </button>}
          <button
            onClick={absWatchTable}
            className={`${absStyle.expandBtn} dashCardHeaderBtn`}
          >
            <span className={absStyle.textBtnContent}>Select</span>
            <span className={absStyle.btnIcon}>
              <IoExpand />
            </span>
          </button>
        </div>
        <div style={{ height: "98%" }}>
          <AgGridReact
            gridOptions={{ headerHeight: 30, }}
            className="ag-theme-alpine"
            ref={gridRef}
            onGridReady={onGridReady}
            rowData={arbData}
            columnDefs={columnCreation}
            asyncTransactionWaitMillis={500}
            getRowId={getRowId}
            defaultColDef={defaultColDef}
            rowSelection={"single"}
          />
        </div>
        <Notification
          notify={NotifyData}
          CloseError={CloseError}
          CloseSuccess={CloseSuccess}
        />

        <ModalPopup
          fullscreen={true}
          title={"Add Strategy"}
          flag={showCreateStrategy}
          close={toggleCreateStrategy}
          component={<Addstrategy />}
        />
        <ModalPopup
          fullscreen={true}
          title={"ABS Watch"}
          flag={showAbsWatchTable}
          close={absWatchTable}
          component={
            <ABSWatchPopup
              addStrategyToABSwatch={addStrategyToABSwatch}
              AbsPopup={showAbsWatchTable}
            />
          }
        />
      </div>
    </>
  );
};

export default memo(ABSWatch);
