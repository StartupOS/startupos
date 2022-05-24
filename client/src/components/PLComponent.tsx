import React from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    BarChart, 
    Bar, 
    Cell,
    ReferenceLine
} from 'recharts';
import { TransactionType, AccountType, EmployeeType } from './types'
import { payrollBreakDown, capitalizeWords } from '../util'
import colors from 'plaid-threads/scss/colors';
import moment  from 'moment';

interface Props {
    transactions: TransactionType[];
    accounts: AccountType[];
    currencySymbol?: string;
    heading?:string;
    height?:number;
    width?:number;
    colors?:string[];
    subheading?:string;
    hideLine?:boolean;
    hideHeading?:boolean;
}
function makePercent(inn:string):string{
    let n = +inn
    n*=10000;
    n=Math.floor(n)/100;
    const s = n+"%";
    return s;
}
function truncate(inn:number, dig:number):string{
    const retNum = Math.round(inn*Math.pow(10,dig))/Math.pow(10,dig)
    return !isFinite(retNum)?'-':retNum.toLocaleString();
}
// TODO: Move to utils
function tx_within(tx:TransactionType, startMonth:Date, endMonth:Date):boolean{
    const txDate = new Date(Date.parse(tx.date));

    return startMonth <= txDate && txDate<=endMonth;
}

function txInAccounts(tx:TransactionType, accounts:AccountType[]):boolean{
    const { account_id } = tx;
    const validIds = accounts.map(a=>a.id);
    return validIds.includes(account_id);
}
export default function PLComponent(props: Props) {
    const { transactions, accounts } = props;

    const filterAccounts = (
        accountSubtypes: Array<AccountType['subtype']>
      ): AccountType[] =>
        props.accounts
          .filter(a => accountSubtypes.includes(a.subtype) && !a.deleted);
    
    const filterTransactions = (
        transactions: TransactionType[],
        desiredAccounts: AccountType[],
        yearsAgo:number=0,
        inclRev:boolean=true,
        inclSpend:boolean=true
    ):TransactionType[]=>{
        const currentDate = new Date();
        const endYear =  moment(currentDate).subtract(yearsAgo,'years').toDate();
        const startYear =  moment(currentDate).subtract(yearsAgo + 1 ,'years').toDate();
        const filteredTransactions = transactions.filter(t=>
        tx_within(t, startYear, endYear) &&
        txInAccounts(t, desiredAccounts) &&
        (t.amount > 0 && inclSpend || t.amount<0 && inclRev)
        );
        return filteredTransactions;
    }
    const cashAccounts = filterAccounts([
        'checking',
        'savings',
        'cd',
        'money market',
    ]);
    const currentCashBalance = cashAccounts.reduce((p,c)=>p+c.current_balance,0);
    const monthlyBalance:number[] = [currentCashBalance];
    const monthlyDelta:number[] = [];
    const annualRev:number[] = [];
    const annualSpend:number[]=[];
    const months=[];
    for(let i=0; i<2; i++){
        months.push(moment(new Date()).subtract(i,'years').format('YYYY'))
        let prev = monthlyBalance[i];
        const txs= filterTransactions(transactions, cashAccounts, i)
        const rtxs= filterTransactions(transactions, cashAccounts, i, true, false)
        const stxs= filterTransactions(transactions, cashAccounts, i, false, true)
        let delta = txs.reduce((p,c)=>Math.round((p+(c.amount*-1))*100)/100,0);
        let rev = rtxs.reduce((p,c)=>Math.round((p+(c.amount*-1))*100)/100,0);
        let spend = stxs.reduce((p,c)=>Math.round((p+(c.amount))*100)/100,0);
        monthlyDelta.push(delta);
        annualRev.push(rev);
        annualSpend.push(spend);
        monthlyBalance.push(Math.round((prev-delta)*100)/100);
    }


    type dataType = {
        name:string;
        balance?:number;
        delta:number;
        rev:number;
        spend:number;
        ratio:number;
        benchmark: number;
        variance: number
    }
    function makeBencmark(rev:number):number{
        const COEF = 10;
        const POW = 20
        const b = Math.min(1/(COEF*Math.pow(Math.log10(Math.log10(rev)),POW)),Math.max(10,1000000/rev))
        return b;
    }
    const data:dataType[] = months.map((m,i)=>{
      return {
          name:m,
          balance: monthlyBalance[i]/1000,
          delta: monthlyDelta[i]/1000,
          rev: annualRev[i]/1000,
          spend: annualSpend[i]/1000,
          ratio: annualSpend[i]/annualRev[i],
          benchmark:makeBencmark(annualRev[i]),
          variance:annualSpend[i]/annualRev[i] - makeBencmark(annualRev[i]),
      }  
    });
    data.reverse();

    return (<>
    <h2>Profit & Loss</h2> 
    <table className="PL-Table">
        <thead>
            <tr>
                <th>(All $ in 1,000s)</th>
                <th title="Trailing Twelve Months">TTM</th>
                <th>Prior</th>
                <th>&Delta;</th>
                <th>&Delta; %</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td className="RowHeader">Sales/Revenue</td>
                <td>{truncate(data[1].rev, 2)}</td>
                <td>{truncate(data[0].rev, 2)}</td>
                <td className={data[1].rev>data[0].rev?'good':'bad'}>{truncate(data[1].rev - data[0].rev,2)}</td>
                <td className={data[1].rev>data[0].rev?'good':'bad'}>{makePercent(truncate((data[1].rev - data[0].rev)/data[0].rev,2))}</td>
            </tr>
            <tr>
                <td className="RowHeader">Spend</td>
                <td>{truncate(data[1].spend, 2)}</td>
                <td>{truncate(data[0].spend, 2)}</td>
                <td className={data[1].spend<data[0].spend?'good':'bad'}>{truncate(data[1].spend - data[0].spend,2)}</td>
                <td className={data[1].spend<data[0].spend?'good':'bad'}>{makePercent(truncate((data[1].spend - data[0].spend)/data[0].spend,4))}</td>
            </tr>
            <tr>
                <td className="RowHeaderLite">% of Revenue</td>
                <td>{makePercent(truncate(data[1].ratio, 2))}</td>
                <td>{makePercent(truncate(data[0].ratio, 2))}</td>
                <td className={data[1].ratio<data[0].ratio?'good':'bad'}>{truncate(data[1].ratio - data[0].ratio,4)}</td>
                <td className={data[1].ratio<data[0].ratio?'good':'bad'}>{makePercent(truncate((data[1].ratio - data[0].ratio)/data[0].ratio,4))}</td>
            </tr>
            <tr>
                <td className="RowHeaderLite">Benchmark</td>
                <td>{makePercent(truncate(data[1].benchmark, 2))}</td>
                <td>{makePercent(truncate(data[0].benchmark, 2))}</td>
                <td>{truncate(data[1].benchmark - data[0].benchmark,4)}</td>
                <td>{makePercent(truncate((data[1].benchmark - data[0].benchmark)/data[0].benchmark,4))}</td>
            </tr>
            <tr>
                <td className="RowHeaderLite">Variance</td>
                <td className={data[1].variance<0?'good':'bad'}>{truncate(data[1].variance, 2)}</td>
                <td className={data[0].variance<0?'good':'bad'}>{truncate(data[0].variance, 2)}</td>
                <td>{truncate(data[1].variance - data[0].variance,4)}</td>
                <td>{makePercent(truncate((data[1].variance - data[0].variance)/data[0].variance,4))}</td>
            </tr>
            <tr>
                <td className="RowHeader">Net Change in Cash</td>
                <td className={data[1].delta>0?'good':'bad'}>{truncate(data[1].delta, 2)}</td>
                <td className={data[0].delta>0?'good':'bad'}>{truncate(data[0].delta, 2)}</td>
                <td className={data[1].delta>data[0].delta?'good':'bad'}>{truncate(data[1].delta - data[0].delta,2)}</td>
                <td className={data[1].delta>data[0].delta?'good':'bad'}>{makePercent(truncate((data[1].delta - data[0].delta)/data[0].delta,2))}</td>
            </tr>
        </tbody>
    </table>
    </>)

}