import { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { RouteInfo, AccountType, CompanyType } from './types';
import {
  useAccounts,
  useLink,
  useCurrentUser,
  useCompanies
} from '../services';


import {
  LinkButton,
  AccountCard,
} from '.';

// provides view of user's net worth, spending by category and allows them to explore
// account and transactions details for linked items

const AccountsPage = ({ match }: RouteComponentProps<RouteInfo>) => {
    console.log('ACCOUNTS PAGE!')
    
    const { userState } = useCurrentUser();
    const { companiesByUser } = useCompanies();
    const { getAccountsByCompany, accountsByCompany } = useAccounts();
    const { generateLinkToken, linkTokens } = useLink();
    
    const [ currentCompany, setCurrentCompany ] = useState<CompanyType|null>(null);
    const [ accounts, setAccounts ] = useState<AccountType[]>([]);
    const [ companyId, setCompanyId] = useState(0);
    const [ userId, setUserId] = useState(0);
    // const [ canLink, setCanLink] = useState(false);
    const [ token, setToken] = useState('');


    useEffect(()=>{
      if(companiesByUser.currentCompany){
        setCurrentCompany(companiesByUser.currentCompany);
        if(companiesByUser.currentCompany.id){
          setCompanyId(companiesByUser.currentCompany.id)
        }
      }
    },[companiesByUser])
    
    useEffect(()=>{
      if(userState.currentUser){
        setUserId(userState.currentUser.id);
      }
    },[userState])

    
    
    useEffect(()=>{
        if(companiesByUser.currentCompany)
            getAccountsByCompany(companiesByUser.currentCompany.id)
    },[companiesByUser, getAccountsByCompany])

    useEffect(() => {
        if(companiesByUser.currentCompany)
            setAccounts(accountsByCompany[companiesByUser.currentCompany.id] || []);
    }, [accountsByCompany, getAccountsByCompany, companiesByUser.currentCompany]);

    // creates new link token upon new user or change in number of items
    useEffect(() => {
      if (companyId != null) {
        generateLinkToken(companyId, null); // itemId is null
      }
    }, [companyId, generateLinkToken]);

    useEffect(() => {
      setToken(linkTokens.byCompany[companyId]);
    }, [linkTokens, companyId]);

    const canLink = !!(currentCompany && (userId === currentCompany.owner) && token && token.length);

    console.log('Can Link?')
    console.log(canLink);
    console.log(currentCompany);
    console.log('UserId:', userId);
    console.log('Owner:', userId === currentCompany?.owner)
    console.log('Token:', token);

    console.log('Accounts:')
    console.log(accounts);
    return (<div id="accountsWrapper">
        {accounts.map(account => (
            <div className="accountCards" key={account.id}>
              <AccountCard account={account} />
            </div>
          ))}
        {canLink && (
            // Link will not render unless there is a link token
            <LinkButton token={token} companyId={companyId} itemId={null}>
              Add Another Bank
            </LinkButton>
          )}
    </div>)
}

export default AccountsPage