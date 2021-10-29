import React, { useEffect } from 'react';
import { Avatar, Popover, Typography } from '@mui/material';
import { useCurrentUser } from '../services';
import { blue } from '@mui/material/colors';

import {LinkedIn} from '.';

export default function SOSAvatar(){
    const { userState } = useCurrentUser();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    if(userState.currentUser){
        return (
            <div>
            <Avatar
                sx={{ bgcolor: blue[900] }}
                alt={userState.currentUser.given_name + " " + userState.currentUser.family_name}
                src={userState.currentUser.picture}
            />
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
                <Typography sx={{ p: 2 }}> Profile Information and link to edit</Typography>
            </Popover>
            </div>
        )
    } else {
        return (
            <div>
            <Avatar
                sx={{ bgcolor: blue[900] }}
            />
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
                <LinkedIn />
            </Popover>
            </div>
        )
    }
    
}