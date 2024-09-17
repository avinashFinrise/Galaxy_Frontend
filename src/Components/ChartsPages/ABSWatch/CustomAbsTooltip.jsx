import { useMemo } from "react";

const CustomAbsTooltip = (props) => {
  const data = useMemo(
    () => props.api.getDisplayedRowAtIndex(props.rowIndex).data,
    []
  );


  return (
    <div
      className="custom-tooltip"
      style={{ backgroundColor: props.color || "white", padding: "1rem" }}
    >
      <p>
        <span>
          <b>Strategyname:</b>{" "}
        </span>{" "}
        {data.strategyname}
      </p>
      <p>
        <span>
          <b>Token1:</b>{" "}
        </span>{" "}
        {data.params.tokens[0].ticker_code} {data.params.tokens[0].exchange} {data.params.tokens[0].token}
      </p>
      <p>
        <span>
          <b>Token2:</b>{" "}
        </span>{" "}
        {data.params.tokens[1].ticker_code} {data.params.tokens[1].exchange} {data.params.tokens[1].token}
      </p>
      {data?.params?.tokens[2]?.ticker_code && (
        <p>
          <span>
            <b>Token3:</b>{" "}
          </span>{" "}
          {data.params.tokens[2].ticker_code} {data.params.tokens[2].exchange} {data.params.tokens[2].token}
        </p>
      )}
      <p>
        <span>
          <b>Segment:</b>{" "}
        </span>{" "}
        {data.strategysegment}
      </p>
      <p>
        <span>
          <b>Bankcharges:</b>{" "}
        </span>{" "}
        {data.params.bankcharges}
      </p>
      <p>
        <span>
          <b>Convert Qty:</b>{" "}
        </span>{" "}
        {data.params.converterqty}
      </p>
    </div>
  );
};

export default CustomAbsTooltip;
