import { useState } from 'react';
import linkedInLoginImage from './Sign-In-Small---Default.png';
import { useCurrentUser } from '../services';

type User = {
    given_name: string
    family_name: string
    email: string | null
    picture: string
}

console.log(process.env);

export default function LinkedIn(){
  const { userState } = useCurrentUser();
  const [loggedIn]= useState(!!(userState.currentUser && userState.currentUser.email));
  const [user] = useState<User|null>(userState.currentUser);

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
  let encodedURI = "";
  if(redirectUrl)
    encodedURI = encodeURIComponent(redirectUrl);
  const windowUrl = `${oauthUrl}&client_id=${clientId}&scope=${scope}&redirect_uri=${encodedURI}&state=${state}`;
  
    console.log(user);
    const content = loggedIn && user?(
        <>
          <img src={user.picture} alt="Profile" />
          <h3>{`${user.given_name} ${user.family_name}`}</h3>
          <h3>{user.email}</h3>
        </>
      ):(
        <a href={ windowUrl}>
          <img src={linkedInLoginImage} alt="Sign in with LinkedIn"/>
        </a>
    );

    return(<div>{content}</div>);
}