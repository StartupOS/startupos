import React from 'react';
import Button from 'plaid-threads/Button';

const PLAID_ENV = process.env.REACT_APP_PLAID_ENV;

interface Props {
  initialSubheading?: boolean;
}

const Banner = (props: Props) => {
  const initialText =
    'Welcome to StartupOS. Please login.';

  const successText =
    "This page shows your startup's net worth, spending by category, and allows you to explore account and transactions details for linked items.";

  const subheadingText = props.initialSubheading ? initialText : successText;

  return (
    <div id="banner" className="bottom-border-content">
      <h4><img src="/lifePreserver.png" alt="Logo" height="50px"/> {PLAID_ENV} user</h4>
      <div className="header">
        <h1 className="everpresent-content__heading">Plaid Pattern</h1>
        <Button
          href="https://docs.google.com/forms/d/e/1FAIpQLSfF4Xev5w9RPGr7fNkSHjmtE_dj0ELuHRbDexQ7Tg2xoo6tQg/viewform"
          target="_blank"
          rel="noopener noreferrer"
          inline
          centered
          secondary
        >
          Send Feedback
        </Button>
      </div>
      <p id="intro" className="everpresent-content__subheading">
        {subheadingText}
      </p>
    </div>
  );
};

export default Banner;
