import { useEffect, useState } from 'react'
import altStyle from "../../AlertCard.module.scss";
import { SlSettings } from "react-icons/sl";
import { ModalPopup } from '../../../../DynamicComp';
import ReversedTabel from './ReservedPositionTabel';

function ReversedPosition({ fontSize, blink, limitReached, updateSetting, updateLimitInput, tabelData }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [limitReachedTableDataFlaged, setLimitReachedTableDataFlaged] = useState([]);
    const [isTabelOpen, setIsTabelOpen] = useState(false)


    useEffect(() => {
        if (!limitReached) return
        // const res = {}

        // Object.values(limitReached).map(netPosition => {
        //     const key = `${netPosition.symbol} | ${netPosition.groupname} | ${netPosition.userid}`
        //     if (!res[key]) res[key] = { title: key, limit: netPosition.clientlimit, used: netPosition.cfqty }
        //     else {
        //       res[key].used += netPosition.cfqty || 0
        //       res[key].limit += netPosition.clientlimit || 0
        //     }
        // })

        // setLimitReachedTableDataFlaged(Object.values(res))
        setLimitReachedTableDataFlaged(Object.values(limitReached || {}))
    }, [limitReached])

    return (
        <div className={`col-md-12  ${altStyle.alertSection}`}>
            <div
                className={`${altStyle.alertCard} ${altStyle.reversedPosition} ${isExpanded ? altStyle.alertCardSizeInc : ""
                    } ${blink ? altStyle.limitReach : null}`}
                onClick={() => setIsExpanded(p => !p)}
                style={{ background: "#075792", fontSize: `${fontSize}px` }}
            >
                <p className={altStyle.alertTitle} style={{ fontSize: `${fontSize}px` }}>Reversed Position</p>
                <div className={altStyle.alertContentSection}>
                    <p className={altStyle.alertContent}>
                        Group Name:{" "}
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p> {obj.groupname}</p>
                        ))}
                    </p>
                    <p className={altStyle.alertContent}>
                        buyAllowed:{" "}
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p>{obj.buyClientLimit}</p>
                        ))}
                    </p>
                    <p className={altStyle.alertContent}>
                        buyUsed:
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p>{obj.buyClientTotalUsed}</p>
                        ))}
                    </p>
                    <p className={altStyle.alertContent}>
                        sellAllowed:
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p>{obj.sellClientLimit}</p>
                        ))}
                    </p>
                    <p className={altStyle.alertContent}>
                        sellUsed:
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p>{obj.sellClientTotalUsed}</p>
                        ))}
                    </p>
                    <p className={altStyle.alertContent}>
                        clientLimit:
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p>{obj.clientLimit}</p>
                        ))}
                    </p>
                    <p className={altStyle.alertContent}>
                        clientCF:
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p>{obj.clientCF}</p>
                        ))}
                    </p>
                </div>
            </div>
            <div className={altStyle.alertSetting} style={{ fontSize: `${fontSize + 3}px` }} onClick={() => setIsTabelOpen(p => !p)} >
                <SlSettings />
            </div>

            <ModalPopup
                fullscreen={true}
                title={"Reversed Position Alert Settings"}
                flag={isTabelOpen}
                close={() => setIsTabelOpen(false)}
                component={
                    <ReversedTabel tabelData={tabelData} updateSetting={updateSetting} updateLimitInput={updateLimitInput} />
                }
            />
        </div>
    )
}

export default ReversedPosition