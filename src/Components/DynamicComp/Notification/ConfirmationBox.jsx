import React, { memo, useEffect, useRef } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
} from "@mui/material";
import Errorimg from "../../../assets/Gif/confirmation.gif"
import style from "./Notification.module.scss";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Error(props, { deletesession }) {
  const btnRef = useRef()


  useEffect(() => {
    if (!btnRef.current) return
    btnRef.current.focus()
  }, [btnRef, props])
  return (
    <Dialog
      onOpen={props.data.errorFlag}
      open={props.data.confirmFlag}
      TransitionComponent={Transition}
      keepMounted
      onClose={props.Close}
      aria-describedby="alert-dialog-slide-description"
      className={`poup-notification ${style.poupNotification}`}
    >
      <DialogTitle className={style.notificationHeading}>{"CONFIRM"}</DialogTitle>
      <DialogContent>
        <div className="d-flex align-items-center ">
          <img
            className={style.notificationImg}
            src={Errorimg}
            alt="Errorimg"
          />
          <DialogContentText
            id="alert-dialog-slide-description"
            className={`popup-notification-message ${style.message}`}
          >
            {props.data.confirmMsg}
          </DialogContentText>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={props.data.confirmAction}>YES</Button>
        <Button onClick={props.close}>NO</Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(Error);
