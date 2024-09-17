import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DELETE_RISK_API, GET_FILTERS_API, GET_RISK_API, GET_USERID_MASTER, POST_RISK_API, PUT_RISK_API } from '../../API/ApiServices';
import { AgGridReact } from 'ag-grid-react';
import { Notification } from '../../Components/DynamicComp/Notification';
import useGridSettings from '../../Components/CustomHook/useGridSettings';
import style from './Risk.module.scss'
import { DatePicker, Select } from "antd";
import dayjs from "dayjs"
import { ModalPopup } from '../../Components/DynamicComp';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import OTPComp from '../OTPComp/OTPComp';
import { TextField } from '@mui/material';
import useValidate from '../Validate/useValidate';
import DownloadRiskReport from './DownloadRiskReport';



const componentInfo = { componentname: "risk", componenttype: "table" }
const defaultTotalRow = { user_id: "Total", limit_inr: 0, limit_usd: 0 };
const defaultEmptydata = {
    date: new Date().toISOString().split("T")[0],
    user_id: "",
    limit_inr: "",
    limit_usd: "",
}
const { Option } = Select;
const Risk = () => {
    const gridRef = useRef();
    const formRef = useRef();
    const [riskData, setRiskData] = useState([]);
    const [useridsOptions, setUserIdsOptions] = useState([])
    const [riskRowData, setRiskRowData] = useState(defaultEmptydata)  // add row

    const [updateData, setUpdateData] = useState([])
    const [isAddLImitOpen, setIsAddLimitOpen] = useState(false)
    const [isTowFAOpen, setIsTowFAOpen] = useState(false)
    const [otp, setOtp] = useState([])
    const [totalRow, setTotalRow] = useState({})
    const [showDownloadReport, setShowDownloadReport] = useState(false);
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
    const CloseConfirm = () => {
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };
    const fetchRiskData = async () => {
        try {
            setNotifyData({
                loadingFlag: true,
                loadingMsg: `Fetching risk Data...`,
            });
            const apiData = await GET_RISK_API()
            setRiskData(apiData.data);
            setNotifyData({ ...NotifyData, loadingFlag: false });

        } catch (err) {
            console.log(err)
            setNotifyData({ loadingFlag: false, errorFlag: true, errorMsg: err.response?.data.reason || "Error fetching data" });
        }

    }
    const downloadReport = () => setShowDownloadReport(p => !p)
    // useEffect(() => {
    //     fetchRiskData()
    // }, [])

    useEffect(() => {
        fetchRiskData();
        (async () => {
            try {
                const apiData = await GET_USERID_MASTER()
                setUserIdsOptions(apiData.data.result)
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                    };
                });
            } catch (error) {
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                        errorFlag: true,
                        errorMsg: error.response?.data.result,
                        headerMsg: error.code,
                    };
                });
            }

        })();
    }, []);
    function generateColDef(key) {
        let option = null;
        option = { headerName: key.toUpperCase(), field: key, sortable: true, hide: false, filter: true, enableValue: true, };
        return option;
    }
    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo: componentInfo,
        onReload: fetchRiskData,
        colDef: { generateColDef, row: riskData[0] },
        groupBy: riskData && riskData.length ? Object.keys(riskData[0]) : [],
        settings: {
            sideBar: true,
        }
    })
    // console.log(gridProps, onReady)
    useEffect(() => {
        if (!riskData?.length) return
        onReady()
    }, [riskData])
    const getRowId = useCallback((params) => {
        return params.data.id;
    });


    //start add Row
    const visibleAddCard = () => {
        setIsAddLimitOpen(p => !p)
        setRiskRowData(defaultEmptydata);
    };
    const validate = useValidate(setNotifyData)
    const handleAdddata = async (e) => {
        e.preventDefault();
        const validationErrors = [
            { condition: !riskRowData.user_id, message: "User ID is required." },
            { condition: isNaN(riskRowData.limit_inr), message: "Limit inr is required." },
            { condition: isNaN(riskRowData.limit_usd), message: "Limit usd is required." },
        ];
        if (!validate(validationErrors)) return
        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "add risk row data...",
            }));


            // const body = otp.length ? { ...riskRowData, otp: otp.join("") } : riskRowData
            const response = await POST_RISK_API(riskRowData);

            // if (response.status === 204) {
            //     setNotifyData((data) => ({
            //         ...data,
            //         loadingFlag: false,
            //         loadingMsg: "add risk row data...",
            //         confirmFlag: false
            //     }));
            //     return setIsTowFAOpen("add")
            // }

            const newRowData = response.data;

            // Update the grid with the new row data
            setRiskData((prevData) => [newRowData, ...prevData]);

            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                successFlag: true,
                successMsg: "Successfully created",
            }));

            // Reset the input fields
            setRiskRowData(defaultEmptydata);
            // setIsTowFAOpen(false)
            // setOtp([])
            setIsAddLimitOpen(false)
        } catch (err) {
            console.log(err);
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                errorFlag: true,
                errorMsg: err.response?.data.reason,
                headerMsg: err.code,
            }));
        }
    };

    const handleInputChange = (value, name) => {
        setRiskRowData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    //end add row


    //start update
    const onCellValueChanged = (params) => {
        setUpdateData(prev => ({
            ...prev,
            [params.data.id]: params.data
        }
        ))

    }
    const handleUpdate = async () => {
        let updatedarray = Object.values(updateData)
        if (!updatedarray.length) return
        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "updating limit Data...",
            }))
            const body = otp.length ? { data: updatedarray, otp: otp.join("") } : { data: updatedarray }
            const response = await PUT_RISK_API(body)
            if (response.status === 204) {
                setNotifyData((data) => ({
                    ...data,
                    loadingFlag: false,
                    loadingMsg: "update risk row data...",
                    confirmFlag: false
                }));
                return setIsTowFAOpen("update")
            }
            setUpdateData([])

            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    confirmFlag: false,
                    successFlag: true,
                    successMsg: `UserID ${updatedarray.map(item => item.user_id)}  updated succesfully`,
                };
            });
            setIsTowFAOpen(false)
            setOtp([])
        } catch (error) {
            console.log("error", error);
            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    confirmFlag: false,
                    errorFlag: true,
                    errorMsg: error.response?.data.reason,
                    headerMsg: error.code,
                };
            });
        }
    }
    //end update 


    //start delete
    const handleDeleteData = async () => {
        if (!gridRef.current) return
        const rows = gridRef.current.api.getSelectedRows();
        if (!rows.length) {
            return setNotifyData((prev) => ({
                ...prev,
                errorFlag: true,
                confirmFlag: false,
                errorMsg: "Please select row to delete!",
            }))
        }
        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "deleteing risk row data...",
            }))

            const body = otp.length ? { data: rows, otp: otp.join("") } : { data: rows }

            const deletdata = await DELETE_RISK_API(body)
            if (deletdata.status === 204) {
                setNotifyData((data) => ({
                    ...data,
                    loadingFlag: false,
                    loadingMsg: "delete risk row data...",
                    confirmFlag: false
                }));
                return setIsTowFAOpen("delete")
            }
            gridRef.current?.api?.applyTransaction({ remove: rows })

            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    confirmFlag: false,
                    successFlag: true,
                    successMsg: `Data successfully deleted of userid ${rows.map(item => item.user_id)} `,
                };
            });
            setIsTowFAOpen(false)
            setOtp([])
        } catch (error) {
            console.log(error)
            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    confirmFlag: false,
                    errorFlag: true,
                    errorMsg: error.response?.data.reason,
                    headerMsg: error.code,
                };
            });
        }
    }

    const visibleTwoFA = () => {
        setIsTowFAOpen(p => {
            if (p) setOtp([])
            return !p
        })
    };


    const funcMap = {
        add: handleAdddata,
        delete: handleDeleteData,
        update: handleUpdate
    }


    const handleDatePickerChange = (date, dateStrings) => {
        setRiskRowData((prevState) => ({
            ...prevState,
            date: dateStrings,
        }));
    };


    const setTotal = () => {
        if (!gridRef.current) return

        const totalRow = { ...defaultTotalRow }

        gridRef.current?.api?.forEachNodeAfterFilterAndSort(({ data }) => {
            totalRow["limit_inr"] += data.limit_inr || 0
            totalRow["limit_usd"] += data.limit_usd || 0
        })
        // gridRef.current.api.setPinnedBottomRowData([totalRow])
        setTotalRow(totalRow)
    }


    // console.log({ riskRowData })
    const riskinputdata = [
        { type: "select", name: "user_id", placeholder: "Select UserID", value: `${riskRowData.user_id}` },
        { type: "number", name: "limit_inr", placeholder: "limit_inr", value: `${riskRowData.limit_inr}` },
        { type: "number", name: "limit_usd", placeholder: "limit_usd", value: `${riskRowData.limit_usd}` },
    ]

    return (
        <div className={`risktable container-fluid ${style.risktableSection}`} >
            <div className={style.btnSection}>
                <button
                    className={style.DownloadBtn}
                    onClick={downloadReport}
                >
                    Download
                </button>
                <button
                    className={style.addBtn}
                    onClick={visibleAddCard}
                >
                    Add
                </button>
                <button
                    className={style.updateBtn}
                    onClick={(e) => {
                        e.preventDefault();
                        setNotifyData((data) => ({
                            ...data,
                            confirmFlag: true,
                            confirmMsg: "Are you sure, You want to update data?",
                            confirmAction: (e) =>
                                handleUpdate(e)
                        }))
                    }}
                >
                    Update
                </button>
                <button
                    className={style.deleteBtn}
                    onClick={(e) => {
                        e.preventDefault();
                        setNotifyData((data) => ({
                            ...data,
                            confirmFlag: true,
                            confirmMsg: "Are you sure, You want to delete data?",
                            confirmAction: (e) =>
                                handleDeleteData(e)
                        }))
                    }}
                >
                    Delete
                </button>

            </div>
            <div
                style={{ height: "85vh", marginTop: "1rem" }}
            >
                <AgGridReact
                    className="ag-theme-alpine"
                    {...gridProps}
                    ref={gridRef}
                    getRowId={getRowId}

                    rowData={riskData}
                    suppressAggFuncInHeader={true}
                    onCellValueChanged={onCellValueChanged}
                    rowSelection='multiple'

                    onModelUpdated={setTotal}
                    pinnedBottomRowData={[totalRow]}
                    // pinnedBottomRowData={[defaultTotalRow]}
                    onFilterModified={setTotal}
                />
            </div>
            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
                CloseConfirm={CloseConfirm}
            />
            <ModalPopup
                size={"lg"}
                fullscreen={false}
                title={"Add Risk Limit Row"}
                flag={isAddLImitOpen}
                close={visibleAddCard}
                className="riskmodalpopup"
                component={
                    <div>
                        <Form
                            className={style.formSection}
                            onSubmit={(e) => {
                                e.preventDefault();
                                setNotifyData((data) => ({
                                    ...data,
                                    confirmFlag: true,
                                    confirmMsg: "Are you sure, You want to add Limit?",
                                    confirmAction: (e) =>
                                        handleAdddata(e)
                                }))
                            }}
                        >
                            <Row className={style.formContent}>
                                <Form.Group className="mb-3" as={Col} md="12" >
                                    <InputGroup
                                        hasValidation
                                    >
                                        <DatePicker
                                            onChange={handleDatePickerChange}
                                            format="YYYY-MM-DD"
                                            placeholder={"Date"}
                                            allowClear
                                            value={dayjs(riskRowData.date, "YYYY-MM-DD")}
                                            className={style.datePicker}
                                        />
                                    </InputGroup>
                                </Form.Group>


                                {
                                    riskinputdata.map((item) => {
                                        return <Form.Group as={Col} md="12" className="mb-3 ">
                                            {(item.type == "select") ?
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    name={item.name}
                                                    value={item.value}
                                                    style={{ width: "100%" }}
                                                    onChange={(value) => handleInputChange(value, item.name)}// Assuming handleInputChange is modified accordingly
                                                    aria-label="Floating label select example"
                                                    required
                                                    placeholder={item.placeholder} // Using placeholder prop in Select
                                                    className={style.antdSelect}
                                                >
                                                    <Option value="" hidden>
                                                        {item.placeholder}
                                                    </Option>

                                                    {useridsOptions.map((val) => {
                                                        return <Option key={val.id} value={val.userId}>{val.userId}</Option>
                                                    })}
                                                </Select>
                                                :
                                                <TextField
                                                    id="outlined-basic"
                                                    label={item.placeholder}
                                                    fullWidth
                                                    type={item.type}
                                                    name={item.name}
                                                    value={item.value}
                                                    placeholder={item.placeholder}
                                                    onChange={(e) => handleInputChange(+e.target.value, e.target.name)}
                                                    className={`mui-formcontrol ${style.muiformControl}`}
                                                />
                                            }
                                        </Form.Group >
                                    })
                                }
                            </Row>
                            <button
                                type="submit"
                                className={style.addBtn}
                            >
                                Add Row
                            </button>
                        </Form>
                    </div>
                }
            />
            <ModalPopup
                size={"lg"}
                fullscreen={false}
                title={""}
                flag={isTowFAOpen}
                close={visibleTwoFA}
                className="riskmodalpopup"
                component={<OTPComp otp={otp} setOtp={setOtp} onSubmit={funcMap[isTowFAOpen]} />}
            />
            <ModalPopup
        className={"mtmSymbolWisePop downloadReport"}
        fullscreen={false}
        title="Download limits"
        flag={showDownloadReport}
        close={downloadReport}
        component={
          <DownloadRiskReport  downloadReport={downloadReport} riskData={riskData} />
        }
      />
        </div >
    )
}

export default Risk