import { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { LiaSave } from "react-icons/lia";
import { MdRestore } from "react-icons/md";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { POST_COMPONENTSETTING_API } from "../../../API/ApiServices";
import { ChangeWindowLayout, Changeitems, DashboardBottomAction, ToggleDashboardMode } from "../../../Redux/RMSAction";
import { DefaultItems, DefaultLayouts } from "../../../assets/json/DefaultLayouts";
import { Notification } from "../../DynamicComp/Notification";
import { saveToLS } from "./DashboardWindow";
import winStyle from "./DashboardWindow.module.scss";

const AddWindowPopup = (props) => {
  const isEditable = useSelector(s => s.isDashboardEditable)
  const layouts = useSelector((state) => state && state?.layout, shallowEqual);
  const [Notificationlength, setNotificationlength] = useState(false);
  const allowedWindows = useSelector(
    (state) => state && state?.allowedWindows,

  );
  // console.log({ updatedIi: allowedWindows })
  const dashboardBottom = useSelector(state => state?.dashboardBottom)
  const [dashBottom, setDashBottom] = useState(dashboardBottom?.dashboardBottomCheck)
  const dispatch = useDispatch()
  const userControlSettings = useSelector(
    (state) => state.userControlSettings,
    shallowEqual
  );
  useEffect(() => {
    if (!isEditable) dispatch(ToggleDashboardMode(true))
    return () => {
      if (!isEditable) dispatch(ToggleDashboardMode(false))
    }
  }, [])

  // console.log({ userControlSettings })
  const [finalData, setFinalData] = useState([])

  useEffect(() => {
    if (!allowedWindows && !layouts?.lg.length) return
    const data = []
    // console.log(DefaultLayouts.lg);
    DefaultLayouts.lg.forEach(e => {
      // console.log(allowedWindows);

      if (!allowedWindows.includes(e.i)) return console.log({ returned: DefaultLayouts })
      let currentItem = layouts.lg.find(p => p.i === e.i)
      if (currentItem) {
        data.push(currentItem)
      } else data.push({ ...e, hidden: true })
    })
    // console.log({ data });
    setFinalData(data)
  }, [allowedWindows, layouts])


  const widgetNames = {
    a: "ABS Watch",
    b: "MTM",
    c: "Position",
    d: "Symbol wise Limits",
    e: "Historical Data",
    f: "Alert",
    g: "C Position Product wise",
    h: "Margin & Exposure Grouping",
    i: "C Historical Data",
    j: "C MTM",
    k: "Service Manager",
    l: "Nifty Hedge Position",
    n: 'C Overall Summary',
    o: 'Market Watch',
    q: 'C Stress Test',
    r: 'Data Summary',
    s: 'MT5 Order Logs'
  };
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




  const onRemoveItem = (itemId) => {
    setFinalData(p => p.map(e => {
      if (e.i === itemId) e.hidden = true
      return e
    })
    )
  };
  const onAddItem = (itemId) => {
    setFinalData(p => p.map(e => {
      if (e.i === itemId) e.hidden = false
      return e
    })
    )

  };
  const handleChange = (e) => {
    if (e.target.id == "p") {
      setDashBottom(prev => !prev)
    } else {
      if (e.target.checked) {
        onAddItem(e.target.name);
      } else {
        onRemoveItem(e.target.name);
      }
    }
  }
  const PostDashboardBottom = async (dashBottomProp) => {
    const id = dashboardBottom?.id
    const body = {
      event: id ? "update" : "create",
      data: {
        componentname: "dashboardBottom", componenttype: "gridLayout",
        setting: { dashBottom: dashBottomProp },
      },
    }
    if (id) body.data["id"] = id;


    try {
      const { data } = await POST_COMPONENTSETTING_API(body)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSave = async () => {
    // console.log({ finalData })
    dispatch(ChangeWindowLayout({ lg: finalData }))
    dispatch(DashboardBottomAction({ dashboardBottomCheck: dashBottom }))
    PostDashboardBottom(dashBottom)

    props.windowCardSetting();
  };
  const restoreDefaultFuction = () => {
    dispatch(ChangeWindowLayout(DefaultLayouts))
    dispatch(Changeitems(DefaultItems))
    dispatch(DashboardBottomAction({ dashboardBottomCheck: true }))
    PostDashboardBottom(true)
    saveToLS("removedItems", DefaultItems);
    saveToLS("layouts", DefaultLayouts);
    props.windowCardSetting();
    setNotifyData((data) => ({ ...data, confirmFlag: false }))
  }

  const handleSelectAll = (e) => {
    const { checked } = e.target
    setFinalData(prev => prev.map(e => {
      return {
        ...e, hidden: !checked
      }
    }))
    props.pinedNavBar(checked)
    setDashBottom(checked)

  }

  return (
    <div className={winStyle.windowSettingSection}>
      {Notificationlength && (
        <p style={{ color: "red" }}>Select up-to maximum 15 windows!</p>
      )}
      <div className={`row ${winStyle.windowSettingItem}`}>
        <Form.Check
          type="checkbox"
          id={'selectAll'}
          label={'Select All'}
          onClick={handleSelectAll}
          checked={!finalData.some(e => e.hidden == true)}
          name={'selectAll'}
          key={'selectAll'}
          className={`col-md-3 ${winStyle.formCheck}`}
        />
        {finalData?.map((e) => (
          <Form.Check
            type="checkbox"
            id={e.i}
            label={widgetNames[e.i]}
            onClick={handleChange}
            checked={!e.hidden}
            name={e.i}
            key={e.i}
            className={`col-md-3 ${winStyle.formCheck}`}
          />
        ))}
        {userControlSettings?.card_control?.is_bottompricecard &&
          <Form.Check type="checkbox"
            id={"p"}
            label={"Bottom Price Card"}
            onClick={handleChange}
            checked={dashBottom}
            name={"p"}
            key={"p"}
            className={`col-md-3 ${winStyle.formCheck}`} />}

        <Form.Check type="checkbox"
          label="pin Navbar"
          onClick={props.pinedNavBar}
          checked={props.isNavVisible}
          name={" isNavVisible"}
          className={`col-md-3 ${winStyle.formCheck}`}
        />
      </div>
      <div className={`${winStyle.saveBtn} save-restore-btn`}>

        <button onClick={handleSave}><span><LiaSave /></span>save</button>
        <button
          // onClick={restoreDefaultFuction}
          onClick={(e) => {
            e.preventDefault();
            setNotifyData((data) => ({
              ...data,
              confirmFlag: true,
              confirmMsg: "Are you sure, You want to restore degalult layout ?",
              confirmAction: (e) =>
                restoreDefaultFuction(e)
            }))
          }}
        >
          <span><MdRestore /></span>Restore Default</button>
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

export default AddWindowPopup;
