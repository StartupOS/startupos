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
      <div className="header">
        <h1 className="everpresent-content__heading">StartupOS</h1>
      </div>
      <p id="intro" className="everpresent-content__subheading">
        {subheadingText}
      </p>
    </div>
  );
};

export default Banner;
