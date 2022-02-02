import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  useReducer,
  useCallback,
  Dispatch,
} from 'react';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import omitBy from 'lodash/omitBy';

import { TransactionType } from '../components/types';

import {
  getTransactionsByAccount as apiGetTransactionsByAccount,
  getTransactionsByItem as apiGetTransactionsByItem,
  getTransactionsByCompany as apiGetTransactionsByCompany,
} from './api';
import { Dictionary } from 'lodash';

interface TransactionsState {
  [transactionId: number]: TransactionType;
}

const initialState = {};
type TransactionsAction =
  | {
      type: 'SUCCESSFUL_GET';
      payload: TransactionType[];
    }
  | { type: 'DELETE_BY_ITEM'; payload: number }
  | { type: 'DELETE_BY_COMPANY'; payload: number };

interface TransactionsContextShape extends TransactionsState {
  dispatch: Dispatch<TransactionsAction>;
  transactionsByAccount: Dictionary<any>;
  getTransactionsByAccount: (accountId: number, refresh?: boolean) => void;
  deleteTransactionsByItemId: (itemId: number) => void;
  deleteTransactionsByCompanyId: (companyId: number) => void;
  transactionsByCompany: Dictionary<any>;
  getTransactionsByCompany: (company: number) => void;
  transactionsByItem: Dictionary<any>;
}
const TransactionsContext = createContext<TransactionsContextShape>(
  initialState as TransactionsContextShape
);

/**
 * @desc Maintains the Transactions context state and provides functions to update that state.
 *
 *  The transactions requests below are made from the database only.  Calls to the Plaid transactions/get endpoint are only
 *  made following receipt of transactions webhooks such as 'DEFAULT_UPDATE' or 'INITIAL_UPDATE'.
 */
export function TransactionsProvider(props: any) {
  const [transactionsById, dispatch] = useReducer(reducer, initialState);

  const hasRequested = useRef<{
    byAccount: { [accountId: number]: boolean };
  }>({
    byAccount: {},
  });

  /**
   * @desc Requests all Transactions that belong to an individual Account.
   * The api request will be bypassed if the data has already been fetched.
   * A 'refresh' parameter can force a request for new data even if local state exists.
   */
  const getTransactionsByAccount = useCallback(async (accountId, refresh) => {
    if (!hasRequested.current.byAccount[accountId] || refresh) {
      hasRequested.current.byAccount[accountId] = true;
      const { data: payload } = await apiGetTransactionsByAccount(accountId);
      dispatch({ type: 'SUCCESSFUL_GET', payload: payload });
    }
  }, []);

  /**
   * @desc Requests all Transactions that belong to an individual Item.
   */
  const getTransactionsByItem = useCallback(async itemId => {
    const { data: payload } = await apiGetTransactionsByItem(itemId);
    dispatch({ type: 'SUCCESSFUL_GET', payload: payload });
  }, []);

  /**
   * @desc Requests all Transactions that belong to an individual Company.
   */
  const getTransactionsByCompany = useCallback(async companyId => {
    const { data: payload } = await apiGetTransactionsByCompany(companyId);
    dispatch({ type: 'SUCCESSFUL_GET', payload: payload });
  }, []);

  /**
   * @desc Will Delete all transactions that belong to an individual Item.
   * There is no api request as apiDeleteItemById in items delete all related transactions
   */
  const deleteTransactionsByItemId = useCallback(itemId => {
    dispatch({ type: 'DELETE_BY_ITEM', payload: itemId });
  }, []);

  /**
   * @desc Will Delete all transactions that belong to an individual Company.
   * There is no api request as apiDeleteItemById in items delete all related transactions
   */
  const deleteTransactionsByCompanyId = useCallback(companyId => {
    dispatch({ type: 'DELETE_BY_COMPANY', payload: companyId });
  }, []);

  /**
   * @desc Builds a more accessible state shape from the Transactions data. useMemo will prevent
   * these from being rebuilt on every render unless transactionsById is updated in the reducer.
   */
  const value = useMemo(() => {
    const allTransactions = Object.values(transactionsById);

    return {
      dispatch,
      allTransactions,
      transactionsById,
      transactionsByAccount: groupBy(allTransactions, 'account_id'),
      transactionsByItem: groupBy(allTransactions, 'item_id'),
      transactionsByCompany: groupBy(allTransactions, 'organization_id'),
      getTransactionsByAccount,
      getTransactionsByItem,
      getTransactionsByCompany,
      deleteTransactionsByItemId,
      deleteTransactionsByCompanyId,
    };
  }, [
    dispatch,
    transactionsById,
    getTransactionsByAccount,
    getTransactionsByItem,
    getTransactionsByCompany,
    deleteTransactionsByItemId,
    deleteTransactionsByCompanyId,
  ]);

  return <TransactionsContext.Provider value={value} {...props} />;
}

/**
 * @desc Handles updates to the Transactions state as dictated by dispatched actions.
 */
function reducer(state: TransactionsState, action: TransactionsAction | any) {
  switch (action.type) {
    case 'SUCCESSFUL_GET':
      if (!action.payload.length) {
        return state;
      }
      return {
        ...state,
        ...keyBy(action.payload, 'id'),
      };
    case 'DELETE_BY_ITEM':
      return omitBy(
        state,
        transaction => transaction.item_id === action.payload
      );
    case 'DELETE_BY_COMPANY':
      return omitBy(
        state,
        transaction => transaction.company_id === action.payload
      );
    default:
      console.warn('unknown action: ', action.type, action.payload);
      return state;
  }
}

/**
 * @desc A convenience hook to provide access to the Transactions context state in components.
 */
export default function useTransactions() {
  const context = useContext(TransactionsContext);

  if (!context) {
    throw new Error(
      `useTransactions must be used within a TransactionsProvider`
    );
  }

  return context;
}
