import { useEffect, useState } from 'react'
import altStyle from "../../AlertCard.module.scss";
import { SlSettings } from "react-icons/sl";
import LimitTable from './LimitTable';
import { ModalPopup } from '../../../../DynamicComp';


function LimitReach({ fontSize, blink, limitReached, tabelData, updateSetting, updateLimitInput }) {
  const [isTabelOpen, setIsTabelOpen] = useState();
  const [isLimitExpanded, setIsLimitExpanded] = useState(false); //limit Reched
  const [limitReachedTableDataFlaged, setLimitReachedTableDataFlaged] = useState([]);

  useEffect(() => {
    if (!limitReached) return

    const res = {}

    // Object.values(limitReached).forEach(netPosition => {
    //   if (!res[netPosition.symbol]) res[netPosition.symbol] = { symbol: netPosition.symbol, limit: netPosition.clientlimit, used: netPosition.cfqty }
    //   else {
    //     res[netPosition.symbol].used += netPosition.cfqty || 0
    //     res[netPosition.symbol].limit += netPosition.clientlimit || 0
    //   }
    // })
    // console.log({  })

    Object.values(limitReached).map(netPosition => {
      const key = `${netPosition.symbol} | ${netPosition.groupname} | ${netPosition.userid}`
      if (!res[key]) res[key] = {
        title: key,
        limit: netPosition["limit"].clientlimit,
        used: netPosition.cfqty
      }
      else {
        res[key].used += netPosition.cfqty || 0
        res[key].limit += netPosition["limit"].clientlimit
      }
    })

    setLimitReachedTableDataFlaged(Object.values(res))

  }, [limitReached])

  const [soundInstance, setSoundInstance] = useState(null);


  // useEffect(() => {
  //   if (false) {
  //     if (soundInstance) return
  //     const newAudio = new Audio(alertAudio);
  //     newAudio.loop = true;
  //     newAudio.play().catch((error) => console.error("Audio playback error:", error));
  //     setSoundInstance(newAudio);
  //   } else {
  //     if (!soundInstance) return
  //     soundInstance.pause();
  //     soundInstance.currentTime = 0;
  //     setSoundInstance(null);
  //   }

  // }, [limitReachedTableData]);

  return (
    <>
      <div className={`col-md-12  ${altStyle.alertSection}`}>
        <div
          className={`${altStyle.alertCard} ${isLimitExpanded ? altStyle.alertCardSizeInc : ""} ${blink ? altStyle.limitReach : null}`}
          onClick={() => setIsLimitExpanded(p => !p)}
          style={{ fontSize: `${fontSize}px` }}
        >
          <p className={altStyle.alertTitle} style={{ fontSize: `${fontSize}px` }}>Limit Reached</p>
          <div className={altStyle.alertContentSection}>
            <p className={altStyle.alertContent}>
              Group Name:{" "}
              {limitReachedTableDataFlaged?.map((obj) => (
                <p> {obj.title}</p>
              ))}
            </p>
            <p className={altStyle.alertContent}>
              Allowed:{" "}
              {limitReachedTableDataFlaged?.map((obj) => (
                <p>
                  {obj?.limit}
                </p>
              ))}
            </p>
            <p className={altStyle.alertContent}>
              Used:
              {limitReachedTableDataFlaged?.map((obj) => (
                <p>
                  {obj?.used}
                </p>
              ))}
            </p>
          </div>
        </div>
        <div className={altStyle.alertSetting} style={{ fontSize: `${fontSize + 3}px` }} onClick={() => setIsTabelOpen(p => !p)}
        >
          <SlSettings />
        </div>
      </div>

      <ModalPopup
        fullscreen={true}
        title={"Limit Reached Alert Settings"}
        flag={isTabelOpen}
        close={() => setIsTabelOpen(false)}
        component={
          <LimitTable tabelData={tabelData} updateSetting={updateSetting} updateLimitInput={updateLimitInput} />
        }
      />
    </>
  )
}

export default LimitReach