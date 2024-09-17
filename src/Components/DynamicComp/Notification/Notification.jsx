import { memo } from "react";
import ConfirmationBox from "./ConfirmationBox";
import Error from "./Error";
import Loading from "./Loading";
import Success from "./Success";

function Notification(props) {
  // console.log(props)
  return (
    <div>
      <ConfirmationBox data={props.notify} close={props.CloseConfirm} />
      <Error
        data={props.notify}
        Close={props.CloseError}
        loginData={props.loginData}
      />
      <Success data={props.notify} Close={props.CloseSuccess} />
      <Loading data={props.notify} />
    </div>
  );
}

export default memo(Notification);
