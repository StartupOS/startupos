import React, { useMemo } from 'react';

import { currencyFilter, pluralize } from '../util';
import { CategoriesChart } from '.';
import { TransactionType } from './types';

interface Props {
  transactions: TransactionType[];
  numOfItems: number;
}

interface Categories {
  [key: string]: number;
}

export default function SpendingInsights(props: Props) {
  // grab transactions from most recent month and filter out transfers and payments
  const transactions = props.transactions;
  const monthlyTransactions = useMemo(
    () =>
      transactions.filter(tx => {
        const date = new Date(tx.date);
        const today = new Date();
        const oneYearAgo = new Date(new Date().setDate(today.getDate() - 365));
        return (
          date > oneYearAgo &&
          tx.category !== 'Payment' &&
          tx.category !== 'Transfer' &&
          tx.category !== 'Interest'
        );
      }),
    [transactions]
  );

  // create category and name objects from transactions

  const categoriesObject = useMemo((): Categories => {
    return monthlyTransactions.reduce((obj: Categories, tx) => {
      tx.category in obj
        ? (obj[tx.category] = tx.amount + obj[tx.category])
        : (obj[tx.category] = tx.amount);
      return obj;
    }, {});
  }, [monthlyTransactions]);

  const namesObject = useMemo((): Categories => {
    return monthlyTransactions.reduce((obj: Categories, tx) => {
      console.log(tx.merchant)
      tx.merchant in obj
        ? (obj[tx.merchant] = tx.amount + obj[tx.merchant])
        : (obj[tx.merchant] = tx.amount);
      return obj;
    }, {});
  }, [monthlyTransactions]);

  // sort names by spending totals
  const sortedNames = useMemo(() => {
    const namesArray = [];
    for (const name in namesObject) {
      namesArray.push([name, namesObject[name]]);
    }
    namesArray.sort((a: any[], b: any[]) => b[1] - a[1]);
    namesArray.splice(5); // top 5
    return namesArray;
  }, [namesObject]);

  return (
    <div>
      <h2 className="monthlySpendingHeading">Monthly Spending</h2>
      <h4 className="tableSubHeading">A breakdown of your monthly spending</h4>
      <div className="monthlySpendingText">{`Monthly breakdown across ${
        props.numOfItems
      } bank ${pluralize('account', props.numOfItems)}`}</div>
      <div className="monthlySpendingContainer">
        <div className="userDataBox">
          <CategoriesChart categories={categoriesObject} />
        </div>
        <div className="userDataBox">
          <div className="holdingsList">
            <h4 className="holdingsHeading">Top 5 Vendors</h4>
            <table className="spendingInsightData">
              <tr>
                <th className="title">Vendor</th>
                <th className="title">Amount</th>
              </tr>
              {sortedNames.map((vendor: any[],c) => (
                <tr key={c}>
                  <td>{vendor[0]}</td>
                  <td>{currencyFilter(vendor[1])}</td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
