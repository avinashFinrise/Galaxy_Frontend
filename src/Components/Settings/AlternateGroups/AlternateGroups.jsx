import React, { useEffect, useState } from 'react'
import { Button, Row } from 'react-bootstrap'
import { FaUserCog } from 'react-icons/fa'
import { MdDelete, MdEdit, MdSave } from "react-icons/md";
import { CREATE_GROUP_API, GET_FILTERS_API } from '../../../API/ApiServices'
import { ModalPopup } from '../../DynamicComp'
import { Notification } from '../../DynamicComp/Notification'
import profile from '../ProfilePage/ProfilePage.module.scss'
import AddGroups from './AddGroups'
import style from './AlternateGroups.module.scss'
import { Form, Input, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useFetcher } from 'react-router-dom'

const AlternateGroups = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
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
    const [showAddGroup, setShowAddGroup] = useState(false)
    const [alternateGroups, setAlternateGroups] = useState([])
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [alternategroupChange, setAlternategroupChange] = useState(true)
    const [editingMode, setEditingMode] = useState(false)
    const [alternateUserids, setAlternateUserids] = useState([])
    const [editedAlternateGroup, setEditedAlternateGroup] = useState({})
    const CloseConfirm = () => {
        setNotifyData((data) => ({ ...data, confirmFlag: false }));
    };

    const CloseError = () => {
        setNotifyData((data) => ({ ...data, errorFlag: false }));
    };
    const CloseSuccess = () => {
        setNotifyData((data) => ({ ...data, successFlag: false }));
    };

    const addGroup = () => {
        showAddGroup ? setShowAddGroup(false) : setShowAddGroup(true);
    };
    useEffect(() => {
        (async () => {
            try {
                const { data } = await CREATE_GROUP_API({
                    "event": "getalternatename"
                });
                setAlternateGroups(data.result)
            } catch (error) {
                console.log({ error })
            }
        })()
    }, [alternategroupChange])



    const onEdit = async (groupname) => {

        setEditingMode(true)
        // setNotifyData((prev) => ({
        //     ...prev,
        //     loadingFlag: true,
        //     loadingMsg: "Editing alternategroup...",
        // }));
        try {
            // console.log(groupname);
            const res = await GET_FILTERS_API({
                "event": "getuseridfilter", "data": {
                    "filters": {
                        "groupname": [groupname]
                    }
                }
            })
            const userids = res.data.result[groupname]
            // console.log({ userids });
            setAlternateUserids(userids)
            // setNotifyData((prev) => {
            //     return {
            //         ...prev,
            //         loadingFlag: false,
            //         successFlag: true,
            //         confirmFlag: false,
            //         successMsg: "userids Fetched...",
            //     };
            // })
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


    }
    const handleChange = (selectedValues, name) => {
        setEditedAlternateGroup(prev => ({ ...prev, [name]: selectedValues }))
    }
    useEffect(() => {
        if (!selectedGroup && !alternateGroups?.length) return
        const prevSelectedgroup = alternateGroups.find(value => value.id == selectedGroup?.id)
        setSelectedGroup(prevSelectedgroup)
    }, [alternateGroups])
    const onDelete = async (selectedGroupProp) => {
        setNotifyData((prev) => ({
            ...prev,
            loadingFlag: true,
            loadingMsg: "Deleting alternategroup...",
        }));
        try {
            const { data } = await CREATE_GROUP_API({
                "event": "deletealternatename",
                data: {
                    "id": selectedGroupProp.id
                }
            });
            setEditingMode(false)
            setAlternategroupChange(prev => !prev)

            setNotifyData((prev) => {
                return {
                    ...prev,
                    loadingFlag: false,
                    successFlag: true,
                    confirmFlag: false,
                    successMsg: "Deleted successfully",
                };
            });
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


    }
    const saveAlternategroup = async () => {
        if (editedAlternateGroup.id !== "" || null) {
            setNotifyData((prev) => ({
                ...prev,
                loadingFlag: true,
                loadingMsg: "loading...",
            }));
            try {
                const { data } = await CREATE_GROUP_API({
                    "event": "updatealternatename",
                    data: editedAlternateGroup
                });
                setEditingMode(false)
                setAlternategroupChange(prev => !prev)
                setNotifyData((prev) => {
                    return {
                        ...prev,
                        loadingFlag: false,
                        successFlag: true,
                        confirmFlag: false,
                        successMsg: "success",
                    };
                });
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
    // const selectedidanduser = {
    //     userid: selectedGroup.userid_list,
    //     id: selectedGroup.group_id
    // }
    const mappedObj = selectedGroup?.userid_list.map((val, i) => {
        return {
            userid: val,
            id: selectedGroup.user_id[i]
        }

    })
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600); // Adjust the breakpoint as needed
        };

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const showAlternateDetails = () => {
        showPopup
            ? setShowPopup(false)
            : setShowPopup(true);
    };
    const alternateGroupDetail = <>
        {selectedGroup && <Form
            // labelCol={{ span: 5 }}
            className={style.infoSection}
        >
            <div className={style.groupnameandedit}>

                <p ><b>Group Name : </b>{selectedGroup.group_name}</p>
                <div className={style.editSave}>
                    <p
                        className={style.editbutton}
                        onClick={() => onEdit(selectedGroup.group_name)}
                    >
                        <MdEdit />
                    </p>
                    {editingMode && <p className={style.savebutton} onClick={() =>
                        setNotifyData((data) => ({
                            ...data,
                            confirmFlag: true,
                            confirmMsg: "Are you sure, You want to save changes in Alternate Group?",
                            confirmAction: (e) =>
                                saveAlternategroup()
                        }))
                    }>
                        <MdSave />
                    </p>}
                    <p className={style.delete} onClick={() =>
                        setNotifyData((data) => ({
                            ...data,
                            confirmFlag: true,
                            confirmMsg: "Are you sure, You want to Delete Alternate Group?",
                            confirmAction: (e) =>

                                onDelete(selectedGroup)
                        }))
                    }>
                        <MdDelete />
                    </p>

                </div>
            </div>
            {editingMode ?
                <Form.Item label="Select Userid"
                    // rules={FormRule.commonRequired}
                    name="Userid"
                >
                    <Select
                        mode="multiple"
                        onChange={(selectedValues) =>
                            handleChange(selectedValues, "user")
                        }
                        defaultValue={
                            mappedObj.map(val => {
                                return {
                                    label: val.userid,
                                    value: parseInt(val.id)
                                }
                            })
                        }
                        value={
                            editedAlternateGroup?.user
                        }
                        showSearch={true}
                        filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        options={alternateUserids?.map((val) => {
                            return {
                                label: val.userid,
                                value: val.id,
                                // disabled: selectedGroup.userid_list.includes(val.userid),
                            };
                        })}
                    />
                </Form.Item>
                : <p><b>Userids :</b> {selectedGroup.userid_list.join(", ")}</p>}
            {editingMode ?
                <Form.Item label="Alternate Name"
                    name={"alternatename"}
                >
                    <Input
                        value={editedAlternateGroup?.alternate_name}
                        defaultValue={selectedGroup.alternate_name}
                        onChange={(e) => handleChange(e.target.value, "alternate_name")}
                    />
                </Form.Item> :
                <p><b>Alternet Name :</b> {selectedGroup.alternate_name}</p>}
            {editingMode ? <Form.Item label="Address"
                name="Address"

            >
                <TextArea
                    placeholder="Address"
                    autoSize={{ minRows: 2, maxRows: 6 }}
                    value={editedAlternateGroup?.address}
                    defaultValue={selectedGroup.address}
                    onChange={(e) => handleChange(e.target.value, "address")}
                />
            </Form.Item> : <p><b>Address:</b> {selectedGroup.address}</p>}
        </Form>}
    </>


    return (
        <div className={`basic-forminfo ${profile.basicInfo}`}>
            <div className={profile.headingSection}>
                <Row className={profile.contantSection}>
                    <div className="col-md-10">
                        <h5 className={profile.basicHeading}>
                            <span className={profile.icons}>
                                <FaUserCog />
                            </span>
                            Alternate Groups
                        </h5>
                    </div>
                    <div className={`col-md-2 ${profile.historyDateSection}`}>
                        <Button onClick={addGroup} className={style.addBtn}>Add</Button>
                    </div>
                </Row>
            </div>
            <div
                className={` ${profile.basicInfoSetting} ${profile.headingSection}`}
            >
                <div className="row">
                    <div className="col-md-3">
                        <div
                            className={style.alternateGroupInfo}
                        >
                            {alternateGroups?.map(obj =>
                                <div
                                    className={`alternateGroupCard ${style.alternateGroupCard} ${selectedGroup?.id == obj.id && style.active} `}
                                    // style={{
                                    //     backgroundColor:  ? "#c3c3c3" : "rgba(255, 255, 255, 0.8)",
                                    // }}

                                    onClick={() => {
                                        setEditedAlternateGroup({ id: obj.id })
                                        setSelectedGroup(obj)
                                        setEditingMode(false)
                                        showAlternateDetails()
                                    }}
                                >
                                    <div
                                        className={style.userInfo}
                                    >
                                        <h5 className={`groupname ${style.groupname}`}>
                                            {obj.group_name?.toUpperCase()}
                                        </h5>
                                        <h5 className={`alternatename ${style.alternatename}`}>
                                            {obj.alternate_name?.toUpperCase()}
                                        </h5>
                                    </div>

                                </div>
                            )}

                        </div>
                    </div>
                    <div className="col-md-9 pl-0">
                        {
                            isMobile ?
                                <ModalPopup
                                    size={"lg"}
                                    fullscreen={false}
                                    title=""
                                    flag={showPopup}
                                    close={showAlternateDetails}
                                    component={alternateGroupDetail}
                                /> :
                                <>{alternateGroupDetail}</>
                        }
                    </div>
                </div >
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
                title={"Add Alternate Group"}
                flag={showAddGroup}
                close={addGroup}
                component={<AddGroups setAlternategroupChange={setAlternategroupChange} />}
            />
        </div>
    )
}

export default AlternateGroups;

