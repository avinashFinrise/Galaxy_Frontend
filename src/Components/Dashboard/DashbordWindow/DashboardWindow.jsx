import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { ChangeWindowLayout, Changeitems } from "../../../Redux/RMSAction";
import Widget from "./Widget";
import winStyle from "./DashboardWindow.module.scss";
import { GET_COMPONENTSETTING_API, POST_COMPONENTSETTING_API } from "../../../API/ApiServices";
import { DefaultLayouts, } from "../../../assets/json/DefaultLayouts";

const ResponsiveGridLayout = WidthProvider(Responsive);

function DashboardWindow() {
  const [currentLayouts, setCurrentLayout] = useState()
  const items = useSelector((state) => state && state?.items, shallowEqual);
  const isEditbale = useSelector(s => s.isDashboardEditable)
  const layouts = useSelector((state) => state && state?.layout, shallowEqual);

  const dispatch = useDispatch();

  const componentInfo = { componentname: "dashboard", componenttype: "gridLayout" }
  const [componentSetting, setComponentSetting] = useState(null)

  const allowedWindows = useSelector(
    (state) => state && state?.allowedWindows,
    shallowEqual
  );




  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API(componentInfo)

        setComponentSetting(data.result)
        const setting = data.result[componentInfo.componenttype]?.setting
        if (setting?.layout.length) {

          dispatch(ChangeWindowLayout({ lg: setting?.layout }));
          // setting?.layout.forEach(e => !e.hidden && console.log("gggg", e))
          dispatch(Changeitems(setting?.items));
        } else dispatch(ChangeWindowLayout(DefaultLayouts))
      } catch (error) {
        console.log({ error })
      }
    })()
  }, [])

  const [finalLayout, setFinalLayout] = useState([])


  useEffect(() => {
    const out = []
    layouts.lg.forEach(e => {
      if (!e.hidden && allowedWindows.includes(e.i)) {
        out.push(e)
      }
    })
    setFinalLayout(out)
  }, [layouts, allowedWindows])



  const onLayoutChange = (allLayouts, updatedItem) => {
    if (!componentSetting || !isEditbale) return

    const updatedlayouts = layouts.lg.map(item => {
      const i = allLayouts?.find(e => e.i == item.i)
      return i ? i : item;

    })

    updatedlayouts.forEach(e => !e.hidden && console.log(e))



    // const updatedlayouts = layouts.lg?.map(obj => {
    //   const foundChangedLayout = allLayouts.lg?.find(changedObj => changedObj.i == obj.i)
    //   if (foundChangedLayout) {
    //     obj = foundChangedLayout
    //     return obj
    //   } else return obj
    //   // console.log({ foundChangedLayout });
    // })

    // console.log({ updatedlayouts })
    dispatch(ChangeWindowLayout({ lg: updatedlayouts }));
    // console.log({ updatedlayouts, changedLayout });


    const id = componentSetting[componentInfo.componenttype]?.id
    const body = {
      event: id ? "update" : "create",
      data: {
        ...componentInfo,
        setting: { layout: updatedlayouts, items: items },
      },
    }
    if (id) body.data["id"] = id;

    (async () => {
      try {
        const { data } = await POST_COMPONENTSETTING_API(body)
      } catch (error) {
        console.log(error)
      }
    })()
  };



  return (
    <div className={winStyle.dashWindowSection}>
      <ResponsiveGridLayout
        className=" layout "
        layouts={{ lg: finalLayout, md: DefaultLayouts.md, sm: DefaultLayouts.sm }}
        breakpoints={{ lg: 1280, md: 992, sm: 767, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 8, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        margin={[5, 5]}  //card margin gap
        useCSSTransforms={true}
        isResizable={isEditbale}
        isDraggable={isEditbale}
        onLayoutChange={onLayoutChange}
        compactType={"vertical"}
      >
        {finalLayout.map((key, idx) => {
          return (
            <div
              key={key.i}
              className={winStyle.widget}
              data-grid={{ w: 5, minW: 3, h: 5, minH: 5, x: idx, y: Infinity }}
            >
              <Widget id={key.i} layouts={layouts} />
            </div>
          )
        })}
      </ResponsiveGridLayout>
    </div>
  );
}

export function getFromLS(key) {
  let ls = {};
  if (window.localStorage) {
    try {
      ls = JSON.parse(window.localStorage.getItem(key)) || {};
    } catch (e) { }
  }
  return ls[key];
}

export function saveToLS(key, value) {
  if (window.localStorage) {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...getFromLS(key),
        [key]: value,
      })
    );
  }
}


// export default withSize({ refreshMode: "debounce", refreshRate: 60 })(
//   DashboardWindow
// );

export default DashboardWindow