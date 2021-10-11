import React, { useEffect } from 'react';
import Button from 'plaid-threads/Button';
import { useHistory } from 'react-router-dom';

import { useCurrentUser } from '../services';
import { Login, Banner, AddUserForm } from '.';

export default function Menu(){
    const { userState, setCurrentUser } = useCurrentUser();
    return(
        <div>
            <span className="userName">{(userState && userState.currentUser) ? userState.currentUser.username : "Guest"}</span>
        </div>
    )
}