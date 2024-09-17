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
import Errorimg from "../../../assets/Gif/error1.gif";
import style from "./Notification.module.scss";
import useApi from "../../CustomHook/useApi";
import { DELETE_SESSION_API } from "../../../API/ApiServices";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function Error(props) {
  const { data, error, loading, makeApiCall } = useApi();

  // console.log(
  //   props.data.activesession ? "Delete Session" : null,
  //   props.data.activesession
  // );
  useEffect(() => {
    if (data?.httpstatus === 200) {
      props.Close();
    }
  }, [data]);

  const deleteSession = () => {
    makeApiCall(DELETE_SESSION_API, {
      ...props.loginData,
      event: "deletesession",
    });
  };

  const activSessionRef = useRef()
  const btnRef = useRef()


  useEffect(() => {
    props.data.activesession ? activSessionRef.current?.focus() : btnRef.current?.focus()
  }, [activSessionRef, props])


  // console.log(props.data ? props.data.headerMsg : "ERROR");
  return (
    <Dialog
      // onOpen={props.data.errorFlag}
      open={props.data.errorFlag}
      TransitionComponent={Transition}
      keepMounted
      onClose={props.Close}
      aria-describedby="alert-dialog-slide-description"
      className={`poup-notification ${style.poupNotification}`}
    >
      <DialogTitle className={style.notificationHeading}>
        ERROR {props.data.headerMsg}
      </DialogTitle>
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
            {props.data.errorMsg}
          </DialogContentText>
        </div>
      </DialogContent>
      <DialogActions>
        {props.data.activesession ? (
          <Button onClick={deleteSession} ref={activSessionRef} >Delete Session</Button>
        ) : (
          <Button onClick={props.Close} ref={btnRef} >Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default memo(Error);
