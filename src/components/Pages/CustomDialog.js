import React, { useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';

const CustomDialog = ({ open, onClose, title, message }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Slide}
      transitionDuration={300}
      PaperProps={{
        style: {
          position: 'absolute',
          top: 0,
          right: 0,
          margin: 20,
          
        },
      }}
    >
      <DialogTitle sx={{color:"red"}}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
