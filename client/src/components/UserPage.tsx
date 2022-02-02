import { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import NavigationLink from 'plaid-threads/NavigationLink';
import LoadingSpinner from 'plaid-threads/LoadingSpinner';

import { RouteInfo, CompanyType } from './types';
import {
  useCurrentUser,
  useCompanies,
} from '../services';

import { pluralize } from '../util';

import {
  Banner,
  UserCard,
  LoadingCallout,
  ErrorMessage,
} from '.';

// provides view of user's net worth, spending by category and allows them to explore
// account and transactions details for linked items

const CompanyPage = ({ match }: RouteComponentProps<RouteInfo>) => {
  const { userState, getCurrentUser } = useCurrentUser();
  const { companiesByUser, getCompany, listCompanies } = useCompanies();
  
  useEffect(() => {
    getCurrentUser();
}, [getCurrentUser]);
  const user=userState.currentUser.id ? userState.currentUser : {
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
  
  const userId=userState.currentUser.id
  
  document.getElementsByTagName('body')[0].style.overflow = 'auto'; // to override overflow:hidden from link pane
  return (
    <div>
      <NavigationLink component={Link} to="/">
        BACK TO LOGIN
      </NavigationLink>

      <Banner />
      <UserCard user={user} userId={userId} removeButton={false} linkButton />
      <ErrorMessage />
      <div className="loading">
        <LoadingSpinner />
        <LoadingCallout />
      </div>
      
    </div>
  );
};

export default CompanyPage;
