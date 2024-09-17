import React, { memo } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Slide,
} from "@mui/material";
import style from "./Notification.module.scss";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function PopUp(props) {
  return (
    <Dialog
      open={props.flag}
      TransitionComponent={Transition}
      keepMounted
      onClose={props.Close}
      aria-describedby="alert-dialog-slide-description"
      className={`poup-notification ${style.poupNotification}`}
      maxWidth="xl"
    >
      <DialogContent>{props.component}</DialogContent>
      <DialogActions>
        <Button onClick={props.Close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default memo(PopUp);
