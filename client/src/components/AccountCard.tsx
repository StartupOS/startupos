import React, { useEffect, useState } from 'react';
import startCase from 'lodash/startCase';
import toLower from 'lodash/toLower';
import Button from 'plaid-threads/Button';

import { AccountType } from './types';
import { useTransactions, useAccounts } from '../services';
import { currencyFilter } from '../util';
import { TransactionsTable } from '.';

interface Props {
  account: AccountType;
}

// TODO: update all components to look like this:
// const ClientMetrics: React.FC<Props> = (props: Props) => ()

// ClientMetrics.displayName = 'ClientMetrics';
// export default ClientMetrics;
export default function AccountCard(props: Props) {
  const [transactions, setTransactions] = useState([]);
  const [transactionsShown, setTransactionsShown] = useState(false);

  const { transactionsByAccount, getTransactionsByAccount } = useTransactions();

  const { id, primary_color } = props.account;
  const { deleteAccountById, unDeleteAccountById } = useAccounts();

  const toggleShowTransactions = () => {
    setTransactionsShown(shown => !shown);
  };

  useEffect(() => {
    getTransactionsByAccount(id);
  }, [getTransactionsByAccount, transactionsByAccount, id]);

  useEffect(() => {
    setTransactions(transactionsByAccount[id] || []);
  }, [transactionsByAccount, id]);
  function _arrayBufferToBase64( buffer:Buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return  binary;
}
  const bString = props && props.account.logo ? _arrayBufferToBase64(props.account.logo.data): "";
  return (
    <div>
      <div className="account-data-row" style={{border:'10px groove '+primary_color}}>
      {<img src={props.account.logo ? "data:image/png;base64, " + bString : "/lifePreserver.png"} className="AccountLogo" alt="Account Logo" />}
        <div className="account-data-row__left">
          <div className="account-data-row__name">{props.account.name}</div>
          <div className="account-data-row__balance">{`${startCase(
            toLower(props.account.subtype)
          )} • Balance ${currencyFilter(props.account.current_balance)}`}</div>
        </div>
        <div className="account-data-row__right">
          {transactions.length !== 0 && (
            <Button onClick={toggleShowTransactions} centered small inline>
              {transactionsShown ? 'Hide Transactions' : 'View Transactions'}
            </Button>
          )}
          <Button centered small inline onClick={()=>{deleteAccountById(id)}}> Remove Account </Button>
          { props.account.deleted && (
            <Button centered small inline onClick={()=>{unDeleteAccountById(id)}}> Restore Account </Button>
          )}
        </div>
      </div>
      {transactionsShown && <TransactionsTable transactions={transactions} />}
    </div>
  );
}
