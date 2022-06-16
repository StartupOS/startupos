import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import NavigationLink from 'plaid-threads/NavigationLink';
import LoadingSpinner from 'plaid-threads/LoadingSpinner';
import Button from '@mui/material/Button';

import { 
  RouteInfo, 
  CompanyType, 
  AccountType,
  EmployeeType
 } from './types';
import {
  useCurrentUser,
  useCompanies,
  useLink,
  useAccounts,
  useMergeLink,
  useEmployees
} from '../services';
import { useBoolean } from '../hooks';

import { pluralize } from '../util';

import {
  LinkedIn,
  AccountCard,
  LinkButton,
  ErrorMessage,
  AddCompanyForm,
  MergeLinkButton,
  EmployeeCard
} from '.';

// provides view of user's net worth, spending by category and allows them to explore
// account and transactions details for linked items

const SinglePage = ({ match }: RouteComponentProps<RouteInfo>) => {
  const { userState, getCurrentUser, setCurrentUser } = useCurrentUser();
  const { companiesByUser, getCompany, listCompanies, selectCompany } = useCompanies();
  const { getAccountsByCompany, accountsByCompany } = useAccounts();
  const [ accounts, setAccounts ] = useState<AccountType[]>([]);
  const [ token, setToken] = useState('');
  const { generateLinkToken, linkTokens, checkForAccountToken } = useMergeLink();
  const [ mergeLinkToken, setMergeLinkToken ] = useState<string>("");
  const [ hasMergeToken, setHasMergeToken ] = useState(false);
  const { getEmployeesByCompany, updateEmployees, employeesByCompany } = useEmployees();
  const [ employees, setEmployees ] = useState<EmployeeType[]>([]);
  const [ currentCompany, setCurrentCompany ] = useState<CompanyType|null>(null);
  const [ companyId, setCompanyId] = useState(0);
  const [ userId, setUserId] = useState(0);
  useEffect(() => {
    if (userState.newUser != null) {
      setCurrentUser(userState.newUser);
    }
  }, [setCurrentUser, userState.newUser]);
  useEffect(() => {
    getCurrentUser();
}, [getCurrentUser]);
  const user=userState && userState.currentUser && userState.currentUser.id ? userState.currentUser : {
    id: 0,
    username: '',
    created_at: '',
    updated_at: '',
    given_name: '',
    family_name:'',
    email: '',
    picture:'',
    token:null
  };
  
  

  useEffect(()=>{
    if(companiesByUser.currentCompany){
      setCurrentCompany(companiesByUser.currentCompany);
      if(companiesByUser.currentCompany.id){
          setCompanyId(companiesByUser.currentCompany.id)
      }
    } else if(companiesByUser.companies.length){
      selectCompany(companiesByUser.companies[0])
      setCurrentCompany(companiesByUser.companies[0])
    }
  },[companiesByUser])

  useEffect(()=>{
      if(currentCompany)
          getAccountsByCompany(currentCompany.id)
  },[currentCompany, getAccountsByCompany])

  useEffect(() => {
      if(currentCompany)
          setAccounts(accountsByCompany[currentCompany.id] || []);
  }, [accountsByCompany, getAccountsByCompany, currentCompany]);

  // creates new link token upon new user or change in number of items
  useEffect(() => {
      if (companyId != null) {
        generateLinkToken(companyId); // itemId is null
      }
  }, [companyId, generateLinkToken]);

  useEffect(() => {
      setToken(linkTokens.byCompany[companyId]);
  }, [linkTokens, companyId]);
  const [isAdding, hideForm, toggleForm] = useBoolean(!!userId);

  const canLink = !!(currentCompany && (userId === currentCompany.owner) && token && token.length);

  console.log('Can Link?')
  console.log(canLink);
  console.log(currentCompany);
  console.log('UserId:', userId);
  console.log('Owner:', userId === currentCompany?.owner)
  console.log('Token:', token);

  console.log('Accounts:')
  console.log(accounts);
  

  useEffect(()=>{
    console.log(companiesByUser);
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
    const cId = companiesByUser.currentCompany?.id;
    const uId = userState.currentUser ? userState.currentUser.id : false;
    const owner = companiesByUser.currentCompany?.owner;

    const isOwner = uId && uId == owner;

    console.log('company id:', cId);
    console.log('owner:', owner, '== userId:', uId);
    if(cId && isOwner) {
      generateLinkToken(cId);
    } else {
      console.log('not generating merge link token');
      console.log('current user:');
      console.log(userState.currentUser);
    }
  },[generateLinkToken, companiesByUser.currentCompany, userState.currentUser])

  useEffect(()=>{
    const cId = companiesByUser.currentCompany?.id;
    if(cId && linkTokens.byCompany[cId]){
      setMergeLinkToken(linkTokens.byCompany[cId])
      checkForAccountToken(cId);
    }
  },[generateLinkToken, linkTokens.byCompany, companiesByUser])

  useEffect(()=>{
    setHasMergeToken(linkTokens.hasAccountToken);
  },[generateLinkToken, linkTokens.hasAccountToken, companiesByUser])

  useEffect(()=>{
      if(companiesByUser.currentCompany)
          getEmployeesByCompany(companiesByUser.currentCompany.id)
  },[getEmployeesByCompany, companiesByUser])

  useEffect(() => {
      console.log(companiesByUser.currentCompany);
      if(companiesByUser.currentCompany && employeesByCompany[companiesByUser.currentCompany.id])
          setEmployees(Object.values(employeesByCompany[companiesByUser.currentCompany.id]));
  }, [employeesByCompany, companiesByUser, getEmployeesByCompany]);

  console.log(mergeLinkToken);
  console.log('Can Link?')
  console.log(canLink);
  console.log(currentCompany);
  console.log('UserId:', userId);
  console.log('Owner:', userId==currentCompany?.owner)

  console.log('Employees:')
  console.log(employees);
  
  document.getElementsByTagName('body')[0].style.overflow = 'auto'; // to override overflow:hidden from link pane
  return (
    <div className="SP-page">
        {!!!userId && (<h3>Create Account</h3>)}
        {!!!userId && (<p> StartupOS is linked to a social profile. Right now we only support LinkedIn, though Google is coming soon.</p>
        )}
        
        <LinkedIn redirectUrlProp="https://beta.startupos.dev/SignUp" />
        {userId && 
          (currentCompany ? <AddCompanyForm hideForm={hideForm} setCompany={true} company={currentCompany} /> :
          <AddCompanyForm hideForm={hideForm} setCompany={true}  />)
        }
        {(!!userId && currentCompany) && (<h3>Link Accounts</h3>)}
        {(!!userId && currentCompany) && (<p> StartupOS pulls data via a read only connection via Plaid.</p>)}
        <div id="accountsWrapper">
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
        </div>
        {(!!userId && currentCompany) && (<h3>Link Payroll and Accounting Providers</h3>)}
        {(!!userId && currentCompany) && (<p> StartupOS pulls data via a read only connection that pulls from Quickboooks, Justworks, Gusto, and hundreds more.</p>)}
        <div id="employeesWrapper">
          {employees.map(employee => (
              <div className="accountCards" key={employee.id}>
                <EmployeeCard employee={employee} />
              </div>
            ))}
          {canLink && (
              <MergeLinkButton mergeLinkToken={mergeLinkToken} companyId={companyId}>
                Add Payroll Provider
              </MergeLinkButton>
            )}
          {hasMergeToken && (
            <Button onClick={()=>{updateEmployees(companyId)}}>
              Refresh Employees
            </Button>
          )}
      </div>
    </div>
  );
};

export default SinglePage;
