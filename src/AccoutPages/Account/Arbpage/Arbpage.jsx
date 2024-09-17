import { Tab, Tabs, Typography } from '@mui/material'
import React, { useState } from 'react'
import style from './Arbpage.module.scss'
import ArbTable from './ArbTable/ArbTable'
import { Select } from 'antd'

const tabItem = [
    {
        label: "Net", key: "net", api: "getnetdata", toTotal:
        {
            ARB: 0,
            Clustername: "Total",
            INRMTM: 0,
            NetMTM_USD: 0,
            // RBI_Closing: 0,
            USDtoINRMTM: 0,
            // Usdcost: 0,
        }
    },
    {
        label: "Client", key: "client", api: "getcldata", toTotal:
        {
            Clustername: "Total",
            NetMTM_USD: 0,
            Net_aftersharing_USD: 0,
            USDtoINRMTM: 0,
            INRMTM: 0,
            Net_aftersharing_INR: 0,
            "NET_P/L_INR": 0,
            "NET_P/L_USD": 0
        }
    },
    {
        label: "Group", key: "group", api: "getgrpdata", toTotal:
        {

            Clustername: "Total",
            NetMTM_USD: 0,
            Net_aftersharing_USD: 0,
            USDtoINRMTM: 0,
            INRMTM: 0,
            Net_aftersharing_INR: 0,
            "NETPNL_(INR)": 0,
            "NETPNL_(USD)": 0,
            AED_LD: 0,
            INR_LD: 0,
            INR_BALANCE: 0,
            AED_BALANCE: 0
        }
    },
]

const Arbpage = () => {
    const [activeTab, setActiveTab] = useState(tabItem[0]);
    const [activeIndex, setactiveIndex] = useState(0);

    const handleChange = (event, activeIndex) => {
        setactiveIndex(activeIndex);
    };
    return (
        <div className={`container-fluid arb-table-comp ${style.arbSection}`}>
            <Tabs
                orientation="horizontal"
                value={activeIndex}
                onChange={handleChange}
                className="tab-select-content"
            >
                {tabItem.map((item) => {
                    return <Tab
                        label={item.label}
                        onClick={() => setActiveTab(item)}
                        className={`setting-single-tabs ${style.arbSingleTab}`}
                    />
                })}
            </Tabs>
            <div className={`services-tab ${style.servicesContainerTab}`}>
                <TabContainer>
                    <ArbTable data={activeTab} />
                </TabContainer>
            </div>
        </div>
    )
}

function TabContainer(props) {
    return <Typography component="div">{props.children}</Typography>;
}


export default Arbpage