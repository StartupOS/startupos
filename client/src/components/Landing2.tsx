import React, { useEffect } from 'react';
import Button from 'plaid-threads/Button';
import { useHistory } from 'react-router-dom';

import { useCurrentUser } from '../services';
import { Banner } from '.';

export default function Landing() {
  const { userState, setCurrentUser } = useCurrentUser();
  const history = useHistory();

  useEffect(() => {
    if (userState.newUser != null) {
      setCurrentUser(userState.newUser);
    }
  }, [setCurrentUser, userState.newUser]);

  const returnToCurrentUser = () => {
    history.push(`/user/${userState.currentUser.id}`);
  };
  return (
    <div>
      <Banner initialSubheading />
      <div className="subText">Please login under the profile icon above. If you don't have an account, one will be created the first time you sign in. Once created,
      you can add as many example Link items as you like.</div>
      <div className="btnsContainer">
        {userState.currentUser.username != null && (
          <Button
            className="btnWithMargin"
            centered
            inline
            onClick={returnToCurrentUser}
          >
            Return to Current User
          </Button>
        )}
      </div>
    </div>
  );
}
