import React, { useEffect, useState } from 'react';
import { Avatar, Popover, Typography, Button } from '@mui/material';
import { Link } from "react-router-dom";

import { useCurrentUser, useCompanies } from '../services';
import { blue } from '@mui/material/colors';

import {LinkedIn} from '.';

export default function SOSAvatar(props:any){
    const { userState, getCurrentUser, logout } = useCurrentUser();
    const { companiesByUser, getCompany, listCompanies } = useCompanies();

    console.log(userState)
    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);
    const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

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

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const displayName = userState.currentUser.given_name+" "+userState.currentUser.family_name;
    if(userState && userState.currentUser && userState.currentUser.username){
        console.log(userState.currentUser);
        return (
            <div className="Avatar">
                <Button onClick={onClick}>
                    <Avatar
                        sx={{ bgcolor: blue[900] }}
                        alt={displayName}
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
                    className="avatar_popover"
                >
                    <h4>{displayName}</h4>
                    <h5>{companiesByUser.currentCompany?.name}</h5>
                    <Link to="/Companies">
                        Companies 
                    </Link>
                    <br />
                    <Button onClick={ logout } variant="contained"> Logout </Button>
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
