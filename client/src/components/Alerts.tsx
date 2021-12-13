// import * as React from 'react';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function Alerts() {
  return (
    <div className="Notifications">
      <Badge badgeContent={4} color="primary">
        <NotificationsIcon color="action" fontSize="inherit"/>
      </Badge>
    </div>
  );
}