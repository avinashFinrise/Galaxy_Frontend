import { useEffect, useState } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { GET_COMPONENTSETTING_API, GET_MARGIN_CONFIG_API, POST_COMPONENTSETTING_API } from '../../../API/ApiServices';
import alertAudio from "../../../assets/Audios/call-to-attention-alert.mp3";
import altStyle from "./AlertCard.module.scss";
import ComodityWise from './components/CommodityWise/ComodityWise';
import LimitReach from './components/Limit/LimitReach';
import ReversedPosition from './components/ReversedPosition/ReversedPosition';

const groupByColumns = (data, groupedKey, condition) => {
  const groupedData = {}
  data.map(row => {
    if (condition && !condition(row)) return
    const keyy = groupedKey.length <= 1 ? `${row?.[groupedKey[0]]}` : groupedKey.map(e => row[e]).join("-")
    if (!groupedData[keyy]) groupedData[keyy] = { ...row }
    else {
      Object.keys(row).map(column => {
        if (!isNaN(groupedData[keyy][column]) && !column.includes("id")) {
          groupedData[keyy][column] += row[column]
        }
      })
    }

  });

  return groupedData
}

const componentInfo = { componentname: "alert", componenttype: "card" }

const valueToCompare = {
  "commodity": "netmtm",
  "limit": "cfqty",
  "reversed": "cfqty"
}
const editableFields = {
  commodity: ["mtmlimit"],
  limit: ["clientlimit"],
  reversed: ["buyLimit", "sellLimit"],
}

const defaultTableData = {
  commodity: {},
  limit: {},
  reversed: {},
}

function NewAlert() {
  const positionData = useSelector((state) => state?.positionChart, shallowEqual);
  const [netPositionWithMargin, setNetPositionWithMargin] = useState([])
  const [marginConfData, setMarginConfigData] = useState([])
  const [groupedData, setGroupeddata] = useState()
  const [limitsReached, setLimitsReached] = useState({ ...defaultTableData })

  const [blinkSoundInfo, setBlinkSoundInfo] = useState({ ...defaultTableData })
  const [limitInputData, setLimitInputData] = useState({ ...defaultTableData })
  const [soundInstance, setSoundInstance] = useState(null)


  const [isBlinking, setIsBlinking] = useState({ commodity: false, limit: false, reversed: false })
  const [componentSetting, setComponentSetting] = useState({ ...defaultTableData })

  const pauseSound = () => {
    if (!soundInstance) return
    soundInstance.pause();
    soundInstance.currentTime = 0;
    setSoundInstance(null);
  }
  const playSound = () => {
    if (soundInstance) return
    const newAudio = new Audio(alertAudio);
    newAudio.loop = true;
    newAudio.play().catch((error) => console.error("Audio playback error:", error));
    setSoundInstance(newAudio);
  }

  useEffect(() => {
    (async () => {
      try {
        const { data } = await GET_COMPONENTSETTING_API({ componentname: componentInfo.componentname });

        const marginConfData = await GET_MARGIN_CONFIG_API()
        setMarginConfigData(marginConfData.data.result)
        if (data?.result) {
          setComponentSetting(data.result)

          const res = data.result[componentInfo.componenttype]?.setting
          if (res) {
            setBlinkSoundInfo({ ...defaultTableData, ...res })
            setLimitInputData({ ...defaultTableData, ...res?.inputData })
          }
        }
      } catch (error) {
        console.log({ error })
      }
    })()
  }, [])

  const updateLimitInput = async (tabelName, field, value, id) => {
    console.log({ tabelName, field, value, id })
    let updatedData;
    setBlinkSoundInfo(prevData => {
      if (!prevData[tabelName]) prevData[tabelName] = {}

      const currRow = prevData[tabelName]

      setNetPositionWithMargin((positions) => {
        return positions.map((position) => {
          if (position["positionno"] === id) {
            position = { ...position, [field]: value }
            const key = `${position.symbol}-${position.group_id}-${position.userid_id}`

            currRow[key] = currRow?.[key] ? { ...currRow[key], [field]: value } : { [field]: value }
          }
          return position;
        });
      });

      updatedData = { ...prevData, [tabelName]: currRow }
      return updatedData
    })



    try {
      const id = componentSetting?.[componentInfo.componenttype]?.id
      const body = {
        event: id ? "update" : "create",
        data: {
          ...componentInfo,
          setting: { ...blinkSoundInfo },
        },
      }
      if (id) body["data"]["id"] = id
      const ress = await POST_COMPONENTSETTING_API(body);
      // setComponentSetting(data.result)
    } catch (error) {
      console.log({ error })
    }
  }

  const updateSetting = async (data) => {
    let updatedData;
    setBlinkSoundInfo(prevToBlinkSound => {
      if (!prevToBlinkSound[data.componenttype]) prevToBlinkSound[data.componenttype] = {}

      const toBlinkSound = prevToBlinkSound[data.componenttype]

      setNetPositionWithMargin((positions) => {
        return positions.map((position) => {
          if (
            (data.isGroupedRow && position[data.key] === data.id) || (!data.isGroupedRow && position.positionno === data.id)
          ) {
            position = { ...position, ...data.data }

            const key = `${position.symbol}-${position.group_id}-${position.userid_id}`

            toBlinkSound[key] = toBlinkSound?.[key] ? { ...toBlinkSound[key], ...data.data } : data.data

          }
          return position;
        });
      });

      updatedData = { ...prevToBlinkSound, [data.componenttype]: toBlinkSound }
      return updatedData
    })


    try {
      const id = componentSetting?.[componentInfo.componenttype]?.id
      const body = {
        event: id ? "update" : "create",
        data: {
          ...componentInfo,
          setting: { ...updatedData },
        },
      }
      if (id) body["data"]["id"] = id
      const ress = await POST_COMPONENTSETTING_API(body);
      // setComponentSetting(data.result)
    } catch (error) {
      console.log({ error })
    }
  }


  useEffect(() => {
    let shouldSoundPlay = false
    let blink = { commodity: false, limit: false, reversed: false }

    const limitReaced = {}

    let userIdWisePosision = groupByColumns(positionData, ["symbol", "group_id", "userid_id"])
    const userIdWiseMarginConf = groupByColumns(marginConfData, ["symbol", "group", "userid_id"], row => row.margintype === "LOT")


    userIdWisePosision = Object.keys(userIdWisePosision).map(key => {
      const marginConf = { ...userIdWiseMarginConf[key] }
      const netPosition = { ...userIdWisePosision[key] };

      netPosition["marginConf"] = marginConf


      // //temp
      // netPosition["buyLimit"] = Math.random() * 100
      // netPosition["sellLimit"] = Math.random() * 100

      Object.keys(valueToCompare).map(tabelName => {
        netPosition[tabelName] = { ...blinkSoundInfo?.[tabelName]?.[key] }

        if (!netPosition[tabelName]["clientlimit"]) netPosition[tabelName]["clientlimit"] = netPosition["marginConf"]["allwed"] || 0

        // if (dbClientData) {
        //   editableFields[tabelName].map(editableColumn => {
        //     if (dbClientData[editableColumn]) netPosition[tabelName][editableColumn] = dbClientData[editableColumn]
        //   })
        //   // netPosition[tabelName]["clientlimit"] = dbClientData["clientlimit"] ? dbClientData["clientlimit"] : marginConf?.allowed

        //   // // console.log({after: netPosition, limit: netPosition["clientlimit"]})
        //   // netPosition[tabelName]["buyLimit"] = dbClientData["buyLimit"] || 0
        //   // netPosition[tabelName]["sellLimit"] = dbClientData["sellLimit"] || 0
        // }


        if (!limitReaced[tabelName]) limitReaced[tabelName] = {}
        if (netPosition[tabelName]["clientlimit"] && netPosition[tabelName]["clientlimit"] < Math.abs(netPosition[valueToCompare[tabelName]])) {
          limitReaced[tabelName][key] = netPosition

          if (blinkSoundInfo[tabelName]?.[key]) {
            if (blinkSoundInfo[tabelName][key].blink) blink[tabelName] = true
            if (blinkSoundInfo[tabelName][key].playSound) shouldSoundPlay = true
          }
        }
      })
      return netPosition
    })
    shouldSoundPlay ? playSound() : pauseSound()
    setIsBlinking(blink)
    setLimitsReached(limitReaced)

    setNetPositionWithMargin(userIdWisePosision)

    // if (netPositionWithMargin.length) return
    // setNetPositionWithMargin()
  }, [positionData, marginConfData, blinkSoundInfo])


  //-------------------react-grid-layout font size-------------
  const layout = useSelector((state) => state.layout, shallowEqual);
  const [fontSize, setFontSize] = useState(); // font size
  useEffect(() => {
    const data = layout?.lg?.filter(item => item.i === 'f');
    // console.log({ data })
    // Calculate font size based on X and Y values or any other logic
    const calculateFontSize = () => {
      const baseSize = 11; // your default font size
      const xFactor = 0.3; // adjust as needed
      const yFactor = 0.9; // adjust as needed

      // const calculatedSize = baseSize + data[0].h * xFactor + data[0].w * yFactor;
      const calculatedSize = baseSize + data[0]?.w * yFactor;

      // Ensure the font size is within a certain range
      const finalSize = Math.max(10, Math.min(calculatedSize, 70));
      // console.log("finalSize", finalSize);
      setFontSize(finalSize);
    };
    // Initial calculation
    calculateFontSize();
  }, [layout]);

  return (
    <div className={`row ${altStyle.alertmainSection} `}>
      <LimitReach fontSize={fontSize} updateLimitInput={updateLimitInput} blink={isBlinking["limit"]} updateSetting={updateSetting} tabelData={netPositionWithMargin} data={groupedData?.symbol} limitReached={limitsReached["limit"]} />
      <ComodityWise fontSize={fontSize} updateLimitInput={updateLimitInput} blink={isBlinking["commodity"]} updateSetting={updateSetting} limitReached={limitsReached["commodity"]} tabelData={netPositionWithMargin} />
      <ReversedPosition fontSize={fontSize} updateLimitInput={updateLimitInput} blink={isBlinking["reversed"]} updateSetting={updateSetting} limitReached={limitsReached["reversed"]} tabelData={netPositionWithMargin} />
    </div>
  )
}

export default NewAlert