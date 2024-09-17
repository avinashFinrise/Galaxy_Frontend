import { AgGridReact } from 'ag-grid-react';
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import { DELETE_ACCOUNT_API, GET_ACCOUNT_API, POST_ACCOUNT_API, PUT_ACCOUNT_API, GET_GROUP_API } from '../../API/ApiServices';
import useGridSettings from '../../Components/CustomHook/useGridSettings';
import { ModalPopup } from '../../Components/DynamicComp';
import { Notification } from '../../Components/DynamicComp/Notification';
import OTPComp from '../OTPComp/OTPComp';
import style from '../Risk/Risk.module.scss';
import { TextField } from '@mui/material';
import useValidate from '../Validate/useValidate';

const componentInfo = { componentname: "account", componenttype: "table" }
const defaultTotalRow = { group_name: "Total", aed: 0, inr: 0, total_inr: 0 };
const defaultEmptydata = {
    date: new Date().toISOString().split("T")[0],
    group_name: '',
    tran_type: '',
    rec_and_paid: '',
    particulars: '',
    mtm_margin: '',
    rate: '',
    aed: '',
    inr: '',
    total_inr: ''
}

const { Option } = Select;
const Account = () => {
    const gridRef = useRef();
    const [AccountData, setAccountData] = useState([]);
    const [groupname, setGroupname] = useState([])
    const [AccountRowData, setAccountRowData] = useState(defaultEmptydata)  // add row
    const [updateData, setUpdateData] = useState([])
    const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
    const [isTowFAOpen, setIsTowFAOpen] = useState(false)
    const [otp, setOtp] = useState([])
    const [totalRow, setTotalRow] = useState({})

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
        location.reload()
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };
    // const fetchAccountData = async () => {
    //     try {
    //         setNotifyData({
    //             loadingFlag: true,
    //             loadingMsg: `Fetching Account Data...`,
    //         });
    //         const apiData = await GET_ACCOUNT_API()
    //         // setAccountData([{}, ...apiData.data]);
    //         setAccountData(apiData.data);
    //         setNotifyData({ ...NotifyData, loadingFlag: false });

    //     } catch (err) {
    //         console.log(err)
    //         setNotifyData({ loadingFlag: false, errorFlag: true, errorMsg: err.response?.data.reason || "Error fetching data" });
    //     }
    // }
    // useEffect(() => {
    //     fetchAccountData()
    // }, [])
    useEffect(() => {
        (async () => {
            try {
                const apiData = await Promise.all([
                    GET_ACCOUNT_API(),
                    GET_GROUP_API()
                ]);
                const [accapidata, groupmaster,] = apiData
                if (accapidata) {
                    setAccountData(accapidata.data);
                }
                if (groupmaster) {
                    setGroupname(groupmaster.data.result);
                }
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

    function generateColDef(key, rowIndex) {
        const option = {
            headerName: key.toUpperCase(),
            field: key,
            sortable: true,
            hide: false,
            filter: true,
            enableValue: true,
        };

        if (key == "total_inr") {
            option["editable"] = false
        }

        return option;
    }

    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo: componentInfo,
        // onReload: fetchAccountData,
        colDef: { generateColDef, row: AccountData[0] },
        groupBy: AccountData && AccountData.length ? Object.keys(AccountData[0]) : [],
        settings: {
            sideBar: true,
        }
    })
    useEffect(() => {
        if (!AccountData?.length) return
        onReady()
    }, [AccountData])
    const getRowId = useCallback((params) => {
        return params.data.id;
    });

    //start add Row
    const visibleAddCard = () => {
        setIsAddAccountOpen(p => !p)
        setAccountRowData(defaultEmptydata);

    };


    const validate = useValidate(setNotifyData)
    const addAccountData = async (e) => {
        e.preventDefault();

        const validationErrors = [
            { condition: !AccountRowData.group_name, message: "Group name is required." },
            { condition: !AccountRowData.tran_type, message: "Transaction type is required." },
            { condition: !AccountRowData.particulars, message: "Particulars is required." },
            { condition: !AccountRowData.rec_and_paid, message: "rec and paid is required." },
        ];
        if (!validate(validationErrors)) return
        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "adding account row data...",
            }));

            const body = { ...AccountRowData }

            Object.keys(body).forEach(e => {
                if (["particulars", "inr", "aed"].includes(e) && body[e] == "") body[e] = null
            })

            if (body["inr"] === null && body["aed"] === null) {
                return setNotifyData((prev) => ({ ...prev, loadingFlag: false, confirmFlag: false, errorFlag: true, errorMsg: "both inr and aed cannot be 'NULL'!", }));
            }

            if (body["inr"] !== null && body["aed"] !== null) {
                return setNotifyData((prev) => ({ ...prev, loadingFlag: false, confirmFlag: false, errorFlag: true, errorMsg: "You cannot select both INR and AED at the same time!!!", }));
            }

            const response = await POST_ACCOUNT_API(body);
            const newRowData = response.data;

            setAccountData((prevData) => [newRowData, ...prevData]);

            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                successFlag: true,
                successMsg: "Successfully created",
            }));


            setAccountRowData(defaultEmptydata);
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


    //start update
    const onCellValueChanged = async (params) => {
        const data = params.data
        if (params.column.colId == "aed" && data.aed) if (data.inr) data.aed = null;
        if (params.column.colId == "inr" && data.inr) if (data.aed) data.inr = null;

        // data["total_inr"] = data["rate"] * data[data["tran_type"] == "INR" ? 'inr' : "aed"]

        data["total_inr"] = (data["rate"] * data['aed']) + data['inr']

        gridRef.current?.api.applyTransaction({ update: [data] })
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
                loadingMsg: "updating Account Data...",
            }))
            const body = otp.length ? { data: updatedarray, otp: otp.join("") } : { data: updatedarray }

            const response = await PUT_ACCOUNT_API(body)
            if (response.status === 204) {
                setNotifyData((data) => ({
                    ...data,
                    loadingFlag: false,
                    loadingMsg: "update Account row data...",
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
                    successMsg: `Groupname ${updatedarray.map(item => item.group_name)}  updated Succesfully.`,
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
                loadingMsg: "deleteing Account Data...",
            }))
            const body = otp.length ? { data: rows, otp: otp.join("") } : { data: rows }

            const deletdata = await DELETE_ACCOUNT_API(body)

            if (deletdata.status === 204) {
                setNotifyData((data) => ({
                    ...data,
                    loadingFlag: false,
                    loadingMsg: "delete Account row data...",
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
                    successMsg: `Data successfully deleted of groupname ${rows.map(item => item.group_name)}`,

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
            if (p) {
                location.reload()
            }
            return !p
        })

    };


    const funcMap = {
        add: addAccountData,
        delete: handleDeleteData,
        update: handleUpdate
    }


    const setTotal = () => {
        if (!gridRef.current) return

        const totalRow = { ...defaultTotalRow }

        gridRef.current?.api?.forEachNodeAfterFilterAndSort(({ data }) => {
            // console.log(data)
            totalRow["aed"] += data.aed || 0
            totalRow["inr"] += data.inr || 0
            totalRow["total_inr"] += data.total_inr || 0
        })
        // gridRef.current.api.setPinnedBottomRowData([totalRow])
        setTotalRow(totalRow)
    }


    const handleDatePickerChange = (date, dateStrings) => {
        setAccountRowData((prevState) => ({
            ...prevState,
            date: dateStrings,
        }));
    };
    // console.log("lol")
    const handleInputChange = (value, name) => {
        setAccountRowData(prevData => {
            if (name == "tran_type") {
                if (value === "INR") {
                    prevData["rate"] = 1
                    prevData["aed"] = 0
                    prevData["total_inr"] = 0
                }
                if (value === "AED") {
                    prevData["rate"] = 23
                    prevData["inr"] = 0
                    prevData["total_inr"] = 0
                }
            }
            if (["aed", "inr"].includes(name)) {
                if (prevData["tran_type"].toLocaleLowerCase() != name) return prevData

                if (name == "inr") {
                    prevData["aed"] = 0
                    prevData["total_inr"] = (prevData["rate"] * prevData["aed"]) + (+value)
                }
                if (name == "aed") {
                    prevData["inr"] = 0
                    prevData["total_inr"] = (prevData["rate"] * value) + (prevData["inr"])
                }
            }

            if (["inr", "aed"].includes(name)) value = +value
            return { ...prevData, [name]: value, }
        });
    };
    const uniqueValues = (field) => Array.from(new Set(AccountData.map(item => item[field]))).filter(e => e != null);
    const inputdata = [
        {
            type: "select", name: "group_name", placeholder: "Select Group Name", value: `${AccountRowData.group_name}`,
            option: groupname.map((val) => <Option key={val.id} value={val.groupName}>
                {val.groupName}
            </Option>)
        },
        { type: "select", name: "tran_type", placeholder: "Select Tran Type", value: `${AccountRowData.tran_type}` },
        { type: "select", name: "rec_and_paid", placeholder: "Select Rec And Paid", value: `${AccountRowData.rec_and_paid}` },
        { type: "text", name: "particulars", placeholder: " Particulars", value: `${AccountRowData.particulars}` },
        { type: "select", name: "mtm_margin", placeholder: "Select Mtm Margin", value: `${AccountRowData.mtm_margin}` },
        { type: "number", name: "rate", placeholder: "Rate", value: `${AccountRowData.rate}` },
        { type: "number", name: "aed", placeholder: "AED", value: `${AccountRowData.aed}`, hidden: !AccountRowData.tran_type || AccountRowData.tran_type == 'INR' },
        { type: "number", name: "inr", placeholder: "INR", value: `${AccountRowData.inr}`, hidden: !AccountRowData.tran_type || AccountRowData.tran_type == 'AED' },
        { type: "number", name: "total_inr", placeholder: "TOTAL_INR", value: `${AccountRowData.total_inr}` },
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

                    rowData={AccountData}
                    suppressAggFuncInHeader={true}
                    onCellValueChanged={onCellValueChanged}
                    rowSelection='multiple'

                    onModelUpdated={setTotal}
                    pinnedBottomRowData={[totalRow]}
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
                title={"Add Account LD Row"}
                flag={isAddAccountOpen}
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
                                    confirmMsg: "Are you sure, You want to add Account?",
                                    confirmAction: (e) =>
                                        addAccountData(e)
                                }))
                            }}
                        >
                            <Row className={style.formContent}>
                                <Form.Group className="mb-3 " as={Col}>
                                    <InputGroup
                                        hasValidation
                                    >
                                        <DatePicker
                                            onChange={handleDatePickerChange}
                                            format="YYYY-MM-DD"
                                            placeholder={"Date"}
                                            allowClear
                                            name="date"
                                            value={dayjs(AccountRowData.date, "YYYY-MM-DD")}
                                            className={style.datePicker}
                                        />
                                    </InputGroup>
                                </Form.Group>
                                {inputdata.map((item) => {
                                    return !item.hidden &&
                                        <Form.Group as={Col} md="12" className="mb-3 " >
                                            {(item.type == 'select') ?

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

                                                    {item.option ? item.option : (uniqueValues(item.name).map((val) => (
                                                        <Option key={val} value={val}>
                                                            {val}
                                                        </Option>
                                                    )))}
                                                </Select>

                                                :
                                                <TextField id="outlined-basic"
                                                    label={item.placeholder}
                                                    // variant="outlined"
                                                    fullWidth
                                                    // sx={{ m: 1 }}
                                                    type={item.type}
                                                    name={item.name}
                                                    value={item.value}
                                                    placeholder={item.placeholder}
                                                    onChange={(e) => handleInputChange(e.target.value, e.target.name)}
                                                    className={`mui-formcontrol ${style.muiformControl}`}

                                                />

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
            <ModalPopup
                size={"lg"}
                fullscreen={false}
                title={""}
                flag={isTowFAOpen}
                close={visibleTwoFA}
                className="riskmodalpopup"
                component={<OTPComp otp={otp} setOtp={setOtp} onSubmit={funcMap[isTowFAOpen]} />}
            />
        </div >
    )
}

export default Account