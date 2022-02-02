import React from 'react';

// const PLAID_ENV = process.env.REACT_APP_PLAID_ENV;

interface Props {
  initialSubheading?: boolean;
  header?:string;
  help?:boolean;
}

const Banner = (props: Props) => {
  const initialText =
    'Welcome to StartupOS. Please login.';

  const successText =
    "This page shows your startup's net worth, spending by category, and allows you to explore account and transactions details for linked items.";

  const subheadingText = props.initialSubheading ? initialText : successText;

  const headerText = props.header || "StartupOS"
  const toolTip=!!props.help;

  return (
    <div id="banner" className={toolTip?"bottom-border-content":""}>
      <div className="header" title={toolTip?subheadingText:""}>
        <h1 className="everpresent-content__heading">{headerText}</h1>
      </div>
      {!toolTip &&
      (<p id="intro" className="everpresent-content__subheading">
        {subheadingText}
      </p>)}
    </div>
  );
};

export default Banner;
