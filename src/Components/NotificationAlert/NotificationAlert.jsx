import { useEffect, useState } from 'react'
import { GET_NOTIFICATION_API } from '../../API/ApiServices';
import alrtNotify from './NotificationAlert.module.scss'
import { useDispatch } from 'react-redux';
import { Notificationalert } from '../../Redux/RMSAction';
import { FixedSizeList as List } from "react-window";




const NotificationAlert = () => {
    // console.log('notify');
    const dispatch = useDispatch();
    const [notificationData, setNotificationData] = useState([])

    useEffect(() => {
        (() => {
            const getNotice = new Promise((resolve, reject) => {
                resolve(GET_NOTIFICATION_API())
            })
            getNotice
                .then((res) => {
                    let notification = res?.data?.result?.reverse()
                    // if (notification.length > 100) notification = notification.splice(0, 100)

                    setNotificationData(notification)
                    dispatch(Notificationalert(notification))
                })
                .catch((error) => {
                    console.log(error);
                });
        })();
    }, [])
    // console.log("notificationData", notificationData);




    const Row = ({ index, style }) => {
        const val = notificationData[index]
        return (
            <div key={val.id} className={`notificationAlert-card ${alrtNotify.notifyAlertSection} `} style={style}>
                <div className={alrtNotify.notifyAlertHeader}>
                    <p className={alrtNotify.alertContent}
                        style={{
                            color: val.type === "danger" ? "#c52323" : val.type === "info" ? "blue" : val.type === "warning" ? "yellow" : "black",
                            fontWeight: "600",
                            textTransform: "uppercase"
                        }}>{val.name}</p>
                    <p>{val.date}</p>
                </div>
                <div className={alrtNotify.notifyDescription}>
                    <p>{val.description}</p>
                </div>
            </div>
        );
    }


    return (
        <div>
            {notificationData.length ?
                <List
                    className={`List ${alrtNotify.notifyList}`}
                    height={500}
                    itemCount={notificationData?.length || 0}
                    itemSize={80}
                    width={'100%'}
                >
                    {Row}
                </List>
                : <h2 className={alrtNotify.noDataNotify}>No Notification</h2>}
        </div>
    )
}

export default NotificationAlert