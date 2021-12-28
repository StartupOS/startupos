import axios from 'axios';
import { toast } from 'react-toastify';
import { PlaidLinkOnSuccessMetadata } from 'react-plaid-link';

import { DuplicateItemToastMessage } from '../components';
// import { number } from 'prop-types';
import { CompanyType } from '../components/types';


const baseURL = '/';

const api = axios.create({
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
export const getCompany = (companyId: number)=>api.get('/companies/'+companyId);
export const createCompany = (company: CompanyType)=>api.post('/companies/', company);
export const updateCompany = (company: CompanyType)=>api.put('/companies/'+company.id, company);
export const deleteCompany = (companyId: number)=>api.get('/companies/'+companyId);



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
