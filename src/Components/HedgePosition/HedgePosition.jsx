import { AgGridReact } from 'ag-grid-react'
import React, { useEffect, useRef, useState } from 'react';
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { GET_HEDGERATIO_API, GET_NETPOSITION_API, POST_COMPONENTSETTING_API, POST_HEDGERATIO_API } from '../../API/ApiServices';
import { Notification } from '../DynamicComp/Notification';
import { shallowEqual, useSelector } from 'react-redux';
import { hedgePosition } from '../../UtilityFunctions/MarginDataDef';
import useGridSettings from '../CustomHook/useGridSettings';

const rowStyle = (params) => {
  if (params.data && params.data.hedge_ratio >= Math.abs(params.data.out_qty)) {
    return { color: "green" };
  } else if (params.data && params.data.hedge_ratio < Math.abs(params.data.out_qty)) {
    return { color: "red" };
  }
  return null;
};

const componentInfo = { componentname: "hedgePosition", componenttype: "table" }

const saveColumns = (ref) => {
  const colState = ref.current.api.columnModel?.displayedColumns.map(val => val.colId);
  // const savedStae = e.columnApi.getColumnState();

  localStorage.setItem('hedgePositionVisibleColumns', JSON.stringify(colState))
}

async function onFiltersReset(ref, setting) {
  ref.current.api.setFilterModel(null)

  try {
    const { data } = POST_COMPONENTSETTING_API({ data: { ...componentInfo, id: setting.table.id, setting: { filters: null } }, event: "update" })
  } catch (e) {
    console.log({ e })
  }
}

let colSetting = {}

function HedgePosition() {
  const [hedgeData, setHedgeData] = useState([])
  const gridRef = useRef();
  // const [componentSetting, setComponentSetting] = useState({});
  const ws = useSelector((state) => state?.websocket, shallowEqual);
  // const columnState = localStorage.getItem('hedgePositionVisibleColumns') ? JSON.parse(localStorage.getItem('hedgePositionVisibleColumns')) : []

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

  const fetchData = () => {
    const allApis = [GET_NETPOSITION_API({ event: 'gethedgeposition' }), GET_HEDGERATIO_API()]
    const allApiData = Promise.all(allApis)
    allApiData.then(res => {
      const [hedgePosition, hedgeRatio] = res

      let mergedData = hedgePosition.data.result.reduce((acc, curr) => {
        let found = hedgeRatio.data.result.find(val => curr.userid_id == val.userid_id);

        if (found) {
          acc.push({ ...curr, hedge_ratio: found.hedge_ratio, out_qty: (curr.NSEIFSCQTY * found.hedge_ratio) + curr.NSEFOQTY + curr.NSECEQTY })
          // acc.push({...curr,hedge_ratio:found.hedge_ratio,out_qty:(curr.NSEIFSCQTY*found.hedge_ratio)+curr.NSEFOQTY+curr.NSECEQTY})
        } else {
          acc.push({ ...curr, hedge_ratio: 0, out_qty: (curr.NSEIFSCQTY * 0) + curr.NSEFOQTY + curr.NSECEQTY })
        }

        return acc;
      }, [])

      setHedgeData(mergedData)

    }).catch(err => {
      console.log(err);
    })
  }

  function generateColDef(key) {
    const option = { headerName: key.toUpperCase(), field: key, sortable: true, editable: false }

    if (key == "hedge_ratio") {
      option["editable"] = true
      option["cellEditor"] = "agNumberCellEditor"
    }
    return option
  }

  const { gridProps, onReady } = useGridSettings({
    gridApi: gridRef,
    componentInfo,
    onReload: fetchData,
    colDef: { generateColDef, row: hedgeData[0] }
  })
  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!hedgeData?.length) return
    onReady()
  }, [hedgeData])



  // useEffect(() => {
  //   if (hedgeData.length <= 0) return;

  //   (async () => {

  //     try {
  //       const { data } = await GET_COMPONENTSETTING_API({ componentname: componentInfo.componentname })
  //       gridRef.current.api.setFilterModel(data?.result?.table?.setting?.filters)
  //       setComponentSetting(data.result)
  //       colSetting = { ...data.result };
  //     }
  //     catch {
  //       console.log(err);
  //     }
  //   })()
  // }, [hedgeData])


  useEffect(() => {
    if (!ws.status) return;

    let eventListener;
    eventListener = (e) => {
      let newData = JSON.parse(e.data);
      if (newData.event === "netposition") {
        const modifiedData = hedgePosition([newData.data])

        const rowNode = gridRef.current.api.getRowNode(
          modifiedData[0]?.userid_id
        );


        if (rowNode) {

          let hedge_ratio = hedgeData.find(e => e.userid_id == modifiedData[0]?.userid_id)?.hedge_ratio;

          if (hedge_ratio) {

            let out_qty = (modifiedData[0].NSEIFSCQTY * hedge_ratio) + modifiedData[0].NSEFOQTY + modifiedData[0].NSECEQTY
            modifiedData[0].hedge_ratio=hedge_ratio
            modifiedData[0].out_qty=out_qty
            gridRef.current.api.applyTransactionAsync({
              update: modifiedData,
            });
          }

          // console.log(newData);

          // gridRef.current.api.applyTransactionAsync({
          //   update: modifiedData,
          // });
        }
        else {

          gridRef.current.api.applyTransactionAsync({
            add: modifiedData,
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

  // const columnDefs = useMemo(() => {
  //   if (hedgeData.length < 1) return;
  //   // const option = { headerName: key.toUpperCase(), field: key, sortable: true, }

  //   let columns = [];
  //   for (let key in hedgeData[0]) {
  //     let hide=columnState?.length > 0 ? columnState.indexOf(key) > -1 ? false : true : false
  //     if (key == "hedge_ratio") columns.push({ headerName: key.toUpperCase(), field: key, sortable: true, valueFormatter: formatValue,editable:true, cellEditor: "agNumberCellEditor",hide:hide })
  //     else columns.push({ headerName: key.toUpperCase(), field: key, sortable: true, valueFormatter: formatValue,hide:hide })

  //   }

  //   return columns;
  // }, [hedgeData])



  const onCellValueChanged = async (params) => {
    let updatedData = { event: 'create', data: { userid_id: params.data.userid_id, hedge_ratio: params.data.hedge_ratio } }

    setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: 'Updating Data' })

    const hedge_ratio_update = new Promise((resolve, reject) => {
      resolve(POST_HEDGERATIO_API(updatedData))
    })
    hedge_ratio_update.then(res => {
      const { result } = res.data;
      setHedgeData(previous => previous.map(val => { return val.userid_id == res.data.result.userid_id ? { ...val, out_qty: (val.NSEIFSCQTY * result.hedge_ratio) + val.NSEFOQTY + val.NSECEQTY } : val }))
      setNotifyData({ ...NotifyData, loadingFlag: false })
    }).catch(err => {
      setNotifyData({
        ...NotifyData,
        errorFlag: true,
        loadingFlag: false,
        errorMsg: err?.data?.response
      })
    })
  }

  // const handleComponentSetting = () => {

  //   // event.preventDefault();
  //   let tableSetting = {
  //     event: colSetting?.table?.id ? 'update' : 'create',
  //     data: {
  //       componentname: 'hedgePosition',
  //       componenttype: "table",
  //       setting: { filters: gridRef.current.api.getFilterModel() },
  //     }
  //   };


  //   if (colSetting?.table?.id) tableSetting.data['id'] = colSetting?.table?.id

  //   setNotifyData({ ...NotifyData, loadingFlag: true, loadingMsg: "Saving Settings" })



  //   const saveComponentSetting = new Promise((resolve, reject) => {
  //     resolve(POST_COMPONENTSETTING_API(tableSetting))
  //   })
  //   saveComponentSetting.then(res => {
  //     setNotifyData({...NotifyData,loadingFlag:false,errorFlag:false})
  //   }).catch(err => {
  //     setNotifyData({...NotifyData,loadingFlag:false,errorFlag:true,errorMsg:err?.data?.response})
  //   })
  // }

  // const getContextMenuItems = useCallback((params) => {
  //   var result = [
  //     {
  //       name: "Reload",
  //       action: fetchData,
  //       icon: '<span class="ag-icon ag-icon-loading" unselectable="on" role="presentation"></span>'
  //     },
  //     {
  //       name: "Save Filters",
  //       action: handleComponentSetting,
  //       icon: '<span class="ag-icon ag-icon-save" unselectable="on" role="presentation"></span>'
  //     },     
  //     {
  //       name: "Reset All Filters",
  //       action: () => onFiltersReset(gridRef, componentSetting),
  //       icon: '<span class="ag-icon ag-icon-filter" unselectable="on" role="presentation"></span>'
  //     },
  //     {
  //       name: "Save Columns",
  //       action: () => saveColumns(gridRef),
  //       icon: '<span class="ag-icon ag-icon-save" unselectable="on" role="presentation"></span>'
  //     },

  //   ];
  //   return result;
  // }, []);

  return (
    <>
      <div style={{ height: "99%" }}>
        <AgGridReact
          {...gridProps}
          getRowId={p => p.data.userid_id}
          ref={gridRef}
          // columnDefs={columnDefs}
          rowData={hedgeData}
          // asyncTransactionWaitMillis={500}
          // defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          getRowStyle={rowStyle}
        // sideBar={sideBar}
        // getContextMenuItems={getContextMenuItems}
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
  )
}

export default React.memo(HedgePosition);