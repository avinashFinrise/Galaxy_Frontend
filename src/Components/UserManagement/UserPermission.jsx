import { memo, useEffect, useMemo, useState } from "react";
import { Col, Form, InputGroup, Row } from "react-bootstrap";
// import Multiselect from "multiselect-react-dropdown";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import { AiOutlineCluster } from "react-icons/ai";
import { BsCalendar2EventFill } from "react-icons/bs";
import {
  FaAddressCard,
  FaCloudUploadAlt,
  FaFileExcel,
  FaUser
} from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import { MdGroup } from "react-icons/md";
import { useSelector } from "react-redux";
import {
  BASIC_PROFILE_API,
  GET_CLUSTER_API,
  GET_FILTERS_API,
  GET_USER_ROLE,
  LOGIN_USER_API,
  POST_USERSETTING_API,
  UPDATE_USERSETTING_API,
} from "../../API/ApiServices";
// import * as XLSX from 'xlsx';

import { HiBuildingOffice } from "react-icons/hi2";
import { readCSV } from "../../UtilityFunctions/readCSV";
import { readXLSX } from "../../UtilityFunctions/readXLSX";
import { Notification } from "../DynamicComp/Notification";
import profile from "../Settings/ProfilePage/ProfilePage.module.scss";
import userStyle from "./UserManagement.module.scss";

let allowedFormats = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"]
const UserPermission = (props) => {
  // const state = useSelector((state) => state, shallowEqual);

  // const [userdate, setUserdate] = useState();
  const isAdmin = useSelector(state => state?.userControlSettings?.role?.toLowerCase() == 'admin' ? true : false)

  const [accessApi, setAccessApi] = useState({
    filterData: { cluster: [], group: [], userid: [] },
    roles: [],
    card_control: {},
    clusterData: [],
  });
  // console.log("card_control", accessApi.card_control)
  const [assignfile, setAssignfile] = useState(false)

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
  const [validated, setValidated] = useState(false);

  // const [userSettings, setUserSettings] = useState(props.data.settings);
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    setValidated(true);
  };

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

    const userid = props.data.id;
    // console.log(props.data.id);
    (async () => {
      setNotifyData((data) => ({
        ...data,
        loadingFlag: true,
        loadingMsg: "Fetching all  Data...",
      }));
      try {

        const apiData = await Promise.allSettled([
          // GET_GROUP_API(),
          GET_USER_ROLE(),
          POST_USERSETTING_API({ event: "get", data: { id: userid } }),
          GET_CLUSTER_API(),
          GET_FILTERS_API({
            event: "getconfigfilters",
            data: {
              filters: {
                cluster: [],
                group: [],
                userid: [],
              },
            },
          }),
        ]);
        const [userrole, getuserSettings, clusterData, filterData] = apiData;

        if (clusterData.value) {
          setAccessApi((previous) => ({
            ...previous,
            clusterData: clusterData.value.data.result,
          }));
        }
        if (userrole.value) {
          setAccessApi((previous) => ({
            ...previous,
            roles: userrole.value.data.result,
          }));
        }
        if (getuserSettings.value) {
          // console.log({ getuserSettings });
          // let role=userrole.data.result.find(e=>e.role==getuserSettings.data.result[0].role)?.id // set role 
          // setUserdate(
          //   dayjs(getuserSettings.data.result[0].date_range.fromdate)
          // );

          setAccessApi((previous) => ({
            ...previous,
            card_control: { ...getuserSettings.value.data.result[0], role: props.data.role },

          }));
        }
        if (filterData.value) {
          setAccessApi((previous) => ({
            ...previous,
            filterData: filterData.value.data.result,
          }));
        }
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
          };
        });
      } catch (error) {
        console.log("error", error);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            // confirmFlag: false,
            errorFlag: true,
            errorMsg: "data not found  ",
            headerMsg: error.code,
          };
        });
      }
    })();

    setAssignfile(false)
  }, [props.data.id]);

  const handleSubmitUserAccessPermissions = (e) => {
    e.preventDefault();
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Plaese Wait",
    }));
    let dataToSend = {
      // id: props.data.id,
      id: accessApi.card_control.id,
      card_control: accessApi.card_control.card_control,
      page_control: accessApi.card_control.page_control,
      setting_control: accessApi.card_control.setting_control,
      // setting_control: {
      //   ...accessApi.card_control.setting_control,
      //   is_defaulttheme:
      //     accessApi?.card_control?.setting_control?.is_defaulttheme,
      // },
    };
    const createGroupConfig = new Promise((resolve, reject) => {
      resolve(
        UPDATE_USERSETTING_API({
          event: "update",
          data: dataToSend,
        })
      );
    });
    createGroupConfig
      .then((res) => {
        if (res.status === 200) {
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              successFlag: true,
              successMsg: res.data.result,
            };
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            errorFlag: true,
            errorMsg: err.response?.data.reason,
            headerMsg: err.code,
          };
        });
      });
  };
  const handleSubmitUserSettings = (e) => {
    e.preventDefault();
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Please Wait",
    }));
    let dataToSend = {
      // id: props.data.id,
      id: accessApi.card_control.id,
      access_groups: accessApi.card_control.access_groups,
      date_range: accessApi.card_control.date_range,
      auto_assign: accessApi.card_control.auto_assign,
      company_name: accessApi.card_control.company_name,

    };

    let roleAssing = {
      id: props.data.id,
      username: props.data.username,
      role: accessApi.card_control.role,
    };

    // const updateControl = new Promise((resolve, reject) => {
    //   resolve(
    //     UPDATE_USERSETTING_API({
    //       event: "update",
    //       data: dataToSend,
    //     })
    //   );
    // });
    const accessPermission = new Promise((resolve, reject) => {
      resolve(
        UPDATE_USERSETTING_API({
          event: "update",
          data: dataToSend,
        })
      );
    });
    const idPermission = new Promise((resolve, reject) => {
      resolve(
        BASIC_PROFILE_API({
          event: "update_user",
          data: roleAssing,
        })
      );
    });
    const updateControl = Promise.all([accessPermission, idPermission]);
    updateControl
      .then((res) => {
        // if (res.status === 200) {

        // console.log("****************", res);
        if (res.every((result) => result.status === 200)) {
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              successFlag: true,
              // successMsg: res[0].data.result,
              successMsg: "User Updated Successfully!!"
            };
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            errorFlag: true,
            errorMsg: typeof err.response?.data.reason == "object" ? JSON.stringify(err.response?.data.reason, null, 2) : err.response?.data.reason,
            headerMsg: err.code,
          };
        });
      });
  };

  const handleRoleChange = (e) => {
    setAccessApi((prev) => ({
      ...prev,
      card_control: {
        ...prev.card_control,
        role: +e.target.value,
      },
    }));
    // setAccessApi((prev) => ({
    //   ...prev,
    //   card_control: {
    //     ...prev.card_control,
    //     // role: {
    //     ...prev.card_control.role,
    //     [e.target.name]:
    //       e.target.name === "role" ? +e.target.value : e.target.value,
    //     // },
    //   },
    // }));
  };

  const handlePageSettings = (e, value) => {
    setAccessApi((previous) => ({
      ...previous,
      card_control: {
        ...previous.card_control,
        page_control: {
          ...previous.card_control.page_control,
          [e.target.name]: !value,
        },
      },
    }));
  };

  const handleCardSetting = (e, value) => {
    setAccessApi((previous) => ({
      ...previous,
      card_control: {
        ...previous.card_control,
        card_control: {
          ...previous.card_control.card_control,
          [e.target.name]: !value,
        },
      },
    }));
  };

  const handleSettingControl = (e, value) => {
    setAccessApi((previous) => ({
      ...previous,
      card_control: {
        ...previous.card_control,
        setting_control: {
          ...previous.card_control.setting_control,
          [e.target.name]: !value,
        },
      },
    }));
  };

  const handleFilterChange = async (selectValue, filterName) => {
    let currentLength = selectValue.length;
    // const remove = currentLength < previousLength ? true : false
    // console.log(selectValue, filterName);
    if (selectValue.includes("selectAll")) {
      if (filterName == "cluster_id") {
        selectValue = accessApi?.clusterData?.map((val) => val.id);
      }
      if (filterName == "group_id") {
        selectValue = accessApi.filterData?.group?.map((val) => val.id);
      }
      if (filterName == "userid_id") {
        selectValue = accessApi.filterData?.userid?.map((val) => val.id);
      }
    }


    console.log({ selectValue });


    try {
      setAccessApi((prev) => ({
        ...prev,
        // filterData: remainingObject,
        card_control: {
          ...prev.card_control,
          access_groups: {
            ...prev.card_control.access_groups,
            [filterName]: selectValue,
          },
        },
      }));
      if (filterName == "cluster_id") {
        try {
          const filteredApiData = await Promise.all([
            GET_FILTERS_API({
              event: "getconfigfilters",
              data: {
                filters: {
                  cluster: selectValue,
                  group: [],
                  userid: [],
                },
              },
            }),
          ]);
          const [apiData] = filteredApiData;
          // console.log(apiData);
          setAccessApi((prev) => ({
            ...prev,
            // filterData: remainingObject,
            filterData: {
              ...prev.filterData,
              group: currentLength == 0 ? [] : apiData.data.result.group,
              userid: currentLength == 0 ? [] : apiData.data.result.userid,
            },
            card_control: {
              ...prev.card_control,
              access_groups: {
                ...prev.card_control.access_groups,
                // group_id: selectValue.length != 0 ? apiData.data.result.group.map(val => val.id) : [],

                // userid_id: remove ? selectValue.length != 0 ? apiData.data.result.userid.map(val => val.id) : [] : prev.card_control.access_groups.userid_id
              }
            }
          }));
        } catch (e) {
          console.log(e);
        }
      }
      if (filterName == "group_id") {
        try {
          const filteredApiData = await Promise.all([
            GET_FILTERS_API({
              event: "getconfigfilters",
              data: {
                filters: {
                  cluster: accessApi?.card_control?.access_groups?.cluster_id,
                  group: selectValue,
                  userid: [],
                },
              },
            }),
          ]);
          const [apiData] = filteredApiData;
          setAccessApi((prev) => ({
            ...prev,
            // filterData: remainingObject,
            filterData: {
              ...prev.filterData,
              userid: currentLength == 0 ? [] : apiData.data.result.userid,
            },
            card_control: {
              ...prev.card_control,
              access_groups: {
                ...prev.card_control.access_groups,
                // userid_id: remove ? selectValue.length != 0 ? apiData.data.result.userid.map(val => val.id) : [] : prev.card_control.access_groups.userid_id
              }
            }
          }));
        } catch (e) {
          console.log(e);
        }
      }
      // if (filterName == "userid_id") {
      //   const filteredApiData = await Promise.all([
      //     GET_FILTERS_API({
      //       event: "getconfigfilters",
      //       data: {
      //         filters: {
      //           cluster:
      //             filterName ==
      //             accessApi?.card_control?.access_groups?.cluster_id,
      //           group: accessApi?.card_control?.access_groups?.cluster_id,
      //           userid: selectValue,
      //         },
      //       },
      //     }),
      //   ]);
      //   const [apiData] = filteredApiData;
      //   console.log("apiData", apiData);
      //   setAccessApi((prev) => ({
      //     ...prev,
      //     // filterData: remainingObject,
      //     filterData: {
      //       ...prev.filterData,
      //       userid: apiData.data.result.userid,
      //     },
      //   }));
      // }
      // let parts = filterName.split("_");
      // let selectedFilterName = parts[0];
      // console.log("selectedFilterName", selectedFilterName);
      // const [extractedValue, remainingObject] = extractKey(filterData.data.result, selectedFilterName);

      // const {[selectedFilterName],...remaining} = filterData.data.result;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDateChange = (date, dateStrings) => {
    setAccessApi((current) => ({
      ...current,
      card_control: {
        ...current.card_control,
        date_range: {
          ...current.card_control.date_range,
          fromdate: dateStrings,
        },
      },
    }));
  };

  let clusterOptions = useMemo(() => {
    let cluster = accessApi?.clusterData?.map((val) => {
      return {
        label: val?.clustername,
        value: val?.id,
      };
    });
    cluster.length > 0 && cluster?.unshift({ label: "Select All", value: "selectAll" });
    return cluster;
  }, [accessApi]);

  let groupOptions = useMemo(() => {
    let group = accessApi?.filterData?.group?.map((val) => {
      // console.log(val.clustername);
      return {
        label: val?.groupname,
        value: val?.id,
        // value: val?.id?.toString(),
      };
    });
    group.length > 0 && group?.unshift({ label: "Select All", value: "selectAll" });
    return group;
  }, [accessApi]);

  let userIdOptions = useMemo(() => {

    let userIdOption = accessApi?.filterData?.userid?.map((val) => {
      // console.log(val.clustername);
      return {
        label: val?.userId,
        value: val?.id,
        // value: val?.id?.toString(),
      };
    });
    userIdOption.length > 0 && userIdOption?.unshift({ label: "Select All", value: "selectAll" });
    return userIdOption;
  }, [accessApi]);



  const toggleCardControlProperties = (e) => {
    const updatedAccessApi = { ...accessApi };
    for (let key in updatedAccessApi.card_control?.page_control) {
      updatedAccessApi.card_control.page_control[key] = e.target.checked;
    }
    for (let key in updatedAccessApi.card_control?.card_control) {
      updatedAccessApi.card_control.card_control[key] = e.target.checked;
    }
    for (let key in updatedAccessApi.card_control?.setting_control) {
      updatedAccessApi.card_control.setting_control[key] = e.target.checked;
    }
    setAccessApi(updatedAccessApi);
  };
  const allCardControlPropertiesChecked = () => {
    for (const key in accessApi.card_control?.page_control) {
      if (!accessApi.card_control.page_control[key]) {
        return false;
      }
    }
    for (const key in accessApi.card_control?.card_control) {
      if (!accessApi.card_control.card_control[key]) {
        return false;
      }
    }
    for (const key in accessApi.card_control?.setting_control) {
      if (!accessApi.card_control.setting_control[key]) {
        return false;
      }
    }
    return true;
  };


  const findId = (data, dataToFind, key) => {
    const matchingItem = data.find(item => item[key] == dataToFind)

    return matchingItem ? matchingItem.id : null
  }

  const handleFileUpload = async (e) => {
    e.preventDefault();
    let fileData = {
      clustername: [], groupname: [], userid: []
    }
    const file = e.target.files[0];
    if (!allowedFormats.includes(file.type)) {
      setNotifyData({ ...NotifyData, errorFlag: true, errorMsg: 'Only file with extension .xlsx or .csv allowed' });
      return;
    }

    if (file) {
      const data = e.target.files[0]?.type == 'text/csv' ? await readCSV(file) : await readXLSX(file);
      data.forEach(val => {
        if (!fileData['clustername'].includes(val.clustername)) fileData['clustername'].push(val.clustername)
        if (!fileData['groupname'].includes(val.groupname)) fileData['groupname'].push(val.groupname)
        if (!fileData['userid'].includes(val.userid)) fileData['userid'].push(val.userid)
      })

      let clusterids = []
      let groupids = []
      let userids = []
      fileData.clustername.forEach(e => clusterids.push(findId(accessApi.filterData.cluster, e, 'clustername')))
      fileData.groupname.forEach(e => groupids.push(findId(accessApi.filterData.group, e, 'groupname')))
      fileData.userid.forEach(e => userids.push(findId(accessApi.filterData.userid, e, 'userId')))

      setAccessApi((prev) => ({
        ...prev,
        card_control: {
          ...prev.card_control,
          access_groups: {
            ...prev.card_control.access_groups,
            "cluster_id": clusterids,
            "group_id": groupids,
            "userid_id": userids,
          },
        },
      }));

    }

    //=================================  below code is required to work with xlsx package==============================================
    // const reader = new FileReader();
    // reader.readAsBinaryString(e.target.files[0]);
    // reader.onload = (e) => {
    //   const data = e.target.result;
    //   const workbook = XLSX.read(data, { type: 'binary' });
    //   const sheetName = workbook.SheetNames[0];
    //   const sheet = workbook.Sheets[sheetName];
    //   const parsedData = XLSX.utils.sheet_to_json(sheet);

    //   parsedData.forEach(val => {


    //     if (!fileData['clustername'].includes(val.clustername)) fileData['clustername'].push(val.clustername)
    //     if (!fileData['groupname'].includes(val.groupname)) fileData['groupname'].push(val.groupname)
    //     if (!fileData['userid'].includes(val.userid)) fileData['userid'].push(val.userid)

    //     // if(!fileData['clustername'].includes(val.clustername)) fileData['clustername'].push(findId(accessApi.filterData.cluster,val.clustername,'clustername'))
    //     // if(!fileData['groupname'].includes(val.groupname)) fileData['groupname'].push(findId(accessApi.filterData.group,val.groupname,'groupname'))
    //     // if(!fileData['userid'].includes(val.userid)) fileData['userid'].push(findId(accessApi.filterData.userid,val.userid,'userid'))
    //   })

    //   let clusterids = []
    //   let groupids = []
    //   let userids = []
    //   fileData.clustername.forEach(e => clusterids.push(findId(accessApi.filterData.cluster, e, 'clustername')))
    //   fileData.groupname.forEach(e => groupids.push(findId(accessApi.filterData.group, e, 'groupname')))
    //   fileData.userid.forEach(e => userids.push(findId(accessApi.filterData.userid, e, 'userId')))

    //   setAccessApi((prev) => ({
    //     ...prev,
    //     card_control: {
    //       ...prev.card_control,
    //       access_groups: {
    //         ...prev.card_control.access_groups,
    //         "cluster_id": clusterids,
    //         "group_id": groupids,
    //         "userid_id": userids,
    //       },
    //     },
    //   }));

    // }
    //===============================================code ends here=======================================================================



  }

  const handleDeleteUser = (e) => {

    e.preventDefault();
    // props.setSelectedUserData(prev => ({ ...prev, username: props.data }));

    setNotifyData((prev) => ({
      ...prev,
      loadingFlag: true,
      loadingMsg: "deleted user...",
    }));
    const userDelete = new Promise((resolve, reject) => {
      resolve(LOGIN_USER_API({
        event: "deleteuser",
        source: 'web',
        data: {
          username: props.data.username
        }
      }));
    });
    userDelete
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              successFlag: true,
              confirmFlag: false,
              successMsg: res.data.result,
            };
          });
          props.setUsersData(props?.usersData?.filter(obj => obj?.username !== props?.data?.username))
          props.setSelectedUserData(null);
          // Assuming you have a logic to update usersData after deletion
          // props.setUsersData(/* Updated user data after deletion */);

          // // Clear the selected user data after deletion
          // props.setSelectedUserData(null);
        }
      })
      .catch((err) => {
        console.log(err);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            errorFlag: true,
            confirmFlag: false,
            errorMsg: err.response?.data.reason,
          };
        });
      });
  }


  const handleDisableUser = (e) => {
    e.preventDefault();

    // props.data.is_active = !props.data.is_active
    props.setUsersData(prev => (
      prev.map(userData => {
        if (userData.id == props.data.id) { return { ...userData, is_active: !props.data.is_active } }
        return userData
      }
      )
    ))
    props.setSelectedUserData(prev => ({ ...prev, is_active: !props.data.is_active }));
    setNotifyData((prev) => ({
      ...prev,
      loadingFlag: true,
      loadingMsg: `${props.data.is_active ? 'disabled' : 'enabled'} user...`,
    }));
    const disableuser = new Promise((resolve, reject) => {
      resolve(BASIC_PROFILE_API({
        event: "update_user",
        data: {
          id: props.data.id,
          username: props.data.username,
          is_active: !props.data.is_active
        }
      }));
    });
    disableuser
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              successFlag: true,
              confirmFlag: false,
              successMsg: res.data.result,
            };
          });
          props.updateUserData(props.data)
        }
      })
      .catch((err) => {
        console.log(err);
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
            errorFlag: true,
            confirmFlag: false,
            errorMsg: "error",
          };
        });
      });
  }

  const handleAutoAssign = (e) => {
    console.log(e.target.name, e.target.id)
    if (e.target.name == 'company_name') {
      setAccessApi(previous => ({
        ...previous,
        card_control: {
          ...previous.card_control,
          [e.target.name]: e.target.id
        }
      }))
    } else {
      setAccessApi(previous => ({
        ...previous,
        card_control: {
          ...previous.card_control,
          auto_assign: !previous.card_control.auto_assign
        }
      }))
    }
  }

  const pageControls = [
    { label: "Dashboard", name: "is_dashboard" },
    { label: "Setting", name: "is_settings" },
    { label: "SpreadBook", name: "is_spreadbook" },
    { label: "NetPosition", name: "is_netposition" },
    { label: "User Management", name: "is_usermanagement" },
    { label: "Report", name: "is_report" },
  ];
  const cardControls = [
    { label: "ARB Watch", name: "is_arb_watch" },
    { label: "MTM", name: "is_mtm" },
    { label: "Position", name: "is_position" },
    { label: "Symbol Wise limits", name: "is_symbol_limit" },
    { label: "Historical Data", name: "is_historical" },
    { label: "Alert", name: "is_c_alert" },
    { label: "C Position Product Wise", name: "is_c_position" },
    { label: "Margin & Exposure Grouping", name: "is_margin_and_exposure_grouping" },
    { label: "C Historical Data", name: "is_c_historical" },
    { label: "C MTM", name: "is_c_mtm" },
    { label: "Service Manager", name: "is_service_manager" },
    { label: "Nifty Hedge Position", name: "is_hedge_position" },
    { label: "C Overall Summary", name: "is_overall_summary" },
    { label: "Market Watch", name: "is_marketwatch" },
    { label: "Bottom Price Card", name: "is_bottompricecard" },
    { label: "C Stress Test", name: "is_c_stress_test" },
    { label: "Data Summary", name: "is_data_summary" },
    { label: "MT5 Order Logs", name: "is_mt5order_logs" },
  ];
  const settingControls = [
    { label: "Profile", name: "is_profile" },
    { label: "Change Password", name: "is_changepassword" },
    { label: "Create UserId", name: "is_createuserid" },
    { label: "Create Group", name: "is_group" },
    { label: "Create Cluster", name: "is_cluster" },
    { label: "Set User Configuration", name: "is_userconfig" },
    { label: "Group Configuration", name: "is_groupconfig" },
    { label: "Trade", name: "is_tradebook" },
    { label: "Settlement", name: "is_settlement" },
    { label: "USD Rate Setting", name: "is_usdrate" },
    { label: "Margin Configuration", name: "is_marginconfig" },
    { label: "Limit Allotment", name: "is_marginallotment" },
    { label: "Strategy Creator", name: "is_strategycreator" },
    { label: "Verify Report", name: "is_verifyreport" },
    { label: "Ledger", name: "is_ledger" },
    { label: "Save ArbMtm", name: "is_savearbmtm" },
    { label: "Alternate Groups", name: "is_alternategroup" },
    { label: "CTCL ID", name: "is_ctclid" }
  ];


  return (
    <div>
      <div className={`basic-forminfo ${profile.basicInfo}`}>
        <div className={userStyle.mainHeadingSection}>
          <div className={userStyle.headingSection}>
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <FaAddressCard />
              </span>
              <span style={{ color: "#218838", textTransform: 'capitalize' }}>{props.data.username}&nbsp; </span> User Settings
            </h5>
          </div>
          {isAdmin &&
            <div className={`btn-section ${userStyle.btnSection}`}>
              <button
                className={`disable-btn ${userStyle.disableBtn}`}
                onClick={(e) => {
                  e.preventDefault();
                  setNotifyData((data) => ({
                    ...data,
                    confirmFlag: true,
                    confirmMsg: `Are you sure, You want to  ${props.data.is_active ? 'disable' : 'enable'} user ?`,
                    confirmAction: (e) =>
                      handleDisableUser(e)
                  }))
                }}
              >
                {props.data.is_active ? 'Disable' : 'Enable'}
              </button>
              <button
                className={userStyle.deleteBtn}
                // onClick={handleDeleteUser}
                onClick={(e) => {
                  e.preventDefault();
                  setNotifyData((data) => ({
                    ...data,
                    confirmFlag: true,
                    confirmMsg: "Are you sure, You want to delete user ?",
                    confirmAction: (e) =>
                      handleDeleteUser(e)
                  }))
                }}
              >
                Delete
              </button>
            </div>
          }

        </div>
        <Form
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
          className={profile.basicInfoSetting}
        >
          <Row className="">
            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <BsCalendar2EventFill />
                </span>
                Start Date
                <span className={profile.mendatory}>*</span>
              </Form.Label>

              <DatePicker
                format="YYYY-MM-DD" // Specify the date format
                placeholder={"Date"}
                allowClear // Set to true if you want to allow clearing the
                className={profile.datePicker}
                // disabledDate={(current) => {
                //   return current.isBefore(userdate, "day");
                // }}
                onChange={handleDateChange}
                // selected={dayjs(accessApi?.card_control?.date_range?.fromdate)}
                value={dayjs(accessApi?.card_control?.date_range?.fromdate)}

              // defaultValue={[dayjs(date.fromdate), dayjs(date.todate)]}
              />
            </Form.Group>
            <Form.Group as={Col} md="6" className="mb-3">
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <FaUser />
                </span>
                Role Name
                <span className={profile.mendatory}>*</span>
              </Form.Label>
              <Form.Select
                // value={props.data.role}
                defaultValue={props.data.rolename}
                aria-label="Floating label select example"
                name="role"
                required
                onChange={handleRoleChange}
              >
                <option value="Select Role" hidden>
                  {props.data.rolename}
                </option>
                {accessApi.roles?.map((val) => {
                  return (
                    <option key={val.id} value={val.id}>
                      {val.role}
                    </option>
                  );
                })}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please choose Role
              </Form.Control.Feedback>
            </Form.Group>



            <Form.Group as={Col} md="12" className="mb-3 antdMultiSelect">
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <AiOutlineCluster />
                </span>
                Select Cluster {accessApi?.card_control?.access_groups?.cluster_id?.length}
                <span className={profile.mendatory}>*</span>
              </Form.Label>
              {/* <InputGroup hasValidation> */}

              <Select
                mode="multiple"
                name="clustername"
                allowClear
                showSearch={true}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
                placeholder="Please select"
                value={accessApi?.card_control?.access_groups?.cluster_id}
                onChange={(selectedValues) =>
                  handleFilterChange(selectedValues, "cluster_id", "add")
                }
                options={clusterOptions}
                className="antdSelect"
                disabled={assignfile}

              />
              {/* <MultiSelectInput maxHeight={50} options={clusterOptions} /> */}
              {/* <Form.Control.Feedback type="invalid">
                Select Group Name
              </Form.Control.Feedback>
            </InputGroup> */}
            </Form.Group>
            <Form.Group as={Col} md="12" className="mb-3 antdMultiSelect">
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <MdGroup />
                </span>
                Group Name {accessApi?.card_control?.access_groups?.group_id?.length}
                <span className={profile.mendatory}>*</span>
              </Form.Label>
              {/* <InputGroup hasValidation> */}

              <Select
                mode="multiple"
                name="groupName"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select"
                showSearch={true}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={accessApi?.card_control?.access_groups?.group_id}
                onChange={(selectedValues) =>
                  handleFilterChange(selectedValues, "group_id")
                }
                disabled={assignfile}
                options={groupOptions}
                className="antdSelect"
              />

              {/* <Form.Control.Feedback type="invalid">
                Select Group Name
              </Form.Control.Feedback>
            </InputGroup> */}
            </Form.Group>
            <Form.Group as={Col} md="12" className="mb-3 antdMultiSelect">
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <MdGroup />
                </span>
                UserId {accessApi?.card_control?.access_groups?.userid_id?.length}
                <span className={profile.mendatory}>*</span>
              </Form.Label>
              {/* <InputGroup hasValidation> */}

              <Select
                mode="multiple"
                name="userid"
                allowClear
                style={{ width: "100%" }}
                placeholder="Please select"

                showSearch={true}
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                value={accessApi?.card_control?.access_groups?.userid_id}
                onChange={(selectedValues) =>
                  handleFilterChange(selectedValues, "userid_id")
                }
                options={userIdOptions}
                disabled={assignfile || accessApi?.card_control?.auto_assign}
                className="antdSelect"
              />
              {/* <Form.Control.Feedback type="invalid">
                Select Group Name
              </Form.Control.Feedback>
            </InputGroup> */}
            </Form.Group>

            <Form.Group as={Col} md="4" className={`mb-1 ${userStyle.assignFileSwitch}`}>
              <InputGroup >
                <Form.Check
                  type="switch"
                  label="OR you can assign id's from file"
                  name="assignfile"
                  checked={assignfile}
                  onChange={() => setAssignfile(previous => !previous)}
                />
              </InputGroup>
            </Form.Group>
            {assignfile ? <Form.Group as={Col} md="5" className="ms-1 ">
              <Form.Label htmlFor="chooseProfilePic">
                <span className={`label-icon ${profile.labelIcon}`}>
                  <FaFileExcel />
                </span>
                Assign Ids from file
                <span className={userStyle.browseFile}><FaCloudUploadAlt /></span>
              </Form.Label>
              <InputGroup >
                <Form.Control
                  style={{ display: 'none' }}
                  type="file"
                  name="file"
                  id="chooseProfilePic"
                  onChange={handleFileUpload}
                  required
                />
              </InputGroup>
            </Form.Group>
              : null}
            <Form.Group as={Col} md="12" className={`mb-1 ${userStyle.assignFileSwitch}`}>
              <InputGroup >
                <Form.Check
                  type="switch"
                  label="Auto Assign Userid"
                  name="auto_assign"
                  onChange={handleAutoAssign}
                  checked={accessApi?.card_control?.auto_assign}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group
              className={`row mb-4 mt-3  ${userStyle.assignCompany}`}
            >
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <HiBuildingOffice />
                </span>
                Company Name
              </Form.Label>
              <Form.Check
                type="radio"
                label="cosmic"
                id="cosmic"
                name="company_name"
                className="col-md-4 ms-3 text-uppercase"
                onChange={handleAutoAssign}
                checked={accessApi?.card_control?.company_name == 'cosmic'}
              />
              <Form.Check
                type="radio"
                label="finrise"
                id="finrise"
                onChange={handleAutoAssign}
                name="company_name"
                checked={accessApi?.card_control?.company_name == 'finrise'}
                className="col-md-4 ms-3 text-uppercase"

              />
            </Form.Group>
          </Row>
          <div>
            {/* <Button type="submit" className={`basic-InfoBtn ${profile.basicInfoBtn}`}>Update</Button> */}
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Save"
              onClick={handleSubmitUserSettings}
            // onClick={(e) => {
            //   e.preventDefault();
            //   setNotifyData((data) => ({
            //     ...data,
            //     confirmFlag: true,UserId Permissions
            //     confirmMsg:
            //       "Are you sure, You want to change userid permissions?",
            //     confirmAction: (e) => handleSubmitUserSettings(e),
            //   }));
            // }}
            />
          </div>
        </Form>
      </div>
      <div className={`basic-forminfo ${profile.basicInfo}`}>
        <div className={userStyle.mainHeadingSection}>
          <div className={userStyle.headingSection}>
            <h5 className={profile.basicHeading}>
              <span className={profile.icons}>
                <FaAddressCard />
              </span>
              <span style={{ color: "#218838", textTransform: 'capitalize' }}>{props.data.username}&nbsp; </span> User Access Permissions
            </h5>
          </div>
          <div className={userStyle.fullAccess}>
            <Form.Check
              type="switch"
              label="Full Access"
              // checked={accessApi.card_control.card_control}
              checked={allCardControlPropertiesChecked()}
              onChange={(e) => toggleCardControlProperties(e)}
            />

            {/* <pre>{JSON.stringify(accessApi, null, 2)}</pre> */}
          </div>
          {/* <div className={userStyle.username}>
            <label htmlFor="">@{props.data.username}</label>
          </div> */}
        </div>
        <Form
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
          className={profile.basicInfoSetting}
        >
          <Row className="mb-3">
            <Form.Group
              as={Col}
              md="4"
              className="mb-4"
            >
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <IoSettings />
                </span>
                Pages
              </Form.Label>
              {pageControls.map((item => {
                return (<Form.Check
                  type="switch"
                  label={item.label}
                  name={item.name}
                  onChange={(e) =>
                    handlePageSettings(
                      e,
                      accessApi?.card_control?.page_control?.[item.name]
                    )
                  }
                  checked={accessApi?.card_control?.page_control?.[item.name]}
                />)
              }))}
            </Form.Group>
            <Form.Group as={Col} md="4" className="mb-3">
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <IoSettings />
                </span>
                Cards
              </Form.Label>
              {cardControls.map((item) => {
                return (<Form.Check
                  type="switch"
                  label={item.label}
                  name={item.name}
                  onChange={(e) =>
                    handleCardSetting(
                      e,
                      accessApi?.card_control?.card_control?.[item.name]
                    )
                  }
                  checked={accessApi?.card_control?.card_control?.[item.name]}
                />)
              })}

            </Form.Group>
            <Form.Group as={Col} md="4" className="mb-3">
              <Form.Label>
                <span className={`label-icon ${profile.labelIcon}`}>
                  <IoSettings />
                </span>
                Setting
              </Form.Label>
              {settingControls.map((item) => {
                return (<Form.Check
                  type="switch"
                  label={item.label}
                  name={item.name}
                  onChange={(e) =>
                    handleSettingControl(
                      e,
                      accessApi?.card_control?.setting_control?.[item.name]
                    )
                  }
                  checked={accessApi?.card_control?.setting_control?.[item.name]}
                />)
              })}
            </Form.Group>
          </Row>
          <div>
            <input
              type="submit"
              className={`basic-InfoBtn ${profile.basicInfoBtn}`}
              value="Save"
              onClick={handleSubmitUserAccessPermissions}
            />
          </div>
        </Form>
      </div>
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
        CloseConfirm={CloseConfirm}
      />
    </div>
  );
};
export default memo(UserPermission);