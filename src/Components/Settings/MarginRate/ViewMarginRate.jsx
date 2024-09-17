import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GiSandsOfTime } from 'react-icons/gi';
import { Notification } from '../../DynamicComp/Notification';
import profile from "../ProfilePage/ProfilePage.module.scss";
import { FaSackDollar } from 'react-icons/fa6';
import { AgGridReact } from 'ag-grid-react';
import { CREATE_MARGINRATE_API, DELETE_MARGINRATE_API, GET_MARGINRATE_API } from '../../../API/ApiServices';
import { AiFillDelete } from 'react-icons/ai';

const ViewMarginRate = () => {
    const gridRef = useRef();
    const [marginRateData, setMarginRateData] = useState([]); //cluster table

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

    const actionButton = (p) => (
        <>
            <AiFillDelete onClick={deleteToken} />
        </>
    );

    useEffect(() => {
        (() => {
            const api = new Promise((resolve, reject) => {
                resolve(GET_MARGINRATE_API());
                setNotifyData((data) => ({
                    ...data,
                    loadingFlag: true,
                    loadingMsg: "Fetching cluster data...",
                }));
            });
            api
                .then((res) => {
                    setMarginRateData(res?.data?.result.map(e => { return { ...e, action: '' } }));
                    setNotifyData((prev) => {
                        return { ...prev, loadingFlag: false };
                    });
                })
                .catch((err) => {
                    setNotifyData((prev) => {
                        return {
                            ...prev,
                            loadingFlag: false,
                            // confirmFlag: false,
                            errorFlag: true,
                            errorMsg: err.response?.data.reason,
                            headerMsg: err.code,
                        };
                    });
                });
        })();
    }, []);


    const columnCreation = useMemo(() => {
        let columns = [];
        if (marginRateData.length > 0) {
            for (let key in marginRateData[0]) {
                if (key == 'action') {
                    columns.push({
                        headerName: key.toUpperCase(),
                        cellRenderer: actionButton

                    })
                } else if (key == 'margin_rate') {
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
                        headerName: key.toUpperCase(),
                        sortable: true,
                        filter: true,
                    });
                }

            }
        }

        return columns;
    }, [marginRateData]);

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

    const sideBar = useMemo(() => {
        return {
            toolPanels: ["filters"],
        };
    }, []);

    const getRowId = useCallback((params) => {
        return params.data.id;
    });

    const deleteToken = async () => {
        const selectedDataForDashboard = gridRef?.current?.api.getSelectedNodes();
        gridRef.current.api.applyTransactionAsync({ remove: [selectedDataForDashboard[0].data] })

        const id = selectedDataForDashboard[0].data.id;
        let dataToSend = {
            event: "delete",
            data: {
                id: id,
            },
        };
        try {
            const deleteMarketWatch = await DELETE_MARGINRATE_API(dataToSend);

        } catch (error) {
            console.log(error);
            setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: error.response.data.reason })

        }

        if (deleteMarketWatch.status == 200) {
            // setMarketData((previous) => previous.filter((val) => val.id !== id));
        }
    };

    const onCellValueChanged = async (params) => {

        const { createddate, updateddate, action, ...newData } = params.data

        const marginrate = new Promise((resolve, reject) => {
            resolve(CREATE_MARGINRATE_API({
                event: "update",
                data: {
                    ...newData
                }
            }))
        })

        marginrate.then(res => {
        }).catch(err => {
            console.log({ err });
            setNotifyData({
                ...NotifyData,
                errorFlag: true,
                errorMsg: err?.response?.data?.reason
            })
        })
    }
    return (
        <div className={`basic-forminfo ${profile.basicInfo}`}>
            <h5 className={profile.basicHeading}>
                <span className={profile.icons}>
                    <FaSackDollar />
                </span>
                View Margin Rate
            </h5>
            <div
                className={`custom-table ${profile.basicInfoSetting} ${profile.headingSection}`}
            // className={` ${profile.marginTable} `}
            >
                <AgGridReact
                    ref={gridRef}
                    columnDefs={columnCreation}
                    rowData={marginRateData}
                    defaultColDef={defaultColDef}
                    tooltipShowDelay={0}
                    className="ag-theme-alpine"
                    sideBar={sideBar}
                    getRowId={getRowId}
                    rowSelection='single'
                    onCellValueChanged={onCellValueChanged}
                // tooltipHideDelay={2000}
                />
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

export default ViewMarginRate