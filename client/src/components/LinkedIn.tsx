import { useState, useEffect } from 'react';
import linkedInLoginImage from './Sign-In-Small---Default.png';
import { useCurrentUser } from '../services';

type User = {
    given_name: string
    family_name: string
    username: string | null
    picture: string
}
type Props = {
  redirectUrlProp?:string;
}
console.log(process.env);

export default function LinkedIn(props:Props){
  const { userState, getCurrentUser } = useCurrentUser();
  const [loggedIn, setLoggedIn]= useState(!!(userState.currentUser && userState.currentUser.username));
  const [user, setUser] = useState<User|null>(userState.currentUser);
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);
  useEffect(() => {
    setUser(userState.currentUser);
    setLoggedIn(!!(userState.currentUser && userState.currentUser.username));
  }, [userState]);
  console.log(userState)

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
  console.log(props.redirectUrlProp);
  if(redirectUrl)
    encodedURI = encodeURIComponent(props.redirectUrlProp || redirectUrl);
  console.log(encodedURI);
  const windowUrl = `${oauthUrl}&client_id=${clientId}&scope=${scope}&redirect_uri=${encodedURI}&state=${state}`;
  
    console.log(user);
    const content = loggedIn && user?(
        <>
          {user.picture && <img src={user.picture} alt="Profile" className="main-profile"/>}
          <h3>{`${user.given_name} ${user.family_name}`}</h3>
          <h3>{user.username}</h3>
        </>
      ):(
        <a href={ windowUrl}>
          <img src={linkedInLoginImage} alt="Sign in with LinkedIn"/>
        </a>
    );

    return(<div>{content}</div>);
}