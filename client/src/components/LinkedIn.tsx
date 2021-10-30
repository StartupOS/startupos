import linkedInLoginImage from './Sign-In-Small---Default.png';

export default function LinkedIn(props:any){
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
    console.log(redirectUrl);
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


    return(
      <div>
        <img 
          src={linkedInLoginImage} 
          alt="Sign in with LinkedIn"
          onClick={showPopup}
          style={{cursor:"pointer"}}/>
      </div>);
}
