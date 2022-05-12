import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import sortBy from 'lodash/sortBy';
import NavigationLink from 'plaid-threads/NavigationLink';
import LoadingSpinner from 'plaid-threads/LoadingSpinner';
import Callout from 'plaid-threads/Callout';

import { RouteInfo, ItemType, AccountType, AssetType, CompanyType, EmployeeType } from './types';
import {
  useItems,
  useAccounts,
  useTransactions,
  useUsers,
  useAssets,
  useLink,
  useCurrentUser,
  useCompanies,
  useEmployees
} from '../services';

import { pluralize } from '../util';

import {
  Banner,
  LinkButton,
  SpendingInsights,
  NetWorth,
  ItemCard,
  UserCard,
  LoadingCallout,
  ErrorMessage,
  PayrollSummary,
  BurnChart
} from '.';

// provides view of user's net worth, spending by category and allows them to explore
// account and transactions details for linked items

const CompanyReportPage = ({ match }: RouteComponentProps<RouteInfo>) => {
  const { userState } = useCurrentUser();
  const { companiesByUser, getCompany, listCompanies } = useCompanies();
  const { getTransactionsByCompany, transactionsByCompany } = useTransactions();
  const { getAccountsByCompany, accountsByCompany } = useAccounts();
  const { assetsByCompany, getAssetsByCompany } = useAssets();
  const { itemsByCompany, getItemsByCompany } = useItems();
  const { generateLinkToken, linkTokens } = useLink();

  const [ currentCompany, setCurrentCompany ] = useState<CompanyType|null>(null);
  const [companyId, setCompanyId] = useState(0);
  const [items, setItems] = useState<ItemType[]>([]);
  const [token, setToken] = useState('');
  const [numOfItems, setNumOfItems] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState<AccountType[]>([]);
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [userId, setUserId] = useState(0);

  const { getEmployeesByCompany, updateEmployees, employeesByCompany } = useEmployees();
  const [ employees, setEmployees ] = useState<EmployeeType[]>([]);

  useEffect(()=>{
    if(companiesByUser.currentCompany){
      setCurrentCompany(companiesByUser.currentCompany);
      if(companiesByUser.currentCompany.id){
        setCompanyId(companiesByUser.currentCompany.id)
      }
    }
  },[companiesByUser, listCompanies, getCompany])
  
  useEffect(()=>{
    if(userState.currentUser){
      setUserId(userState.currentUser.id);
    }
  },[userState])

  useEffect(() => {
    // This gets transactions from the database only.
    // Note that calls to Plaid's transactions/get endpoint are only made in response
    // to receipt of a transactions webhook.
    if(companyId)
      getTransactionsByCompany(companyId);
  }, [getTransactionsByCompany, companyId]);

  useEffect(() => {
    if(companyId)
      setTransactions(transactionsByCompany[companyId] || []);
  }, [transactionsByCompany, companyId]);

  // update data store with the user's assets
  useEffect(() => {
    if(companyId)
      getAssetsByCompany(companyId);
  }, [getAssetsByCompany, companyId]);

  useEffect(() => {
    if(companyId)
      setAssets(assetsByCompany.assets || []);
  }, [assetsByCompany, companyId]);

  // update data store with the user's items
  useEffect(() => {
    if (companyId) {
      getItemsByCompany(companyId, true);
    }
  }, [getItemsByCompany, companyId]);

  // update state items from data store
  useEffect(() => {
    const newItems: Array<ItemType> = itemsByCompany[companyId] || [];
    const orderedItems = sortBy(
      newItems,
      item => new Date(item.updated_at)
    ).reverse();
    setItems(orderedItems);
  }, [itemsByCompany, companyId]);

  // update no of items from data store
  useEffect(() => {
    if (itemsByCompany[companyId] != null) {
      setNumOfItems(itemsByCompany[companyId].length);
    } else {
      setNumOfItems(0);
    }
  }, [itemsByCompany, companyId]);

  // update data store with the user's accounts
  useEffect(() => {
    getAccountsByCompany(companyId);
  }, [getAccountsByCompany, companyId]);

  useEffect(() => {
    setAccounts(accountsByCompany[companyId] || []);
  }, [accountsByCompany, companyId]);

  // creates new link token upon new user or change in number of items
  useEffect(() => {
    if (companyId != null) {
      generateLinkToken(companyId, null); // itemId is null
    }
  }, [companyId, numOfItems, generateLinkToken]);

  useEffect(() => {
    setToken(linkTokens.byCompany[companyId]);
  }, [linkTokens, companyId, numOfItems]);

  useEffect(()=>{
    if(companiesByUser.currentCompany)
        getEmployeesByCompany(companiesByUser.currentCompany.id)
  },[getEmployeesByCompany, companiesByUser])

  useEffect(() => {
      if(companiesByUser.currentCompany && employeesByCompany[companiesByUser.currentCompany.id])
        setEmployees(Object.values(employeesByCompany[companiesByUser.currentCompany.id]) || []);
  }, [employeesByCompany, companiesByUser, getEmployeesByCompany]);

  document.getElementsByTagName('body')[0].style.overflow = 'auto'; // to override overflow:hidden from link pane
  
  const canLink = !!(currentCompany && (userId == currentCompany.owner) && token && token.length);
  console.log(employees);

  return (
    <div>
      <Banner header="StartupOS Report" help={true}/>
      {linkTokens.error.error_code != null && (
        <Callout warning>
          <div>
            Unable to fetch link_token: please make sure your backend server is
            running and that your .env file has been configured correctly.
          </div>
          <div>
            Error Code: <code>{linkTokens.error.error_code}</code>
          </div>
          <div>
            Error Type: <code>{linkTokens.error.error_type}</code>{' '}
          </div>
          <div>Error Message: {linkTokens.error.error_message}</div>
        </Callout>
      )}
      
      {numOfItems === 0 && <ErrorMessage />}
      {numOfItems === 0 && canLink && currentCompany && (
        // Link will not render unless there is a link token
        <LinkButton token={token} companyId={currentCompany.id} itemId={null}>
          Add Another Bank
        </LinkButton>
      )}
      {numOfItems > 0 && transactions.length === 0 && (
        <div className="loading">
          <LoadingSpinner />
          <LoadingCallout />
        </div>
      )}
      {numOfItems > 0 && transactions.length > 0 && (
        <>
          <BurnChart 
            transactions={transactions} 
            accounts={accounts}
            employees={employees}
            showPL={true}
          />
          <NetWorth
            accounts={accounts}
            numOfItems={numOfItems}
            personalAssets={assets}
            companyId={companyId}
            assetsOnly={false}
            canEdit={canLink}
          />
          <SpendingInsights
            numOfItems={numOfItems}
            transactions={transactions}
          />

        </>
      )}
      {numOfItems === 0 && transactions.length === 0 && assets.length > 0 && (
        <>
          <NetWorth
            accounts={accounts}
            numOfItems={numOfItems}
            personalAssets={assets}
            companyId={companyId}
            assetsOnly
            canEdit={canLink}
          />
          {!!employees.length && (<PayrollSummary employees={employees} />)}
        </>
      )}
      {numOfItems > 0 && (
        <>
          {!!employees.length && (<PayrollSummary employees={employees} />)}
          <div className="item__header report_section">
            <div>
              <h2 className="item__header-heading">
                {`${items.length} ${pluralize('Bank', items.length)} Linked`}
              </h2>
              {!!items.length && (
                <p className="item__header-subheading">
                  Below is a list of all your connected banks. Click on a bank
                  to view its associated accounts.
                </p>
              )}
            </div>
            {canLink && currentCompany && (
              // Link will not render unless there is a link token
              <LinkButton token={token} companyId={currentCompany.id} itemId={null}>
                Add Another Bank
              </LinkButton>
            )}
          </div>
          <ErrorMessage />
          {items.map(item => (
            <div id="itemCards" key={item.id}>
              <ItemCard item={item} userId={userId} canEdit={canLink} />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default CompanyReportPage;
