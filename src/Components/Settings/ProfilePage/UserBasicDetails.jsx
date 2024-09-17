
import { useEffect, useState } from 'react'
import { GET_USERID_MASTER, GET_USER_SETTINGS_API } from '../../../API/ApiServices';
import profile from './ProfilePage.module.scss'

const UserBasicDetails = () => {
    const [userdetails, setuserdetails] = useState({
        createdate: new Date().toLocaleString(),
        fromdate: "",
        accessusers: "",
        lastlogin: "",
    })
    const [userIdmaster, setuserIdmaster] = useState([])

    // const formattedLastLogin = new Date(userdetails.lastlogin).toLocaleString();
    // const formattedCreateDate = new Date(userdetails.createdate).toLocaleString(undefined, {
    //     weekday: 'long',
    //     year: 'numeric',
    //     month: 'long',
    //     day: 'numeric',
    //     hour: 'numeric',
    //     minute: 'numeric',
    //     second: 'numeric',
    //     // timeZoneName: 'short',
    // });
    const formattedCreateDate = new Date(userdetails.createdate).toLocaleString();
    // console.log(formattedCreateDate, userdetails)

    useEffect(() => {
        (async () => {
            try {
                const apiData = await Promise.all([
                    GET_USER_SETTINGS_API(),
                    GET_USERID_MASTER()
                ]);
                // console.log("apiData", apiData)
                const [date, useridmaster,] = apiData
                if (date) {
                    setuserdetails((previous) => ({
                        ...previous,
                        createdate: date.data.result[0].createddate,
                        fromdate: date.data.result[0].date_range.fromdate,
                    }));
                }
                if (useridmaster) {
                    setuserIdmaster(useridmaster.data.result);
                }
                const userData = JSON.parse(localStorage.getItem("data"));
                const { accessusers, lastlogin } = userData;
                const formattedLastLogin = new Date(lastlogin).toLocaleString();
                setuserdetails((previous) => ({
                    ...previous,
                    accessusers,
                    lastlogin: formattedLastLogin,
                }));

            } catch (error) {
                console.log("error", error);
            }
        })();
    }, []);

    // console.log("userdetails", userdetails)
    const filteredArray = userIdmaster.filter(item => userdetails.accessusers.includes(item.id));
    // console.log({ filteredArray });

    // console.log("userdetails", userdetails)
    return (
        <div className={`basic-forminfo ${profile.basicInfo}`} >
            <div className={profile.cardDetailsSection}>
                <div className="row m-0">
                    <div className={`col user-detailsCard ${profile.userDetailsCard}`}>
                        <p>Total access id:</p>
                        {userdetails.accessusers.length}
                    </div>
                    <div className={`col user-detailsCard ${profile.userDetailsCard}`}>
                        <p>User Create Date:</p>
                        {formattedCreateDate}
                    </div>
                    <div className={`col user-detailsCard ${profile.userDetailsCard}`}>
                        <p>User Start Date:</p>
                        {userdetails.fromdate}
                    </div>
                    <div className={`col user-detailsCard ${profile.userDetailsCard}`}>
                        <p>User Last Login:</p>
                        {userdetails.lastlogin}
                    </div>
                </div>
                <div className={`${profile.allowUserID} ${profile.userDetailsCard}`}>
                    <p>Allow User ID:</p>
                    <ul >
                        {filteredArray.map((item) =>
                            <li key={item.id}>{item.userId}, </li>
                        )}
                    </ul>
                    {/* {filteredArray.map(item =>
                        <span>{item.userId}, </span>
                    )} */}
                    {/* {filteredArray.map(item => item.userId).join(', ')} */}

                </div>
            </div>
        </div >
    )
}

export default UserBasicDetails