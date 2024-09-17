import React, { memo } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from "@mui/material";
import successimg from "../../../assets/Gif/successful1.gif";
import style from "./Notification.module.scss";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});




function Success(props) {

  // const btnRef = useRef()

  // useEffect(() => {
  //   btnRef.current?.focus()
  // }, [btnRef, props])
  return (
    <Dialog
      // onOpen={props.data.successFlag && state && state.settings.issoundnotification && sound.play()}
      // onOpen={props.FormControldata.successFlag}
      open={props.data.successFlag}
      TransitionComponent={Transition}
      keepMounted
      onClose={props.Close}
      aria-describedby="alert-dialog-slide-description"
      className={`poup-notification ${style.poupNotification}`}
    >
      <DialogTitle className={style.notificationHeading}>
        {"SUCCESS"}
      </DialogTitle>
      <DialogContent>
        <div className="d-flex align-items-center ">
          <img
            className={style.notificationImg}
            src={successimg}
            alt="successimg"
          />
          <DialogContentText
            id="alert-dialog-slide-description"
            className={`popup-notification-message ${style.message}`}
          >
            {props.data.successMsg}
          </DialogContentText>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.Close} >Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(Success);
