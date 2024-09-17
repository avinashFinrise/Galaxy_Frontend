import { memo } from 'react'
import QRCode from "react-qr-code";
import profile from './ProfilePage.module.scss'

const ProfileQRCode = () => {
    return (
        <div className={`basic-forminfo ${profile.basicInfo}`} >
            <div className={profile.basicInfoSetting}>
                <div className={profile.qrSection}>
                    <QRCode value="Comming Soon" />
                    <h6 className={profile.qrHeading}>Share Your Portfolio</h6>
                </div>
            </div>
        </div>
    )
}

export default memo(ProfileQRCode)