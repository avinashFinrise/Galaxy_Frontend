import { memo, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ImSearch } from "react-icons/im";
import profileUser from "../../assets/Icon/usericon1.png";
import userStyle from "./UserManagement.module.scss";
import Notification from "../DynamicComp/Notification/Notification";
import profile from "../Settings/ProfilePage/ProfilePage.module.scss";
import {
  GET_BASIC_PROFILE_API,
} from "../../API/ApiServices";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import UserPermission from "./UserPermission";
import { FaFilter } from "react-icons/fa";
import { ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";
import SetPassword from "./SetPassword";

const UserManagement = () => {
  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );
  const [selectedUserData, setSelectedUserData] = useState();
  const [searchValue, setSearchValue] = useState("");
  const [selectedRole, setSelectedRole] = useState('all');

  const selectDispatch = useDispatch();
  const isAdmin = useSelector(state => state?.userControlSettings?.role?.toLowerCase() == 'admin' ? true : false)
  // console.log("isAdmin", isAdmin)
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

  const [usersData, setUsersData] = useState([]);
  const CloseError = () => {
    setNotifyData((data) => ({ ...data, errorFlag: false }));
  };
  const CloseSuccess = () => {
    setNotifyData((data) => ({ ...data, successFlag: false }));
  };

  const handle = () => {
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "fetching data...",
    }));
    const api = new Promise((resolve, reject) => {
      resolve(
        GET_BASIC_PROFILE_API({
          users: "all",
        })
      );
    });
    api
      .then((res) => {
        setUsersData(res.data.result);
        setNotifyData({
          loadingFlag: false,
        });
      })
      .catch((err) => {
        console.log("******************", err);
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

  useEffect(() => {
    handle();
  }, []);


  const updateUserData = (props) => {
    let newData = usersData.map(e => {
      return e.id == props.id ? { ...e, is_active: !e.is_active } : e
    })

    // setUsersData(newData)
  }

  // console.log({ usersData });

  const handleUserData = (username) => {
    // e.preventDefault();
    setNotifyData((data) => ({
      ...data,
      loadingFlag: true,
      loadingMsg: "Fetching Data...",
    }));
    const selectedusername = usersData?.find((obj) => obj.username == username);

    try {
      if (selectedusername) {
        setNotifyData((prev) => {
          return {
            ...prev,
            loadingFlag: false,
          };
        });
        setSelectedUserData(selectedusername);
      }
    } catch (err) {
      console.log(err);
      setNotifyData((prev) => {
        return {
          ...prev,
          loadingFlag: false,
          // confirmFlag: false,
          errorFlag: true,
          errorMsg: "data not found",
          headerMsg: err.code,
        };
      });
    }
  };

  // const handleUserSettings = (e) => {
  //   const newState = { ...selectedUserData };
  //   newState.settings[e.target.name] =
  //     e.target.type == "checkbox"
  //       ? e.target.checked
  //       : // : e.target.name === "role"
  //       // ? +e.target.value
  //       e.target.value;
  //   setSelectedUserData(newState);
  //   selectDispatch(AllowUserSettings(newState));
  // };


  // console.log({ selectedUserData })
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-3">
          <div className={userStyle.allUserSection}>
            <div className={userStyle.searchUserSection}>

              <div
                className={`usermanagement-search-field ${userStyle.searchField}`}
              >
                <input
                  type="text"
                  placeholder="Search User"
                  className={`usermanagement-search-box  ${userStyle.searchBox}`}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                  }}
                />
                <span className={userStyle.searchIcon}>
                  <ImSearch />
                </span>
              </div>
              <div>
                <DropdownButton
                  as={ButtonGroup}
                  id={`dropdown-button-drop-start`}
                  drop="start"
                  // variant="secondary"
                  className="role-filter-toggle"
                  title={<span className={userStyle.filterIcon}>
                    <FaFilter />
                  </span>}
                  // value={selectedRole}
                  // onSelect={handleRoleSelect}
                  onSelect={(eventKey) => {
                    setSelectedRole(eventKey)
                  }}
                >
                  <Dropdown.Item className={userStyle.userDropItem} eventKey="all" active={selectedRole === "all"}>All  <span>{usersData.length}</span> </Dropdown.Item>
                  <Dropdown.Item className={userStyle.userDropItem} eventKey="admin" active={selectedRole === "admin"}>Admin    <span>{usersData.filter(obj => obj.rolename == "admin").length}</span></Dropdown.Item>
                  <Dropdown.Item className={userStyle.userDropItem} eventKey="client" active={selectedRole === "client"}>Client    <span>{usersData.filter(obj => obj.rolename == "client").length}</span></Dropdown.Item>
                </DropdownButton>
              </div>
            </div>

            <div
              className={`usermanagement-section ${userStyle.userManagement}`}
            >
              {usersData.length > 0
                ? usersData
                  // ?.filter((el) => {
                  //   return el.username
                  //     .toLowerCase()
                  //     .includes(searchValue.toLowerCase());
                  // })
                  ?.filter((el) => {
                    return (
                      el.username.toLowerCase().includes(searchValue.toLowerCase()) &&
                      (selectedRole === 'all' || el.rolename === selectedRole)
                    );
                  })
                  ?.sort((a, b) => a.username.toLowerCase().localeCompare(b.username.toLowerCase()))
                  ?.map((data) => {
                    // { console.log("))))", data) }
                    return (
                      <div
                        key={data.id}
                        className={`usermanagement-card ${userStyle.userManageCard} ${data.is_active == false ? userStyle.userManageCardDisable : userStyle.userManageCardEnable}`}
                        style={{
                          // backgroundColor: data.is_active == false ? "#c3c3c3" : "rgba(255, 255, 255, 0.8)",
                        }}
                        onClick={() => handleUserData(data.username)}
                      >
                        {/* {console.log("******************", data)} */}
                        <div className={userStyle.userIcon}>
                          <img src={profileUser} alt="usericon" />
                        </div>
                        {/* <div
                            className={`user-activate-blink ${userStyle.userBlink}`}
                          >
                            <div className={userStyle.blinkSection}>
                              <span className={userStyle.blinkCircle}></span>
                            </div>
                            <span className={userStyle.blinkCircle1}></span>
                          </div> */}
                        <div
                          className={`usermanagement-user-info ${userStyle.userInfo}`}
                        >
                          <h5 className={`fname ${userStyle.flName}`}>
                            {data.first_name}
                          </h5>
                          <h5 className={`username ${userStyle.username}`}>
                            {"@" + data.username}
                          </h5>
                        </div>
                        <div className={userStyle.roleSection}>
                          <span
                            // style={{ color: data.rolename == "admin" ? '#1d5a07' : ' #215fff' }}
                            style={
                              data.rolename == "admin"
                                ? {
                                  color:
                                    themeSetting == "body" ? "#1d5a07" : "#75efac",
                                }
                                : null
                            }
                          >
                            {data.rolename}
                          </span>
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          </div>
        </div>
        <div className="col-md-9 pl-0">
          <div className={userStyle.createBtn}>
            {isAdmin && <NavLink
              className={`basic-InfoBtn ${profile.basicInfoBtn} ${userStyle.usercreateBtn}`}
              to="/register"
            >
              Create New User
            </NavLink>}
          </div>

          <div className={isAdmin ? userStyle.settingTabContent1 : userStyle.userSettingFeature}>
            {selectedUserData && (
              <UserPermission
                data={selectedUserData}
                setSelectedUserData={setSelectedUserData}
                setUsersData={setUsersData}
                usersData={usersData}
                updateUserData={updateUserData}
              // onDeleteUser={deleteUser}

              // handleInput={handleInput}
              // handleDateChange={handleDateChange}
              // handleUserPermision={handleUserPermision}
              // handleUserSettings={handleUserSettings}
              />
            )}
            {selectedUserData && isAdmin && <SetPassword data={selectedUserData} />}
          </div>
        </div>
      </div >
      <Notification
        notify={NotifyData}
        CloseError={CloseError}
        CloseSuccess={CloseSuccess}
      />
    </div >
  );
};

export default memo(UserManagement);
