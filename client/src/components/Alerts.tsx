import React, { useEffect } from 'react';
import Badge from '@mui/material/Badge';
import { Popover, Typography, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

import AlertMessage from './AlertMessage'
import { useCurrentUser, useMessages } from '../services';


export default function Alerts() {
  const { userState, getCurrentUser } = useCurrentUser();
  const { messageState, getMessages } = useMessages()
  console.log(userState)
  useEffect(() => {
      getCurrentUser();
  }, [getCurrentUser]);
  useEffect(()=>{
      getMessages();
      console.log(messageState);
  },[getMessages])
  console.log('MESSAGES');
  console.log(messageState.messages);
  console.log('React is the devil');
  const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
      setAnchorEl(null);
  };

  const onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if(!open && event.target instanceof Element)
          setAnchorEl(event.target);
      else {
          handleClose();
      }
  }
  const id = open ? 'message-popover' : undefined;
  const icon = (<NotificationsIcon color="action" fontSize="inherit" />)
  const messages = messageState.messages.map(
      (m, i) =>
      (<AlertMessage message={m} key={i}/>)
    );
  return (
    <div className="Notifications">
      
      <Badge badgeContent={messageState.messages.length} color="primary">
        <Button onClick={onClick} size="large" endIcon={icon} />
      </Badge>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
        }}
        className='MessageContainer'
    >
        {messages}
    </Popover>
    </div>
  );
}