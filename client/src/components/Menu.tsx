import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import Button from '@mui/material/Button';

import {Avatar, Alerts, SOSButton} from '.';
import { useCurrentUser } from '../services';

type User = {
  given_name: string
  family_name: string
  email: string
  picture: string
}

export default function Menu(){
  const { userState, getCurrentUser, setCurrentUser } = useCurrentUser();
  const token = localStorage.getItem('token');

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCodeFromWindowURL = (url:string) => {
      const popupWindowURL = new URL(url);
      const code = popupWindowURL.searchParams.get("code");
      return code;
  };

  const showPopup = () => {
      console.log('showing popup');
      const LinkedInApi = {
          clientId: process.env.REACT_APP_LINKEDIN_CLIENT_ID,
          redirectUrl: process.env.REACT_APP_LINKEDIN_OAUTH_REDIRECT,
          state: process.env.REACT_APP_LINKEDIN_STATE,
          oauthUrl: process.env.REACT_APP_LINKEDIN_OAUTH_URL,
          scope: process.env.REACT_APP_LINKEDIN_SCOPE
      }
      const { clientId, redirectUrl, oauthUrl, scope, state } = LinkedInApi;
      const windowUrl = `${oauthUrl}&client_id=${clientId}&scope=${scope}&state=${state}&redirect_uri=${redirectUrl}`;
      const width = 450,
        height = 730,
        left = window.screen.width / 2 - width / 2,
        top = window.screen.height / 2 - height / 2;
      window.open(
        windowUrl,
        'Linkedin',
        'menubar=no,location=no,resizable=no,scrollbars=no,status=no, width=' +
        width +
        ', height=' +
        height +
        ', top=' +
        top +
        ', left=' +
        left
      );
    };

  const getUserCredentials = async (code:string) => {
      console.log('getting credentials');
      const NodeServer = {
          baseURL:"https://jason.startupos.dev/", 
          getUserCredentials: "users/LinkedInCode"
      };
      console.log('getting credentials');
      const res = await axios.get(`${NodeServer.baseURL}${NodeServer.getUserCredentials}?code=${code}`);
      console.log(res);
      const user = res.data;
      console.log(user);
      setCurrentUser(user.email);
      localStorage.setItem('token', user.token);
    };

  const handlePostMessage = (event:any) => {
      if (event.data.type === 'code') {
          const { code } = event.data;
          console.log(code);
          getUserCredentials(code);
      }
  };
    const currentURL = new URL(window.location.href);
    console.log(currentURL);
    if (window.opener && window.opener !== window ) {
        console.log('different window');
        const code = getCodeFromWindowURL( window.location.href );
        window.opener.postMessage({'type': 'code', 'code': code}, '*')
        window.close();
    }
    // } else if(currentURL.pathname == '/linked_in_auth'){
    //   const code = getCodeFromWindowURL( window.location.href );
    //   if(code !== null){
    //     getUserCredentials(code);
    //   }
    // } 
    window.addEventListener('message', handlePostMessage);
  console.log(userState);
    return(
        <div>
            <Link to="/Dashboard">
              Dashboard 
            </Link> 
            <Link to="/Accounts">
              Accounts 
            </Link> 
            <Link to="/Reporting">
              Reporting 
            </Link> 
            <Button variant="contained" startIcon={<img src="./lifePreserver.png" height="20em" />} className="SOS_Button">
              SOS
            </Button>
            <Avatar showPopup={showPopup}/>
            <Alerts />
        </div>
    )
}
