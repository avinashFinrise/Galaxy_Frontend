import { useMemo } from "react";

export default (props) => {
  const data = useMemo(() => props.api.getDisplayedRowAtIndex(props.rowIndex).data,[]);

  console.log(data);

  return (
    <div
      className="custom-tooltip"
      style={{ backgroundColor: "#ececec", padding: "0.5rem",width:'10vw' }}
    >
      <p>
        <span>{data.userid }</span>
      </p>
      <p>
        <span>Id: </span> {data.userid_id}
      </p>
    </div>
  );
};
