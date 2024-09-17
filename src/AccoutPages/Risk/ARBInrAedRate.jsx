import { TextField } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import { DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { DELETE_ARBINRAEDRATE_API, GET_ARBINRAEDRATE_API, GET_FILTERS_API, GET_GROUP_API, GET_USERID_MASTER, POST_ARBINRAEDRATE_API, PUT_ARBINRAEDRATE_API } from '../../API/ApiServices';
import useGridSettings from '../../Components/CustomHook/useGridSettings';
import { ModalPopup } from '../../Components/DynamicComp';
import { Notification } from '../../Components/DynamicComp/Notification';
import style from '../Risk/Risk.module.scss';
import moment from 'moment';
import ARBHist from './ARBHist';

const componentInfo = { componentname: "inrusdposting", componenttype: "table" }
const defaultData = {
    userid: '',
    groupname: '',
    startdate: '',
    // enddate: '',
    week_no_field: '',
    usd: '',
    inr: ''
}
const ARBInrAedRate = () => {
    const gridRef = useRef();
    const [isVisibalHist, setIsVisibalHist] = useState(false)
    const [arbRateData, setArbRateData] = useState([]);
    const [arbRateRowData, setArbRateRowData] = useState(defaultData)  // add row
    const [isAddArbRateOpen, setIsAddArbAccOpen] = useState(false)
    const [updateData, setUpdateData] = useState([])
    const [apiData, setApiData] = useState({
        userid: [],
        groupname: []
    })
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

    const fetchArbRateData = async () => {
        try {
            setNotifyData({ loadingFlag: true, loadingMsg: `Fetching arb Data...`, });
            const arbapidata = await GET_ARBINRAEDRATE_API()
            // console.log(arbapidata)
            setArbRateData(arbapidata.data);
            setNotifyData({ ...NotifyData, loadingFlag: false });

        } catch (err) {
            console.log(err)
            setNotifyData({ loadingFlag: false, errorFlag: true, errorMsg: err.response?.data.reason || "Error fetching data" });
        }
    }

    useEffect(() => {
        fetchArbRateData();
        (async () => {
            try {
                const getapidata = await Promise.all([
                    GET_GROUP_API(),
                    GET_USERID_MASTER()
                ])
                const [groupname, userid,] = getapidata;
                // console.log(groupname, getapidata)
                if (groupname) {
                    setApiData((previous) => ({
                        ...previous,
                        groupname: groupname.data.result
                    }));
                }
                if (userid) {
                    setApiData((previous) => ({
                        ...previous,
                        userid: userid.data.result
                    }));
                }


                setNotifyData({ ...NotifyData, loadingFlag: false });
            } catch (err) {
                console.log(err)
                setNotifyData({ loadingFlag: false, errorFlag: true, errorMsg: err.response?.data.reason || "Error fetching data" });
            }
        })();

    }, [])
    // console.log({ arbRateRowData })
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
        if (key === "usd" || key === "inr") {
            option["editable"] = true
        }
        return option;
    }

    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo: componentInfo,
        onReload: fetchArbRateData,
        colDef: { generateColDef, row: arbRateData[0] },
        groupBy: arbRateData && arbRateData.length ? Object.keys(arbRateData[0]) : [],
        settings: {
            sideBar: true,
        }
    })
    useEffect(() => {
        if (!arbRateData?.length) return
        onReady()
    }, [arbRateData])
    const getRowId = useCallback((params) => {
        return params.data.id;
    });
    const visibleAddCard = () => {
        setIsAddArbAccOpen(p => !p)
        setArbRateRowData(defaultData);
    };
    const visibleInrUsdHist = () => {
        setIsVisibalHist(p => !p)
    };
    const addArbAccountData = async (e) => {
        e.preventDefault();

        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "add Arb account row data...",
            }));

            const response = await POST_ARBINRAEDRATE_API(arbRateRowData);
            const newRowData = response.data;
            fetchArbRateData()
            setIsAddArbAccOpen(false)
            // setArbRateData((prevData) => [...prevData, newRowData])

            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                successFlag: true,
                successMsg: "Successfully created",
            }));
            setArbRateRowData(defaultData)

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


    const onCellValueChanged = async (params) => {
        const data = params.data

        if (params.column.colId == "usd" && data.usd) if (data.inr) data.usd = null;
        if (params.column.colId == "inr" && data.inr) if (data.usd) data.inr = null;

        gridRef.current?.api.applyTransaction({ update: [data] })

        setUpdateData(prev => ({ ...prev, [data.id]: data }))
    }

    const handleUpdate = async () => {
        let updatedarray = Object.values(updateData)
        if (!updatedarray.length) return
        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "updating Account Data...",
            }))

            const { response } = await PUT_ARBINRAEDRATE_API({ data: updatedarray })

            setUpdateData([])
            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    confirmFlag: false,
                    successFlag: true,
                    successMsg: `  updated Succesfully.`,
                    // successMsg: `Groupname ${updatedarray.map(item => item.group_name)}  updated Succesfully.`,
                };
            });
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

    // const handleDeleteData = async () => {
    //     const rows = gridRef.current.api.getSelectedRows();
    //     try {
    //         setNotifyData((data) => ({
    //             ...data,
    //             loadingFlag: true,
    //             loadingMsg: "deleteing Account Data...",
    //         }))
    //         const body = { data: rows }

    //         const deletdata = await DELETE_ARBINRAEDRATE_API(body)
    //         gridRef.current?.api?.applyTransaction({ remove: rows })
    //         setNotifyData((prev) => {
    //             return {
    //                 ...prev,
    //                 loadingFlag: false,
    //                 confirmFlag: false,
    //                 successFlag: true,
    //                 successMsg: `Data successfully deleted`,

    //             };
    //         });
    //     } catch (error) {
    //         console.log(error)
    //         setNotifyData((prev) => {
    //             return {
    //                 ...prev,
    //                 loadingFlag: false,
    //                 confirmFlag: false,
    //                 errorFlag: true,
    //                 errorMsg: error.response?.data.reason,
    //                 headerMsg: error.code,
    //             };
    //         });
    //     }
    // }

    const handleDatePickerChange = (date, dateString, fieldName) => {
        if (fieldName === 'startdate' && date) {
            const selectedDate = moment(dateString);
            const dayOfWeek = selectedDate.day(); // 0 (Sunday) to 6 (Saturday)

            if (dayOfWeek !== 1) { // 1 corresponds to Monday
                // Adjust selectedDate to the nearest Monday
                const adjustedDate = selectedDate.day(1);
                dateString = adjustedDate.format('YYYY-MM-DD');
                date = adjustedDate.toDate();
            }
        }
        setArbRateRowData((prevState) => ({
            ...prevState,
            [fieldName]: dateString,
        }));



        if (fieldName === 'startdate' && date) {
            const startDate = new Date(dateString);
            const weekNumber = getISOWeek(startDate); // Get ISO week number

            setArbRateRowData((prevState) => ({
                ...prevState,
                startdate: dateString,
                week_no_field: weekNumber,
            }));
        }
    };
    const getISOWeek = (date) => {
        const dayOfWeek = date.getUTCDay() || 7; // ISO week starts on Monday (day 1)
        date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek); // Adjust to start of ISO week
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const weekNumber = Math.ceil(((date - yearStart) / 86400000 + 1) / 7); // Calculate week number
        return weekNumber;
    };


    const handleInputChange = async (value, name) => {
        setArbRateRowData((prevData) => {
            if (["usd", "inr", "week_no_field"].includes(name) && value) value = +value;

            if (name === "usd") {
                return { ...prevData, [name]: value, inr: 0 };
            } else if (name === "inr") {
                return { ...prevData, [name]: value, usd: 0 };
            } else {
                return { ...prevData, [name]: value };
            }
        });
        if (name == "groupname") {
            const res = await GET_FILTERS_API({
                "event": "getuseridfilter", "data": {
                    "filters": {
                        "groupname": [value]
                    }
                }
            })
            const userids = res.data.result[value]
            setApiData(prev => ({ ...prev, userid: userids }))
        }
    };

    const inputdata = [
        { type: "date", name: "startdate", placeholder: "startdate", value: `${arbRateRowData.startdate}` || null },
        // { type: "date", name: "enddate", placeholder: "enddate", value: `${arbRateRowData.enddate}` || null },
        {
            type: "select", name: "groupname", placeholder: "groupname", value: `${arbRateRowData.groupname}`,
            option: apiData.groupname.map((val) => <Option key={val.id} value={val.groupName}>
                {val.groupName}
            </Option>)
        },
        {
            type: "select", name: "userid", placeholder: "userid", value: `${arbRateRowData.userid}`,
            option: apiData.userid.map((val) => <Option key={val.id} value={val.userId}>
                {val.userId}
            </Option>)
        },
        { type: "number", name: "week_no_field", placeholder: "week_no_field", value: `${arbRateRowData.week_no_field}` || null },
        {
            type: "select", name: "usd", placeholder: "select usd", value: `${arbRateRowData.usd}`, disabled: arbRateRowData.inr !== "" && arbRateRowData.inr !== 0,
            option: <><Option value="1" >1</Option><Option value="0" >0</Option></>
        },
        {
            type: "select", name: "inr", placeholder: "select inr", value: `${arbRateRowData.inr}`, disabled: arbRateRowData.usd !== "" && arbRateRowData.usd !== 0,
            option: <><Option value="1" >1</Option><Option value="0" >0</Option></>
        },
    ]

    return (

        <div className={`risktable container-fluid ${style.risktableSection}`} >
            <div className={style.btnSection}>
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
                {/* <button
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
                </button> */}

            </div>
            <div
                style={{ height: isVisibalHist ? '50vh' : '80vh', marginTop: "1rem" }}
            >
                <AgGridReact
                    className="ag-theme-alpine"
                    {...gridProps}
                    ref={gridRef}
                    getRowId={getRowId}

                    rowData={arbRateData}
                    suppressAggFuncInHeader={true}
                    onCellValueChanged={onCellValueChanged}
                    rowSelection='multiple'

                // onModelUpdated={setTotal}
                // pinnedBottomRowData={[totalRow]}
                // onFilterModified={setTotal}
                />
            </div>
            <h6
                className={style.visiblityContent}
                onClick={() => visibleInrUsdHist()}>
                {isVisibalHist ? "Hide " : "Show "}
                InrUsd Posting History
            </h6>
            {isVisibalHist && <ARBHist />}

            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
                CloseConfirm={CloseConfirm}
            />
            <ModalPopup
                size={"lg"}
                fullscreen={false}
                title={"Add ARB Rate Row"}
                flag={isAddArbRateOpen}
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
                                    confirmMsg: "Are you sure, You want to add ARB Account?",
                                    confirmAction: (e) =>
                                        addArbAccountData(e)
                                }))
                            }}
                        >
                            <Row className={style.formContent}>

                                {inputdata.map((item) => {
                                    return <Form.Group as={Col} md="12" className="mb-3 " >
                                        {(item.type == 'date') ? (
                                            <DatePicker
                                                format="YYYY-MM-DD"
                                                onChange={(date, dateString) => handleDatePickerChange(date, dateString, item.name)}
                                                placeholder={item.placeholder}
                                                allowClear
                                                name={item.name}
                                                value={item.value ? dayjs(item.value, "YYYY-MM-DD") : null}
                                                // value={
                                                //     arbRateRowData.startdate && arbRateRowData.enddate
                                                //         ? [
                                                //             moment(arbRateRowData.startdate, "YYYY-MM-DD"),
                                                //             moment(arbRateRowData.enddate, "YYYY-MM-DD"),
                                                //         ]
                                                //         : null
                                                // }
                                                className={style.datePicker}
                                            />)




                                            : item.type === 'select' ? (
                                                <Select
                                                    showSearch
                                                    allowClear
                                                    name={item.name}
                                                    value={item.value}
                                                    style={{ width: "100%" }}
                                                    onChange={(value) => handleInputChange(value, item.name)}// Assuming handleInputChange is modified accordingly
                                                    aria-label="Floating label select example"
                                                    required
                                                    className={style.antdSelect}
                                                    disabled={item.disabled}
                                                >
                                                    <Option value="" hidden>
                                                        {item.placeholder}
                                                    </Option>
                                                    {item.option}

                                                </Select>
                                            ) : (
                                                <TextField id="outlined-basic"
                                                    label={item.placeholder}
                                                    // variant="outlined"
                                                    fullWidth
                                                    // sx={{ m: 1 }}
                                                    type={item.type}
                                                    name={item.name}
                                                    value={item.value || ''}
                                                    placeholder={item.placeholder}
                                                    onChange={(e) => handleInputChange(e.target.value, e.target.name)}
                                                    className={`mui-formcontrol ${style.muiformControl}`}
                                                // disabled={item.disabled}
                                                />)
                                        }
                                    </Form.Group>
                                })}
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
        </div >
    )
}

export default ARBInrAedRate