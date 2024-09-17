import { memo, useState } from "react";
import { Form } from "react-bootstrap";
import { AiFillFile } from "react-icons/ai";
import { FaToggleOn } from "react-icons/fa";
import { IoSettings } from "react-icons/io5";
import profile from "./ProfilePage.module.scss";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  POST_USERSETTING_API,
} from "../../../API/ApiServices";
import { ChangeThemeAction } from "../../../Redux/RMSAction";

const ProfileSetting = () => {
  const userControlSettings = useSelector(
    (state) => state.userControlSettings,
    shallowEqual
  );

  const themeSetting = useSelector(
    (state) => state?.defaulttheme,
    shallowEqual
  );
  let dispatch = useDispatch();
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

  // console.log(userControlSettings);
  const saveDefaultTheme = async (e) => {
    e.preventDefault();
    let userdata = {
      ...userControlSettings,
      setting_control: {
        ...userControlSettings.setting_control,
        defaulttheme: e.target.value,
      },
    };
    const api = new Promise((resolve, reject) => {
      resolve(
        POST_USERSETTING_API({
          event: "update",
          data: userdata,
        })
      );
    });
    // console.log(api);
    api
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          // console.log(e.target.value);
          dispatch(ChangeThemeAction(e.target.value));
          setNotifyData((prev) => {
            return {
              ...prev,
              loadingFlag: false,
              // confirmFlag: false,
              successFlag: true,
              successMsg: res.data.result,
            };
          });
        }
      })
      .catch((err) => {
        console.log("******************", err);
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
  };
  return (
    <div
      className={`basic-forminfo ${profile.basicInfo} ${profile.profileSetting}`}
    >
      <h5 className={profile.basicHeading}>
        <span className={profile.icons}>
          <IoSettings />
        </span>{" "}
        Setting
      </h5>
      <div className={profile.basicInfoSetting}>
        <div className="row">
          <Form.Group className={`col-md-6 ${profile.defaultLandingPage}`}>
            <Form.Label htmlFor="role" className="form-label">
              <span className={`label-icon ${profile.labelIcon}`}>
                <AiFillFile />
              </span>
              Default Landing Page:
            </Form.Label>
            <Form.Select
              name="landingpage"
              // value={data.rolename}
              // onChange={(e) => saveDefaultLandingPage(e)}
              className={profile.selectForm}
              required
            // defaultValue={Globalsettings.defaultlandingpage}
            >
              <option value="Select Default Landing Page" hidden>
                Select Default Landing Page
              </option>
              {/* {GlobalMenuitem && GlobalMenuitem.map((val) => { return val.show && <option key={val.id} value={val.href}>{val.title}</option> })} */}
            </Form.Select>
          </Form.Group>
          <Form.Group className={`col-md-6 ${profile.defaultLandingPage}`}>
            <Form.Label htmlFor="role" className="form-label">
              <span className={`label-icon ${profile.labelIcon}`}>
                <FaToggleOn />
              </span>
              Default Theme:
            </Form.Label>
            <Form.Select
              name="theme"
              // value={user.username}
              onChange={(e) => saveDefaultTheme(e)}
              className={profile.selectForm}
              required
              defaultValue={userControlSettings?.setting_control?.defaulttheme}
            >
              {/* {console.log(userControlSettings.setting_control.defaulttheme)} */}
              <option value="Select Default Landing Page" hidden>
                Select Default Theme
              </option>
              {/* {Globalsettings && Globalsettings.map((val) => { return <option key={val.id} value={val.id}>{val}</option> })} */}
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>
    </div>
  );
};

export default memo(ProfileSetting);
