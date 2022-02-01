import React, { useCallback, useState, useEffect } from 'react';
import Button from 'plaid-threads/Button';
import { useMergeLink } from "@mergeapi/react-merge-link";

import { useMergeLink as useMergeLinkService } from '../services';


// Need to write getMergeLinkToken and exchangePublicMergeToken in services/api

interface Props {
  companyId: number;
  mergeLinkToken: string;
  children?: React.ReactNode;
}

export default function MergeLinkButton(props: Props) {
  const { exchangePublicToken } = useMergeLinkService();

  const onSuccess = useCallback((public_token)=>{
    // Send resulting public token to server
    exchangePublicToken(props.companyId, public_token)
  },[])
  const { open } = useMergeLink({
    linkToken: props.mergeLinkToken, 
    onSuccess,
  });
  
  const handleClick = () => {
    // Invoke Open
    console.log("mergeLinkToken:", props.mergeLinkToken);
    open()
  };
  console.log("mergeLinkToken");
  console.log(props.mergeLinkToken)

  return (
      <>
      { props.mergeLinkToken && props.mergeLinkToken.length &&
        (<Button
          centered
          inline
          small
          onClick={() => {
            handleClick();
          }}
      >
          {props.children}
      </Button>)}
    </>
  );
}
