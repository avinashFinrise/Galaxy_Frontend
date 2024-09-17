import { useMemo } from "react";

export default (props) => {
  const data = useMemo(
    () => props.api.getDisplayedRowAtIndex(props.rowIndex).data,
    []
  );

  console.log(data);
  // {
  //     "id": 621,
  //     "createddate": "2023-09-07T01:30:00+05:30",
  //     "updateddate": "2023-09-07T01:30:00+05:30",
  //     "Date": "2023-09-27",
  //     "configName": "shareindia_optcom_cosclsi_mcx",
  //     "buyBrokRate": 0.0009,
  //     "sellBrokRate": 0.0009,
  //     "expiryBuyBrokRate": 0,
  //     "expirySellBrokRate": 0,
  //     "brokType": "CR",
  //     "isUsdLive": false,
  //     "usdRate": 1,
  //     "uSDCost": 0,
  //     "clientSharingRate": 50,
  //     "brokerSharingRate": 0,
  //     "comSharingRate": 50,
  //     "group": 69,
  //     "exchange": 5,
  //     "security_type": 6,
  //     "cluster": 12
  // }

  return (
    <div
      className="custom-tooltip"
      style={{ backgroundColor: "#ececec", padding: "0.5rem" }}
    >
      <p>
        <span>
          <strong>{data.group_config.configName}</strong>
        </span>
      </p>

      <p style={{ lineHeight: 0 }}>
        <span>Id: </span> {data.group_config.id}
      </p>
      <p style={{ lineHeight: 0 }}>
        <span>brokType: </span> {data.group_config.brokType}
      </p>
      <p style={{ lineHeight: 0 }}>
        <span>isUsdLive: </span> {data.group_config.isUsdLive}
      </p>
      <p style={{ lineHeight: 0 }}>
        <span>usdRate: </span> {data.group_config.usdRate}
      </p>
      <p style={{ lineHeight: 0 }}>
        <span>uSDCost: </span> {data.group_config.uSDCost}
      </p>
      <p style={{ lineHeight: 0 }}>
        <span>clientSharingRate: </span> {data.group_config.clientSharingRate}
      </p>
      <p style={{ lineHeight: 0 }}>
        <span>brokerSharingRate: </span> {data.group_config.brokerSharingRate}
      </p>
      <p style={{ lineHeight: 0 }}>
        <span>comSharingRate: </span> {data.group_config.comSharingRate}
      </p>
      <p>
        <span>group: </span> {data.group_config.group}
      </p>
      <p>
        <span>exchange: </span> {data.group_config.exchange}
      </p>
      <p>
        <span>security_type: </span> {data.group_config.security_type}
      </p>
      <p>
        <span>cluster: </span> {data.group_config.cluster}
      </p>
    </div>
  );
};
