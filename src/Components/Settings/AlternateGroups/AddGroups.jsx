import React, { useEffect, useState } from 'react'
import { Button, Form, Input, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import style from './AlternateGroups.module.scss'
import { CREATE_GROUP_API, GET_FILTERS_API, GET_GROUP_API } from '../../../API/ApiServices'
import { Notification } from '../../DynamicComp/Notification'


const AddGroups = ({ setAlternategroupChange }) => {
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
    const [allGroups, setallGroups] = useState()
    const [alternateGroup, setAlternateGroup] = useState({
        group: "",
        alternate_name: "",
        address: "",
        user: []

    })
    const [alternateUserids, setAlternateUserids] = useState()
    const CloseConfirm = () => {
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };

    useEffect(() => {
        (async () => {
            try {
                const { data } = await GET_GROUP_API();
                setallGroups(data.result)
                // curentnetPositions.current = data.result
                // data.result.forEach(e => {
                //     positions.add(e.positionno)
                //     tokens.add(e.token)
                // })
                // console.log({ data });

            } catch (error) {
                console.log({ error })
            }
        })()
    }, [])

    const handleChange = async (selectedValues, key) => {
        // console.log({ selectedValues });
        if (key == "group") {
            setAlternateGroup(prev => ({ ...prev, [key]: selectedValues.split("-")[1] }))
            const res = await GET_FILTERS_API({
                "event": "getuseridfilter", "data": {
                    "filters": {
                        "groupname": [selectedValues.split("-")[0]]
                    }
                }
            })
            const userids = res.data.result[selectedValues.split("-")[0]]
            // console.log({ userids });
            setAlternateUserids(userids)
        }
        else if (key == "user") { setAlternateGroup(prev => ({ ...prev, [key]: selectedValues.map(e => e.split("-")[1]) })) }
        else setAlternateGroup(prev => ({ ...prev, [key]: selectedValues }))
    }
    useEffect(() => {
        console.log({ alternateGroup });
    }, [alternateGroup])
    const createAlternateGroup = async () => {
        if (alternateGroup.address !== "", alternateGroup.alternate_name != "", alternateGroup.group != "") {
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: true,
                loadingMsg: "loading...",
            }));
            try {
                const { data } = await CREATE_GROUP_API({
                    "event": "setalternatename",
                    "data": { ...alternateGroup }
                });

                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                        successFlag: true,
                        confirmFlag: false,
                        successMsg: "success",
                    };
                });
                setTimeout(() => {
                    setNotifyData((prev) => {
                        return {
                            ...prev,
                            loadingFlag: false,
                            successFlag: false,
                            confirmFlag: false,
                            successMsg: "success",
                        };
                    })
                }, 1000);
                setAlternategroupChange(prev => !prev)
            } catch (error) {
                console.log(error);
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                        errorFlag: true,
                        confirmFlag: false,
                        // errorMsg: error.response?.data.reason,
                        errorMsg: 'something went wrong'
                    };
                });
            }
        } else {
            console.log("please fill all the options");
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: true,
                loadingMsg: "please fill all the options...",
            }));
        }
    }
    return (
        <div>
            <Form
                labelCol={{ span: 5 }}
                // layout="horizontal"
                className={style.addAlternateForm}
                onFinish={(e) => {
                    // e.preventDefault();
                    setNotifyData((data) => ({
                        ...data,
                        confirmFlag: true,
                        confirmMsg: "Are you sure, You want to create Alternate Group?",
                        confirmAction: (e) =>
                            createAlternateGroup(e)
                    }))
                }}
            >
                <Form.Item label="Select Group"
                    rules={FormRule.commonRequired}
                    name="groupname"
                >
                    <Select
                        onChange={(selectedValues) =>
                            handleChange(selectedValues, "group")
                        }
                        showSearch={true}
                        filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        options={allGroups?.map((val) => {
                            return {
                                label: val.groupName,
                                value: `${val.groupName}-${val.id}`,
                            };
                        })}
                    />
                    {/* <Select
                        onChange={(selectedValues) =>
                            handleChange(selectedValues, "group")
                        }
                        showSearch={true}
                        filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        options={allGroups?.map((val) => {
                            return {
                                label: val.groupName,
                                value: val.id,
                            };
                        })}
                    /> */}
                </Form.Item>
                <Form.Item label="Select Userid"
                    rules={FormRule.commonRequired}
                    name="Userid"
                >
                    <Select
                        mode="multiple"
                        onChange={(selectedValues) =>
                            handleChange(selectedValues, "user")
                        }
                        showSearch={true}
                        filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        options={alternateUserids?.map((val) => {
                            return {
                                label: val.userid,
                                value: `${val.userid}-${val.id}`,
                            };
                        })}
                    />

                </Form.Item>
                <Form.Item label="Alternate Name"
                    rules={FormRule.commonRequired}
                    name={"alternatename"}
                >
                    <Input
                        value={alternateGroup.alternate_name}
                        onChange={(e) => handleChange(e.target.value, "alternate_name")}
                    />
                </Form.Item>
                <Form.Item label="Address"
                    rules={FormRule.commonRequired}
                    name="Address"

                >
                    <TextArea
                        placeholder="Address"
                        autoSize={{ minRows: 2, maxRows: 6 }}
                        value={alternateGroup.address}
                        onChange={(e) => handleChange(e.target.value, "address")}
                    />
                </Form.Item>
                <Form.Item className={style.createBtn}>
                    <Button
                        htmlType="submit"
                    // onClick={(e) => {
                    //     e.preventDefault();
                    //     setNotifyData((data) => ({
                    //         ...data,
                    //         confirmFlag: true,
                    //         confirmMsg: "Are you sure, You want to create Alternate Group?",
                    //         confirmAction: (e) =>
                    //             createAlternateGroup(e)
                    //     }))
                    // }}
                    // onClick={createAlternateGroup}
                    >Create</Button>
                </Form.Item>
            </Form>
            <Notification
                notify={NotifyData}
                CloseError={CloseError}
                CloseSuccess={CloseSuccess}
                CloseConfirm={CloseConfirm}
            />
        </div>
    )
}

export default AddGroups


export const FormRule = {
    commonRequired: [{ required: true }],
};