import { AgGridReact } from 'ag-grid-react';
import { DatePicker } from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { POST_ARBHIST_API } from '../../API/ApiServices';
import useGridSettings from '../../Components/CustomHook/useGridSettings';
import style from '../Risk/Risk.module.scss';
import { Notification } from '../../Components/DynamicComp/Notification';



const componentInfo = { componentname: "arbrateHist", componenttype: "table" }
const ARBHist = () => {
    const [arbHistData, setArbHistData] = useState({
        event: 'getarbhist',
        startdate: '',
        enddate: ''

    });
    const [arbApidata, setARBApidata] = useState([])
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
    const viewArbHist = async () => {
        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "view  ARB Historical data...",
            }));
            const apicall = await POST_ARBHIST_API(arbHistData);
            console.log("apicall", apicall);
            if (apicall) {
                setARBApidata(apicall.data);
            }

            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    successFlag: true,
                    successMsg: "data fetch successfull",
                };
            });

        } catch (error) {
            console.log(error);
            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    errorFlag: true,
                    errorMsg: error.response?.data.reason,
                    headerMsg: error.code,
                };
            });
        }

    }

    function generateColDef(key) {
        let option = null;
        option = {
            headerName: key.toUpperCase(),
            field: key,
            sortable: true,
            hide: false,
            filter: true,
            enableValue: true,
            editable: false

        };

        return option;
    }

    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo: componentInfo,
        onReload: viewArbHist,
        colDef: { generateColDef, row: arbApidata[0] },
        groupBy: arbApidata && arbApidata.length ? Object.keys(arbApidata[0]) : [],
        settings: {
            sideBar: true,
        }
    })
    useEffect(() => {
        if (!arbApidata?.length) return
        onReady()
    }, [arbApidata])
    const getRowId = useCallback((params) => {
        return params.data.id;
    });

    const handleDatePickerChange = (dates, dateStrings) => {
        const [startdate, enddate] = dateStrings;
        setArbHistData((prevState) => ({
            ...prevState,
            startdate: startdate,
            enddate: enddate,

        }));
    };
    return (
        <div className={style.arbHistSection}>
            {/* <h1>sjrfio gotriortohuo</h1> */}
            <div className={`row ${style.headerSection}`}>
                <div className='col-md-5'>
                    <h5>InrUsd Posting History</h5>
                </div>
                <div className={`col-md-7 ${style.filterSection}`}>

                    <DatePicker.RangePicker
                        format="YYYY-MM-DD" // Specify the date format
                        placeholder={["Start Date", "End Date"]}
                        allowClear={true} // Set to true if you want to allow clearing the
                        className={style.datePicker}
                        value={
                            arbHistData.startdate && arbHistData.enddate
                                ? [
                                    moment(arbHistData.startdate, "YYYY-MM-DD"),
                                    moment(arbHistData.enddate, "YYYY-MM-DD"),
                                ]
                                : null
                        }
                        onChange={handleDatePickerChange}
                    />
                    <button
                        type="submit"
                        className={`basic-InfoBtn`}

                        onClick={viewArbHist}
                    >VIEW</button>
                </div>
            </div>
            <div
                style={{ height: "50vh", marginTop: "1rem" }}
            >
                <AgGridReact
                    className="ag-theme-alpine"
                    {...gridProps}
                    ref={gridRef}
                    getRowId={getRowId}

                    rowData={arbApidata}
                    suppressAggFuncInHeader={true}
                    // onCellValueChanged={onCellValueChanged}
                    rowSelection='multiple'

                // onModelUpdated={setTotal}
                // pinnedBottomRowData={[totalRow]}
                // // pinnedBottomRowData={[defaultTotalRow]}
                // onFilterModified={setTotal}
                />
            </div>
            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
            />
        </div>
    )
}

export default ARBHist