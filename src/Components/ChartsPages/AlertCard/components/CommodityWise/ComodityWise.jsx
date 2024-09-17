import { useEffect, useState } from 'react';
import { SlSettings } from "react-icons/sl";
import { ModalPopup } from '../../../../DynamicComp';
import altStyle from "../../AlertCard.module.scss";
import ComodityTable from './ComodityTable';



function ComodityWise({ fontSize, blink, limitReached, tabelData, updateSetting, updateLimitInput }) {
    const [isExpanded, setIsLimitExpanded] = useState(false);
    const [limitReachedTableDataFlaged, setLimitReachedTableDataFlaged] = useState([]);
    const [isTabelOpen, setIsTabelOpen] = useState();
    useEffect(() => {
        if (!limitReached) return
        const res = {}
        Object.values(limitReached).map(netPosition => {
            const key = `${netPosition.symbol} | ${netPosition.groupname} | ${netPosition.userid}`
            if (!res[key]) res[key] = { title: key, limit: netPosition["commodity"].clientlimit || 0, used: netPosition.netmtm }
            else {
                res[key].used += netPosition.netmtm || 0
                res[key].limit += netPosition["commodity"].clientlimit || 0
            }
        })
        setLimitReachedTableDataFlaged(Object.values(res))

    }, [limitReached])


    return (<>
        <div className={`col-md-12  ${altStyle.alertSection}`}>
            <div
                className={`${altStyle.alertCard}  ${isExpanded ? altStyle.alertCardSizeInc : ""
                    } ${blink ? altStyle.limitReach : null}`}
                style={{ background: "#00B3C0", fontSize: `${fontSize}px` }}
                onClick={() => setIsLimitExpanded(p => !p)}
            >
                <p className={altStyle.alertTitle} style={{ fontSize: `${fontSize}px` }}>Commodity wise MTM</p>
                <div className={altStyle.alertContentSection}>
                    <p className={altStyle.alertContent}>
                        Group Name:{" "}
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p key={obj.title} > {obj.title}</p>
                        ))}
                    </p>
                    <p className={altStyle.alertContent}>
                        Allowed:{" "}
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p>{obj.limit}</p>
                        ))}
                    </p>
                    <p className={altStyle.alertContent}>
                        Used:
                        {limitReachedTableDataFlaged?.map((obj) => (
                            <p>{obj.used}</p>
                        ))}
                    </p>
                </div>
            </div>
            <div className={altStyle.alertSetting} style={{ fontSize: `${fontSize + 3}px` }} onClick={() => setIsTabelOpen(p => !p)}>
                <SlSettings />
            </div>
        </div>
        <ModalPopup
            fullscreen={true}
            title={"Comodity wise Alert Settings"}
            flag={isTabelOpen}
            close={() => setIsTabelOpen(false)}
            component={
                <ComodityTable tabelData={tabelData} updateSetting={updateSetting} updateLimitInput={updateLimitInput} />

            }
        />
    </>
    )
}

export default ComodityWise