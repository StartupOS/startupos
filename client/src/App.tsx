import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';

import { 
  CompaniesPage,
  CompanyReportPage,
  AccountsPage,
  SharingPage,
  EmployeesPage, 
  Landing2, 
  Sockets, 
  OAuthLink, 
  UserList, 
  Menu, 
  Blank } from './components';
import { AccountsProvider } from './services/accounts';
import { InstitutionsProvider } from './services/institutions';
import { ItemsProvider } from './services/items';
import { LinkProvider } from './services/link';
import { TransactionsProvider } from './services/transactions';
import { UsersProvider } from './services/users';
import { CurrentUserProvider } from './services/currentUser';
import { AssetsProvider } from './services/assets';
import { ErrorsProvider } from './services/errors';
import { CompaniesProvider } from './services/companies'
import { MergeLinkProvider } from './services/mergeLink'
import { EmployeesProvider } from './services/employees'
import { MessagesProvider } from './services/messages'

import './App.scss';
import './StartupOS.scss';
import './Custom.scss';
declare global {
  interface Window { 
    _chatlio: any;
    chatlio: ()=>void;
    ChatlioReact: any;
  }
}
function App() {
  toast.configure({
    autoClose: 8000,
    draggable: false,
    toastClassName: 'box toast__background',
    bodyClassName: 'toast__body',
    hideProgressBar: true,
  });

  window._chatlio = window._chatlio || {}
  function chatlio(){ 
       var t=document.getElementById("chatlio-widget-embed");
       if(t&&window.ChatlioReact&&window._chatlio.init) 
        return void window._chatlio.init(t,window.ChatlioReact);
       const e = function(t:string){return function(...args:string[]){window._chatlio.push([t].concat(args)) }};
       const i:string[] = ["configure","identify","track","show","hide","isShown","isOnline", "page", "open", "showOrHide"];
       for(let a:number=0; a<i.length; a++){
        window._chatlio[ i[a] ]||(window._chatlio[i[a]]=e(i[a]));
       }
  };
  window.setTimeout(chatlio, 3000);
  return (
    <div className="App">
      <InstitutionsProvider>
        <ItemsProvider>
          <LinkProvider>
            <AccountsProvider>
              <TransactionsProvider>
                <ErrorsProvider>
                  <UsersProvider>
                    <CurrentUserProvider>
                      <AssetsProvider>
                        <CompaniesProvider>
                          <MessagesProvider>
                            <MergeLinkProvider>
                              <EmployeesProvider>
                                <Sockets />
                                <Menu />
                                <Switch>
                                  <Route exact path="/" component={Landing2} />
                                  <Route exact path="/Blank" component={Blank} />
                                  <Route exact path="/linked_in_auth" component={Landing2} />
                                  <Route path="/Dashboard" component={CompanyReportPage} />
                                  <Route path="/Companies" component={CompaniesPage} />
                                  <Route path="/Accounts" component={AccountsPage} />
                                  <Route path="/oauth-link" component={OAuthLink} />
                                  <Route path="/Sharing" component={SharingPage} />
                                  <Route path="/Employees" component={EmployeesPage} />
                                  <Route path="/admin" component={UserList} />
                                </Switch>
                              </EmployeesProvider>
                            </MergeLinkProvider>
                          </MessagesProvider>
                        </CompaniesProvider>
                      </AssetsProvider>
                    </CurrentUserProvider>
                  </UsersProvider>
                </ErrorsProvider>
              </TransactionsProvider>
            </AccountsProvider>
          </LinkProvider>
        </ItemsProvider>
      </InstitutionsProvider>
    </div>
  );
}

export default withRouter(App);
