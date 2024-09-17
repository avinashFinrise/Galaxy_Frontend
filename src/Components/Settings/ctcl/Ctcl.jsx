import { AgGridReact } from 'ag-grid-react';
import { Form, Input, Select } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Row } from 'react-bootstrap';
import { FaUserCog } from 'react-icons/fa';
import { GET_CTCL_API, GET_EXCHANGE_API, GET_USERID_MASTER, POST_CTCL_API } from '../../../API/ApiServices';
import useGridSettings from '../../CustomHook/useGridSettings';
import { ModalPopup } from '../../DynamicComp';
import { Notification } from '../../DynamicComp/Notification';
import profile from '../ProfilePage/ProfilePage.module.scss';
import style from './Ctcl.module.scss';

const componentInfo = { componentname: "ctcl", componenttype: "table" }
const defaultEmptydata = {
    event: "create",
    data: {
        userid: "",
        ctclid: "",
        exchange: "",
        broker: "",
    }
};


const Ctcl = () => {
    const gridRef = useRef();
    const [form] = Form.useForm();
    const [form1] = Form.useForm();
    const [visibleForm, setVisibleForm] = useState(false)
    const [ctclApiData, setCtclApiData] = useState([])
    const [updateData, setUpdateData] = useState({
        id: '',
        userid: "",
        ctclid: '',
        exchange: '',
        broker: ''

    })
    const [visibleUpdate, setVisibleUpdate] = useState(false)
    const [ctclRowData, setCtclRowData] = useState(defaultEmptydata)
    const [apiData, setApiData] = useState({
        userId: [],
        exchange: []
    })
    // console.log({ updateData })

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


    const fetchData = async () => {
        try {
            setNotifyData({
                loadingFlag: true,
                loadingMsg: `Fetching risk Data...`,
            });
            const apiData = await GET_CTCL_API()
            setCtclApiData(apiData.data.result);
            setNotifyData({ ...NotifyData, loadingFlag: false });

        } catch (err) {
            console.log(err)
            setNotifyData({ loadingFlag: false, errorFlag: true, errorMsg: err.response?.data.reason || "Error fetching data" });
        }
    }
    useEffect(() => {
        fetchData();
        (async () => {
            try {
                const getdata = await Promise.all([
                    GET_USERID_MASTER(),
                    GET_EXCHANGE_API()
                ]);
                const [userId, exchange] = getdata
                if (userId) {
                    setApiData((prev) => ({
                        ...prev,
                        userId: userId.data.result
                    }));
                }
                if (exchange) {
                    setApiData((prev) => ({
                        ...prev,
                        exchange: exchange.data.result
                    }));
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
    }, [])



    // console.log({ updateData })
    function generateColDef(key) {
        let option = null;
        option = { headerName: key.toUpperCase(), field: key, sortable: true, hide: false, filter: true, enableValue: true, };

        if (key == "action") {
            option['cellRenderer'] = (grid) => {
                return <button
                    onClick={() => {
                        setUpdateData(grid.data);
                        setVisibleUpdate(true)
                    }}
                    className={style.updateBtn}
                >Update</button>
            }
        }
        return option;
    }


    const { gridProps, onReady, GridNotifyData } = useGridSettings({
        gridApi: gridRef,
        componentInfo: componentInfo,
        onReload: fetchData,
        colDef: { generateColDef, row: { ...ctclApiData[0], action: " " } },
        groupBy: ctclApiData && ctclApiData.length ? Object.keys(ctclApiData[0]) : [],
        settings: {
            sideBar: true,
        }
    })

    useEffect(() => {
        if (!ctclApiData?.length) return
        onReady()
    }, [ctclApiData])

    const getRowId = useCallback((params) => {
        return params.data.id;
    });


    const handleAdddata = async (e) => {
        e.preventDefault()
        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "adding ctcl data...",
            }));

            const response = await POST_CTCL_API(ctclRowData);
            const newRowData = response.data;

            setCtclApiData((prevData) => [...prevData, newRowData]);

            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                successFlag: true,
                successMsg: "Successfully created",
            }));

            setCtclRowData(defaultEmptydata);
            setVisibleForm(false)
            // location.reload()
            fetchData();
        } catch (err) {
            console.log(err);
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                errorFlag: true,
                errorMsg: err.response?.data.reason || "Error adding data",
                headerMsg: err.code,
            }));
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault()
        if (!gridRef.current) return
        try {
            setNotifyData((data) => ({
                ...data,
                loadingFlag: true,
                loadingMsg: "updating Account Data...",
            }))

            const response = await POST_CTCL_API({ event: "update", data: updateData });
            const newRowData = response.data;
            // console.log({ response, newRowData })
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: false,
                confirmFlag: false,
                successFlag: true,
                successMsg: newRowData.result
            }));
            setVisibleUpdate(false)
            // location.reload()
            fetchData();
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

    const visibleAddCard = () => {
        setVisibleForm(p => !p)
    };
    const inputs = [
        {
            name: 'userid', type: "select", label: 'Select User ID', value: `${ctclRowData.data.userid}`,
            option: apiData.userId.map((val) => {
                return {
                    label: val.userId,
                    value: val.userId,
                };
            })
        },
        { name: 'ctclid', label: 'CTC ID', value: `${ctclRowData.data.ctclid}` },
        {
            name: 'exchange', type: 'select', label: 'Select Exchange', value: `${ctclRowData.data.exchange}`,
            option: apiData.exchange.map((val) => {
                return {
                    label: val.exchange,
                    value: val.exchange,
                };
            })
        },
        { name: 'broker', label: 'Broker', value: `${ctclRowData.data.broker}` },
    ];


    const updateinput = [
        { name: 'ctclid', label: 'CTC ID', value: updateData?.ctclid },
        {
            name: 'exchange', type: 'select', label: 'Select Exchange',
            option: apiData.exchange.map((val) => {
                return {
                    label: val.exchange,
                    value: val.exchange,
                };
            }),
            value: updateData?.exchange

        },
        { name: 'broker', label: 'Broker', value: updateData?.broker },
    ];
    const handleInputChange = (value, name) => {
        setCtclRowData((prevData) => ({
            ...prevData,
            data: {
                ...prevData.data,
                [name]: value,
            }
        }));

        setUpdateData((prevData) => ({
            ...prevData,
            [name]: value,

        }));

    };


    return (
        <div className={`basic-forminfo ${profile.basicInfo} ${style.ctclSection}`}>
            <div className={profile.headingSection}>
                <Row className={profile.contantSection}>
                    <div className="col-md-10">
                        <h5 className={profile.basicHeading}>
                            <span className={profile.icons}>
                                <FaUserCog />
                            </span>
                            CTCL
                        </h5>
                    </div>
                    <div className={`col-md-2 ${profile.historyDateSection}`}>
                        <Button style={{ width: "100%" }} className={style.addBtn}
                            onClick={visibleAddCard}
                        >Add</Button>
                    </div>
                </Row>
            </div>
            <div
                style={{ height: '55vh' }}
                className={profile.headingSection}
            >
                <AgGridReact
                    className="ag-theme-alpine"
                    {...gridProps}
                    ref={gridRef}
                    getRowId={getRowId}
                    rowData={ctclApiData}
                    suppressAggFuncInHeader={true}
                    rowSelection='multiple'

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
                title={"Add Ctcl"}
                flag={visibleForm}
                close={visibleAddCard}
                component={
                    <Form
                        form={form}
                        onFinish={(e) => {
                            setNotifyData((data) => ({
                                ...data,
                                confirmFlag: true,
                                confirmMsg: "Are you sure, You want to add data?",
                                confirmAction: (e) =>
                                    handleAdddata(e)
                            }))
                        }}
                        labelCol={{
                            span: 5,
                        }}
                        className={style.addCtclForm}
                    >
                        {inputs.map(e => {
                            return (
                                <Form.Item
                                    key={e.name}
                                    label={e.label}
                                    name={e.name}
                                    rules={[{ required: true, message: `Please input your ${e.label}!` }]}
                                >
                                    {(e.type == "select") ? (
                                        <Select
                                            showSearch
                                            allowClear
                                            name={e.name}
                                            value={e.value}
                                            style={{ width: "100%" }}
                                            onChange={(value) => handleInputChange(value, e.name)}// Assuming handleInputChange is modified accordingly
                                            aria-label="Floating label select example"
                                            required
                                            placeholder={e.label}
                                            className={style.antdSelect}
                                            options={e.option}

                                        />
                                    )
                                        : (
                                            <Input
                                                onChange={(ee) => handleInputChange(ee.target.value, e.name)}
                                                value={e.value}
                                                placeholder={e.label}
                                            />
                                        )
                                    }
                                </Form.Item>
                            )
                        })}

                        <Form.Item className={style.submitBtn}>
                            <Button type="primary" htmlType="submit" >
                                Submit
                            </Button>
                        </Form.Item>
                    </Form>
                }
            />
            <ModalPopup
                size={"lg"}
                fullscreen={false}
                title={"Update Ctcl"}
                flag={visibleUpdate}
                close={() => setVisibleUpdate(false)}
                component={
                    <Form
                        form={form1}
                        onFinish={handleUpdate}
                        labelCol={{
                            span: 5,
                        }}
                        className={style.addCtclForm}
                    >
                        {updateinput.map(e => {
                            return (
                                <Form.Item
                                    key={e.name}
                                    label={e.label}
                                    name={e.name}
                                    rules={[{ required: true, message: `Please input your ${e.label}!` }]}
                                >

                                    {(e.name === "exchange") ? (
                                        <Select
                                            showSearch
                                            allowClear
                                            name={e.name}
                                            defaultValue={e.value}
                                            value={e.value}
                                            style={{ width: "100%" }}
                                            onChange={(value) => handleInputChange(value, e.name)}// Assuming handleInputChange is modified accordingly
                                            aria-label="Floating label select example"
                                            required
                                            className={style.antdSelect}
                                            options={e.option}
                                        />
                                    )
                                        : (
                                            <Input
                                                name={e.name}
                                                defaultValue={e.value}
                                                value={e.value}
                                                onChange={(ee) => handleInputChange(ee.target.value, e.name)}
                                            />
                                        )
                                    }
                                </Form.Item>
                            )
                        })}

                        <Form.Item className={style.submitBtn}>
                            <Button type="primary" htmlType="submit" onClick={(e) => {
                                setNotifyData((data) => ({
                                    ...data,
                                    confirmFlag: true,
                                    confirmMsg: "Are you sure, You want to update data?",
                                    confirmAction: (e) =>
                                        handleUpdate(e)
                                }))
                            }}>
                                update
                            </Button>
                        </Form.Item>
                    </Form>
                }
            />


        </div>

    );
};

export default Ctcl;
