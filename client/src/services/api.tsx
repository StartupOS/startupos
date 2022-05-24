import axios from 'axios';
import { toast } from 'react-toastify';
import { PlaidLinkOnSuccessMetadata } from 'react-plaid-link';

import { DuplicateItemToastMessage } from '../components';
// import { number } from 'prop-types';
import { CompanyType, UserType, MessageType } from '../components/types';


const baseURL = '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

// needed for the route without an interceptor
const api2 = axios.create({
  baseURL,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

api.interceptors.request.use((config)=>{
  const token = localStorage.getItem('token') || '';
  if(config && config.headers) {
    config.headers.Authorization =  token ? `Bearer ${token}` : '';
    return config;
  } else return null;
});
export default api;
// currentUser
export const getLoginUser = (username: string) =>
  api.post('/sessions', { username });

export const getCurrentUser = () => {
  return api.post('/sessions/me');
};

//companies
export const listCompanies = ()=>api.get('/companies');
export const listFunders = ()=>api.get('/companies/funders');
export const getCompany = (companyId: number)=>api.get('/companies/'+companyId);
export const createCompany = (company: CompanyType)=>api.post('/companies/', company);
export const updateCompany = (company: CompanyType)=>api.put('/companies/'+company.id, company);
export const deleteCompany = (companyId: number)=>api.get('/companies/'+companyId);
export const enableSharing = (companyId: number)=>api.post(`/companies/${companyId}/enable_receive_sharing`);
export const canEnableSharing = (companyId: number)=>api.get(`/companies/${companyId}/enable_receive_sharing`);
export const disableSharing = (companyId: number)=>api.delete(`/companies/${companyId}/enable_receive_sharing`);
export const grantPermissions = (companyId: number, target:UserType, permisssions:string[])=>
  api.post(`/companies/${companyId}/grant_permissions`, {target, permisssions});
export const revokePermissions = (companyId: number, target:UserType, permisssions:string[])=>
  api.post(`/companies/${companyId}/revoke_permissions`, {target, permisssions});

export const whoCanISee = (companyId: number)=>api.get(`/companies/${companyId}/sees`);
export const whoSeesMe = (companyId: number)=>api.get(`/companies/${companyId}/seen_by`);

// messages
export const listMessages = ()=>api.get('/messages/');
export const createMessage = (message:MessageType)=>api.post('/messages/', message);
export const retrieveMessage = (messageId: number)=>api.get(`/messages/${messageId}`);
export const updateMessage = (message: MessageType)=>api.put(`/messages/${message.id}`, message);
export const deleteMessage = (messageId: number)=>api.delete(`/messages/${messageId}`)
export const archiveMessage = (messageId: number)=>api.post(`/messages/${messageId}/archive`)
export const unarchiveMessage = (messageId: number)=>api.post(`/messages/${messageId}/unarchive`)
export const markMessageRead = (messageId: number)=>api.post(`/messages/${messageId}/read`)
export const markMessageUnread = (messageId: number)=>api.post(`/messages/${messageId}/unread`)
export const acceptMessage = (messageId: number)=>api.post(`/messages/${messageId}/accept`)


// assets
export const addAsset = (companyId: number, description: string, value: number) =>
  api.post('/assets', { companyId, description, value });
export const getAssetsByCompany = (companyId: number) => api.get(`/assets/${companyId}`);
export const deleteAssetByAssetId = (assetId: number) =>
  api.delete(`/assets/${assetId}`);

// users
export const getUsers = () => api.get('/users');
export const getUserById = (userId: number) => api.get(`/users/${userId}`);
export const addNewUser = (username: string) =>
  api.post('/users', { username });
export const deleteUserById = (userId: number) =>
  api.delete(`/users/${userId}`);

// items
export const getItemById = (id: number) => api.get(`/items/${id}`);
export const getItemsByCompany = (companyId: number) =>
  api.get(`/companies/${companyId}/items`);
export const deleteItemById = (id: number) => api.delete(`/items/${id}`);
export const setItemState = (itemId: number, status: string) =>
  api.put(`items/${itemId}`, { status });
// This endpoint is only availble in the sandbox enviornment
export const setItemToBadState = (itemId: number) =>
  api.post('/items/sandbox/item/reset_login', { itemId });

export const getLinkToken = (userId: number, itemId: number) =>
  api.post(`/link-token`, {
    userId,
    itemId,
  });

// accounts
export const getAccountsByItem = (itemId: number) =>
  api.get(`/items/${itemId}/accounts`);
export const getAccountsByCompany = (companyId: number) =>
  api.get(`/companies/${companyId}/accounts`);
export const deleteAccountById = (accountId:number)=> api.delete(`/accounts/${accountId}`);
export const unDeleteAccountById = (accountId:number)=> api.post(`/accounts/${accountId}/restore`);

// transactions
export const getTransactionsByAccount = (accountId: number) =>
  api.get(`/accounts/${accountId}/transactions`);
export const getTransactionsByItem = (itemId: number) =>
  api.get(`/items/${itemId}/transactions`);
export const getTransactionsByCompany = (companyId: number) =>
  api.get(`/companies/${companyId}/transactions`);

// institutions
export const getInstitutionById = (instId: string) =>
  api.get(`/institutions/${instId}`);

// merge
export const getMergeLinkToken = (companyId: number) => api.get(`/merge/${companyId}/link_token`);
export const hasMergeAccountToken = (companyId: number) => api.get(`/merge/${companyId}/has_token`);
export const exchangeMergePublicToken = (companyId: number, publicToken:string) => 
  api.post(`/merge/${companyId}/exchange_token`, {publicToken});

// employees
export const updateEmployees = (companyId: number) => api.post(`/employees/${companyId}/update`);
export const listEmployees = (companyId:number) => api.get(`/employees/${companyId}`);
export const retrieveEmployee = (companyId:number, employeeId: number) => api.get(`/employees/${companyId}/${employeeId}`);

// permissions
export const getPermissions = ()=> api.get('/permissions');

// LinkedIn Code
export const getLinkedInCredentials = (code:string, redirect?:string) => api2.get(`/login/LinkedInCode?code=${code}&redirectURI=${redirect}`)


// misc
export const postLinkEvent = (event: any) => api.post(`/link-event`, event);

export const exchangeToken = async (
  publicToken: string,
  institution: any,
  accounts: PlaidLinkOnSuccessMetadata['accounts'],
  userId: number
) => {
  try {
    const { data } = await api.post('/items', {
      publicToken,
      institutionId: institution.institution_id,
      userId,
      accounts,
    });
    return data;
  } catch (err:any) {
    const { response } = err;
    if (response && response.status === 409) {
      toast.error(
        <DuplicateItemToastMessage institutionName={institution.name} />
      );
    } else {
      toast.error(`Error linking ${institution.name}`);
    }
  }
};
