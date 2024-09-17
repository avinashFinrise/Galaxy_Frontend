import { useEffect, useMemo, useRef, useState } from 'react'
import { CREATE_USDRATE_API, GET_USDRATE_API } from '../../../API/ApiServices'
import profile from "../ProfilePage/ProfilePage.module.scss";
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Notification } from '../../DynamicComp/Notification';
import { FaHandHoldingUsd } from 'react-icons/fa';
let excludeColumns = ['createddate', 'updateddate']

function ViewUsdrate() {
  const [usdRateData, setUsdRateData] = useState([])
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

  const gridRef = useRef()




  useEffect(() => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching Usdrates...",
    }));
    const getusdRate = new Promise((resolve, reject) => {
      resolve(GET_USDRATE_API())
    })

    getusdRate.then(res => {
      setNotifyData((prev) => {
        return { ...prev, loadingFlag: false };
      });

      setUsdRateData(res.data.result)
    }).catch(error => {
      console.log(error);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          // confirmFlag: false,
          errorFlag: true,
          errorMsg: error.response?.data.reason,
          headerMsg: error.code,
        };
      });
    })
  }, [])

  const columnDefs = useMemo(() => {
    let columns = []
    if (usdRateData.length < 1) return;
    for (let key in usdRateData[0]) {
      if (!excludeColumns.includes(key)) {

        if (key == "rate") {
          columns.push({
            field: key,
            headeName: key.toUpperCase(),
            editable: true,
            cellEditor: "agNumberCellEditor",
            valueFormatter: (params) => params.value,
            cellEditorParams: {
              // min: 1,
              // max: 100,
              // precision: 0,
              // step: 0.25,
              // showStepperButtons: true,
            }
          })
        } else {

          columns.push({
            field: key,
            headeName: key.toUpperCase()
          })
        }
      }
    }
    return columns;
  }, [usdRateData])

  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };

  const defaultColDef = useMemo(() => {
    return {
      // editable: true,
      sortable: true,
      flex: 1,
      minWidth: 100,
      width: 100,
      filter: true,
      resizable: true,
    };
  }, []);

  const onCellValueChanged = async (params) => {

    const { createddate, updateddate, ...newData } = params.data

    const usdrateUpdate = new Promise((resolve, reject) => {
      resolve(CREATE_USDRATE_API({
        event: "update",
        data: {
          ...newData
        }
      }))
    })

    usdrateUpdate.then(res => {
      console.log(res);
    }).catch(err => {
      setNotifyData({
        ...NotifyData,
        errorFlag: true,
        errorMsg: err?.response?.data
      })
    })
  }

  const sideBar = useMemo(() => {
    return {
      toolPanels: ["filters"],
    };
  }, []);
  return (
    <div className={`basic-forminfo ${profile.basicInfo}`}>
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <FaHandHoldingUsd />
        </span>
        View Usd Rates
      </h5>
      <div
        className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
      // className={` ${profile.marginTable} `}
      >
        {usdRateData && (
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={usdRateData}
            defaultColDef={defaultColDef}
            tooltipShowDelay={0}
            className="ag-theme-alpine"
            sideBar={sideBar}
            // getRowId={getRowId}
            onCellValueChanged={onCellValueChanged}
            debounceVerticalScrollbar={true}
          // tooltipHideDelay={2000}
          />
        )}
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      // CloseConfirm={CloseConfirm}
      />
    </div>
  )
}

export default ViewUsdrate