import React, { useEffect } from 'react';
import Badge from '@mui/material/Badge';
import { Popover, Typography, Button } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

import { useCurrentUser } from '../services';


export default function Alerts() {
  const { userState, getCurrentUser } = useCurrentUser();
  console.log(userState)
  useEffect(() => {
      getCurrentUser();
  }, [getCurrentUser]);
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
  return (
    <div className="Notifications">
      
      <Badge badgeContent={4} color="primary">
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
    >
        <Typography variant="h2">Message 1</Typography>
    </Popover>
    </div>
  );
}