import React, { memo } from 'react'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import style from './DynamicCom.module.scss';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function TelegramPopup(props) {
    return (
        <Dialog
            open={props.flag}
            TransitionComponent={Transition}
            keepMounted
            onClose={props.Close}
            aria-describedby="alert-dialog-slide-description"
            className={`telegram-popup ${style.telegramPopup}`}
            maxWidth='xl'
        >
            <DialogContent className=''>
                {props.component}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.Close}>Close</Button>
            </DialogActions>
        </Dialog>
    )
}

export default memo(TelegramPopup)