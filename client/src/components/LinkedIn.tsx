import React, { useState } from 'react';
import axios from 'axios';
import linkedInLoginImage from './Sign-In-Small---Default.png';
import { useCurrentUser } from '../services';

type User = {
    given_name: string
    family_name: string
    email: string
    picture: string
}

console.log(process.env);

export default function LinkedIn(){
  const { setCurrentUser } = useCurrentUser();
  const [loggedIn, setLoggedIn]= useState(false);
  const [user, setUser] = useState<User|null>(null);

  const getCodeFromWindowURL = (url:string) => {
      const popupWindowURL = new URL(url);
      return popupWindowURL.searchParams.get("code");
  };

  const showPopup = () => {
      const LinkedInApi = {
          clientId: process.env.REACT_APP_LINKEDIN_CLIENT_ID,
          redirectUrl: process.env.REACT_APP_LINKEDIN_OAUTH_REDIRECT,
          state: process.env.REACT_APP_LINKEDIN_STATE,
          oauthUrl: process.env.REACT_APP_LINKEDIN_OAUTH_URL,
          scope: process.env.REACT_APP_LINKEDIN_SCOPE
      }
      console.log("LinkedInApi:");
      console.log(LinkedInApi);
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
      const NodeServer = {
          baseURL:"https://jason.startupos.dev/", 
          getUserCredentials: "users/LinkedInCode"
      };
      const res = await axios.get(`${NodeServer.baseURL}${NodeServer.getUserCredentials}?code=${code}`);
      console.log(res);
      const user = res.data;
      console.log(user);
      setUser(user);
      setLoggedIn(true);
      setCurrentUser(user);
      localStorage.setItem('token', user.token);
    };

  const handlePostMessage = (event:any) => {
      if (event.data.type === 'code') {
          const { code } = event.data;
          getUserCredentials(code);
      }
  };
    
    if (window.opener && window.opener !== window) {
        const code = getCodeFromWindowURL(window.location.href);
        window.opener.postMessage({'type': 'code', 'code': code}, '*')
        window.close();
    }
    window.addEventListener('message', handlePostMessage);
    const content = loggedIn && user?(
        <>
          <img src={user.picture} alt="Profile" />
          <h3>{`${user.given_name} ${user.family_name}`}</h3>
          <h3>{user.email}</h3>
        </>
      ):(
        <>
        {/* <h2>Sign in with LinkedIn</h2> */}
        <img src={linkedInLoginImage} alt="Sign in with LinkedIn"onClick={showPopup} style={{cursor:"pointer"}}/>
        </>
    );

    return(<div>{content}</div>);
}
