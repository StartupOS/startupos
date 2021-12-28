import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  Dispatch,
  ReactNode,
} from 'react';
import groupBy from 'lodash/groupBy';
import keyBy from 'lodash/keyBy';
import omitBy from 'lodash/omitBy';
import { AccountType } from '../components/types';

import {
  getAccountsByItem as apiGetAccountsByItem,
  getAccountsByCompany as apiGetAccountsByCompany,
  deleteAccountById as apiDeleteAccountById,
  unDeleteAccountById as apiUnDeleteAccountById
} from './api';

interface AccountsState {
  [accountId: number]: AccountType;
}

const initialState: AccountsState = {};
type AccountsAction =
  | {
      type: 'SUCCESSFUL_GET';
      payload: AccountType[];
    }
  | { type: 'DELETE_BY_ITEM'; payload: number }
  | { type: 'DELETE_BY_ID'; payload: number }
  | { type: 'UNDELETE_BY_ID'; payload: number }
  | { type: 'DELETE_BY_COMPANY'; payload: number };

interface AccountsContextShape extends AccountsState {
  dispatch: Dispatch<AccountsAction>;
  accountsByItem: { [itemId: number]: AccountType[] };
  deleteAccountsByItemId: (itemId: number) => void;
  getAccountsByCompany: (companyId: number) => void;
  accountsByCompany: { [company_id: number]: AccountType[] };
  deleteAccountsByCompanyId: (companyId: number) => void;
  deleteAccountById: (accountId:number)=>void;
  unDeleteAccountById: (accountId:number)=>void;
}
const AccountsContext = createContext<AccountsContextShape>(
  initialState as AccountsContextShape
);

/**
 * @desc Maintains the Accounts context state and provides functions to update that state.
 */
export const AccountsProvider: React.FC<{ children: ReactNode }> = (
  props: any
) => {
  const [accountsById, dispatch] = useReducer(reducer, initialState);

  /**
   * @desc Requests all Accounts that belong to an individual Item.
   */
  const getAccountsByItem = useCallback(async itemId => {
    const { data: payload } = await apiGetAccountsByItem(itemId);
    dispatch({ type: 'SUCCESSFUL_GET', payload: payload });
  }, []);

  const deleteAccountById = useCallback(async accountId=>{
    const {data:payload} = await apiDeleteAccountById(accountId);
    const id:number = payload[0].id;
    dispatch({type: 'DELETE_BY_ID', payload:id});
  },[])

  const unDeleteAccountById = useCallback(async accountId=>{
    const {data:payload} = await apiUnDeleteAccountById(accountId);
    const id:number = payload[0].id;
    dispatch({type: 'UNDELETE_BY_ID', payload:id});
  },[])

  /**
   * @desc Requests all Accounts that belong to an individual Company.
   */
  const getAccountsByCompany = useCallback(async companyId => {
    const { data: payload } = await apiGetAccountsByCompany(companyId);
    dispatch({ type: 'SUCCESSFUL_GET', payload: payload });
  }, []);

  /**
   * @desc Will delete all accounts that belong to an individual Item.
   * There is no api request as apiDeleteItemById in items delete all related transactions
   */
  const deleteAccountsByItemId = useCallback(itemId => {
    dispatch({ type: 'DELETE_BY_ITEM', payload: itemId });
  }, []);

  

  /**
   * @desc Builds a more accessible state shape from the Accounts data. useMemo will prevent
   * these from being rebuilt on every render unless accountsById is updated in the reducer.
   */
  const value = useMemo(() => {
    const allAccounts = Object.values(accountsById);

    return {
      allAccounts,
      accountsById,
      accountsByItem: groupBy(allAccounts, 'item_id'),
      accountsByCompany: groupBy(allAccounts, 'organization_id'),
      getAccountsByItem,
      getAccountsByCompany,
      deleteAccountsByItemId,
      deleteAccountById,
      unDeleteAccountById
    };
  }, [
    accountsById,
    getAccountsByItem,
    getAccountsByCompany,
    deleteAccountsByItemId,
    deleteAccountById,
    unDeleteAccountById
  ]);

  return <AccountsContext.Provider value={value} {...props} />;
};

/**
 * @desc Handles updates to the Accounts state as dictated by dispatched actions.
 */
function reducer(state: AccountsState, action: AccountsAction) {
  switch (action.type) {
    case 'SUCCESSFUL_GET':
      if (!action.payload.length) {
        return state;
      }
      const newGetState= {
        ...state,
        ...keyBy(action.payload, 'id'),
      };
      return omitBy(newGetState, (transaction:AccountType) => transaction.deleted);
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
      case 'DELETE_BY_ID':
        console.log(action.payload)
        console.log(state);
        const newState = {...state};
        if(newState[action.payload])
          newState[action.payload].deleted=true;  
        return omitBy(
          newState,
          transaction => transaction.deleted
        );
      case 'UNDELETE_BY_ID':
        const unDeleteState = {...state};
        if(unDeleteState[action.payload])
          unDeleteState[action.payload].deleted=false;  
        return omitBy(
          unDeleteState,
          transaction => transaction.deleted
        );
    default:
      console.warn('unknown action');
      return state;
  }
}

/**
 * @desc A convenience hook to provide access to the Accounts context state in components.
 */
export default function useAccounts() {
  const context = useContext(AccountsContext);

  if (!context) {
    throw new Error(`useAccounts must be used within an AccountsProvider`);
  }

  return context;
}
