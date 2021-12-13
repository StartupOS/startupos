import React from 'react';
import { Avatar, Popover, Typography, Button } from '@mui/material';
import { useCurrentUser } from '../services';
import { blue } from '@mui/material/colors';

import {LinkedIn} from '.';

export default function SOSAvatar(){
    const { userState } = useCurrentUser();
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

    // const handleClick = (event:any) => {
    //     setAnchorEl(event.currentTarget);
    // };

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

    // const avatar = (
    //         <Avatar
    //             sx={{ bgcolor: blue[900] }}
    //             alt={userState.currentUser.given_name + " " + userState.currentUser.family_name}
    //             src={userState.currentUser.picture}
    //             />);
    // avatar.onclick=onClick;

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    if(userState.currentUser.email){
        return (
            <div>
                <Button onClick={onClick}>
                    <Avatar
                        sx={{ bgcolor: blue[900] }}
                        alt={userState.currentUser.given_name + " " + userState.currentUser.family_name}
                        src={userState.currentUser.picture}
                    />
                </Button>
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
                <Button onClick={onClick}>
                    <Avatar
                        sx={{ bgcolor: blue[900] }}
                    />
                </Button>
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