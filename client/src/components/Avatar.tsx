import React, { useEffect } from 'react';
import { Avatar, Popover, Typography, AvatarProps } from '@mui/material';
import { useCurrentUser } from '../services';
import { blue } from '@mui/material/colors';

import {LinkedIn} from '.';

export default function SOSAvatar(props:any){
    const {showPopup } = props;
    const { userState } = useCurrentUser();
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

    const handleClick = (event:Event) => {
        if (event.target instanceof Element)
            setAnchorEl(event.target);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const Avatar2 = Avatar as any;
    if(userState.currentUser && userState.currentUser.id){
        return (
            <div className="Avatar">
            <Avatar2
                sx={{ bgcolor: blue[900] }}
                alt={userState.currentUser.given_name + " " + userState.currentUser.family_name}
                src={userState.currentUser.picture}
                onClick={handleClick}
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
            <div className="Avatar">
            <Avatar2
                onClick={handleClick}
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
                <LinkedIn onClick={showPopup}/>
            </Popover>
            </div>
        )
    }
    
}