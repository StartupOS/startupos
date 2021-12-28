// reserved for types

export interface RouteInfo {
  userId: string;
}

export interface ItemType {
  id: number;
  plaid_item_id: string;
  company_id: number;
  plaid_access_token: string;
  plaid_institution_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AccountType {
  id: number;
  item_id: number;
  company_id: number;
  plaid_account_id: string;
  name: string;
  mask: string;
  official_name: string;
  current_balance: number;
  available_balance: number;
  iso_currency_code: string;
  unofficial_currency_code: string;
  logo: LogoType;
  primary_color: string;
  type: 'depository' | 'investment' | 'loan' | 'credit';
  subtype:
    | 'checking'
    | 'savings'
    | 'cd'
    | 'money market'
    | 'ira'
    | '401k'
    | 'student'
    | 'mortgage'
    | 'credit card';
  created_at: string;
  updated_at: string;
  deleted: boolean;
}
interface LogoType {
  data: Buffer;
  type: string
}
export interface TransactionType {
  id: number;
  account_id: number;
  item_id: number;
  company_id: number;
  plaid_transaction_id: string;
  plaid_category_id: string;
  category: string;
  subcategory: string;
  type: string;
  name: string;
  amount: number;
  iso_currency_code: string;
  unofficial_currency_code: string;
  date: string;
  pending: boolean;
  account_owner: string;
  created_at: string;
  updated_at: string;
}

export interface AssetType {
  id: number;
  company_id: number;
  value: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface UserType {
  id: number;
  username: string | null;
  given_name: string;
  family_name: string;
  email: string | null;
  picture: string;
  created_at: string;
  updated_at: string;
  token: string | null;
  permissions?:Array<Permission>
}

export type Permission={
  subject: number | '*';
  object: string;
  verb: Verb| '*';
  context: Context | '*';
}

export enum Verb {
  create= 'create',
  retrieve= 'get',
  get='get',
  update='update',
  post='update',
  put='create',
  insert='create',
  delete='delete',
  addPermission='addPermission',
  removePermission='removePermission'
}

export type Context = {
  tokenAuthed? : boolean;
  inCIDR? : string;
  retries? : number;
}

export type User = {
  given_name: string
  family_name: string
  email: string
  picture: string
}

export type CompanyType = {
  id: number;
  name: string;
  ein: string;
  description: string;
  logo?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  country: string;
  owner: number;
  shared?: Number[];
}

export interface CompanyCardProps extends CompanyType{
  selected:CompanyType|null;
  selectCompany:(company:CompanyType|null)=>void;
}