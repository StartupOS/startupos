import { formatDistanceToNow, parseISO } from 'date-fns';
import {
  PlaidLinkOnSuccessMetadata,
  PlaidLinkOnExitMetadata,
  PlaidLinkStableEvent,
  PlaidLinkOnEventMetadata,
  PlaidLinkError,
} from 'react-plaid-link';
import { EmployeeType } from '../components/types';

import { postLinkEvent as apiPostLinkEvent } from '../services/api';

/**
 * @desc small helper for pluralizing words for display given a number of items
 */
export function pluralize(noun: string, count: number) {
  if(noun[noun.length-1]==='y' && count > 1){
    noun=noun.slice(0,-1)+'ie';
  }
  return count === 1 ? noun : `${noun}s`;
}

export function capitalizeWords(s:string, replaceUnderScore:boolean=false):string{
  const tokens=[];
  const symbols=[];
  const symbolsPos=[];
  let token=""
  for(let c of s){
    if(c.match(/[a-z]/i)){
      token+=c;
    } else {
      tokens.push(token);
      token="";
      symbols.push(c);
      symbolsPos.push(tokens.length);
    }
  }
  if(token) tokens.push(token);
  let reconstructed="";
  let counter=0;
  const reversedSymbolPos = symbolsPos.reverse();
  const reversedSymbols = symbols.reverse();
  for(token of tokens){
    if(token && token.length) {
        const t = token[0].toUpperCase() + token.slice(1);
        reconstructed+=t;
    }
    counter++;
    while(reversedSymbolPos[reversedSymbolPos.length-1] === counter){
      reversedSymbolPos.pop();
      const symbol = reversedSymbols.pop();
      reconstructed+=symbol==="_"&&replaceUnderScore?" ":symbol;
    }

  }
  return reconstructed;
}

/**
 * @desc converts number values into $ currency strings
 */
export function currencyFilter(value: number) {
  if (typeof value !== 'number') {
    return '-';
  }

  const isNegative = value < 0;
  const displayValue = value < 0 ? -value : value;
  return `${isNegative ? '-' : ''}$${displayValue
    .toFixed(2)
    .replace(/(\d)(?=(\d{3})+(\.|$))/g, '$1,')}`;
}

export function payrollBreakDown(employees:EmployeeType[]) {
  const hourly = employees.filter((e)=>e.period==='HOUR');
  const salaried = employees.filter((e)=>e.period==='YEAR');
  const projectedMonthlyHourly = hourly.reduce((p,c)=>p+(+c.rate),0)*160;
  const projectedMonthlySalaried = salaried.reduce((p,c)=>p+(+c.rate),0)/12;
  const projectedTotal = projectedMonthlyHourly + projectedMonthlySalaried
  // TODO: Fix with actual employees actually getting paid
  const actualMonthlyHourly = projectedMonthlyHourly*.75;
  const actualMonthlySalaried = projectedMonthlySalaried*.5;
  const actualTotal = actualMonthlyHourly + actualMonthlySalaried

  return {
    hourly,
    salaried,
    projectedMonthlyHourly,
    projectedMonthlySalaried,
    projectedTotal,
    actualMonthlyHourly,
    actualMonthlySalaried,
    actualTotal
  }
}

const months = [
  null,
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * @desc Returns formatted date.
 */
export function formatDate(timestamp: string) {
  if (timestamp) {
    // slice will return the first 10 char(date)of timestamp
    // coming in as: 2019-05-07T15:41:30.520Z
    const [y, m, d] = timestamp.slice(0, 10).split('-');
    return `${months[+m]} ${d}, ${y}`;
  }

  return '';
}

/**
 * @desc Checks the difference between the current time and a provided time
 */
export function diffBetweenCurrentTime(timestamp: string) {
  return formatDistanceToNow(parseISO(timestamp), {
    addSuffix: true,
    includeSeconds: true,
  }).replace(/^(about|less than)\s/i, '');
}

export const logEvent = (
  eventName: PlaidLinkStableEvent | string,
  metadata:
    | PlaidLinkOnEventMetadata
    | PlaidLinkOnSuccessMetadata
    | PlaidLinkOnExitMetadata,
  error?: PlaidLinkError | null
) => {
  console.log(`Link Event: ${eventName}`, metadata, error);
};

export const logSuccess = async (
  { institution, accounts, link_session_id }: PlaidLinkOnSuccessMetadata,
  userId: number | null
) => {
  logEvent('onSuccess', {
    institution,
    accounts,
    link_session_id,
  });
  await apiPostLinkEvent({
    userId,
    link_session_id,
    type: 'success',
  });
};

export const logExit = async (
  error: PlaidLinkError | null,
  { institution, status, link_session_id, request_id }: PlaidLinkOnExitMetadata,
  userId: number | null
) => {
  logEvent(
    'onExit',
    {
      institution,
      status,
      link_session_id,
      request_id,
    },
    error
  );

  const eventError = error || {};
  await apiPostLinkEvent({
    userId,
    link_session_id,
    request_id,
    type: 'exit',
    ...eventError,
    status,
  });
};
