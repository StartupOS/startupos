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
import { PLComponent } from './'
import { payrollBreakDown, capitalizeWords } from '../util'
import colors from 'plaid-threads/scss/colors';
import moment  from 'moment';


interface Props {
  transactions: TransactionType[];
  accounts: AccountType[];
  employees: EmployeeType[];
  currencySymbol?: string;
  heading?:string;
  height?:number;
  width?:number;
  colors?:string[];
  subheading?:string;
  hideLine?:boolean;
  hideHeading?:boolean;
  showPL?:boolean;
}

function tx_within(tx:TransactionType, startMonth:Date, endMonth:Date):boolean{
    const txDate = new Date(Date.parse(tx.date));

    return startMonth <= txDate && txDate<=endMonth;
}

function txInAccounts(tx:TransactionType, accounts:AccountType[]):boolean{
    const { account_id } = tx;
    const validIds = accounts.map(a=>a.id);
    return validIds.includes(account_id);
}

export default function BurnChart(props: Props) {
  const { transactions, accounts, employees } = props
  const showPL = !!props.showPL 
  const {
        hourly,
        salaried,
        projectedMonthlyHourly,
        projectedMonthlySalaried,
        projectedTotal,
        actualMonthlyHourly,
        actualMonthlySalaried,
        actualTotal
  } = payrollBreakDown(employees);
  console.log("transactions")
  console.log(transactions)
  const filterAccounts = (
    accountSubtypes: Array<AccountType['subtype']>
  ): AccountType[] =>
    props.accounts
      .filter(a => accountSubtypes.includes(a.subtype) && !a.deleted);

  const filterTransactions = (
      transactions: TransactionType[],
      desiredAccounts: AccountType[],
      monthsAgo:number=0
    ):TransactionType[]=>{
      const currentDate = new Date();
      const endMonth =  moment(currentDate).subtract(monthsAgo,'months').endOf('month').toDate();
      const startMonth =  moment(currentDate).subtract(monthsAgo,'months').startOf('month').toDate();
      const filteredTransactions = transactions.filter(t=>
        tx_within(t, startMonth, endMonth) &&
        txInAccounts(t, desiredAccounts)
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
  const months=[];
  for(let i=0; i<6; i++){
    months.push(moment(new Date()).subtract(i,'months').format('MMMM'))
    let prev = monthlyBalance[i];
    const txs= filterTransactions(transactions, cashAccounts, i)
    let delta = txs
      .reduce((p,c)=>Math.round((p+(c.amount*-1))*100)/100,0);
    console.log(months[i],':',delta)
    console.log(txs);
    monthlyDelta.push(delta);
    monthlyBalance.push(Math.round((prev-delta)*100)/100);
    // months.push(moment(new Date()).subtract(i+1,'months').format('MMMM'))
  }

  console.log('Monthly Balances:');
  console.log(monthlyBalance);
  console.log(monthlyDelta);

  type dataType = {
    name:string;
    balance?:number;
    delta?:number;
    projected_Delta?:number;
    projected_Balance?:number;
  }
  const data:dataType[] = months.map((m,i)=>{
        // if(i===5){
        //     return {
        //         name:m,
        //         balance:monthlyBalance[i],
        //     }
        // } else {
        //     return {
        //         name:m,
        //         balance: monthlyBalance[i],
        //         delta: monthlyDelta[i],
        //     }   
        // }
      return {
          name:m,
          balance: monthlyBalance[i],
          delta: monthlyDelta[i],
      }  
    });
    data.reverse()

    console.log(data);
    const avgBurn = monthlyDelta.reduce((p,c)=>p+c,0)/monthlyDelta.length;
    const weightedBurn = (avgBurn + monthlyDelta[1])/2 - actualTotal + projectedTotal;
    data[data.length-1].projected_Delta=-weightedBurn;
    data[data.length-2].projected_Delta=data[data.length-2].delta;
    data[data.length-1].projected_Balance=data[data.length-1].balance;
    const monthsRemaining = Math.max(0, Math.round(currentCashBalance/weightedBurn*10)/10);
    for(let i=0; i<3; i++){
      let prev = data[i+5].projected_Balance || data[i+5].balance || 0;
      let delta = data[i+5].projected_Delta || data[i+5].delta || 0;
      let prevDelta = data[i+4].projected_Delta || data[i+5].delta || 0;
      data.push({
        name: moment(new Date()).add(i+1,'months').format('MMMM'),
        projected_Balance: prev + delta,
        projected_Delta: delta + (delta-prevDelta)
      })
    }



  const COLORS = [
    colors.green900,
    colors.red900,
    colors.blue900,
    colors.yellow900,
    colors.purple600,
    '#FF8863',
    colors.black1000,
  ];
  
  const heading = props.heading!==undefined?props.heading:"Cash Flow";
  const myColors = props.colors!==undefined?props.colors:COLORS;
  const myHeight = props.height!==undefined?props.height:325;
  const myWidth = props.width!==undefined?props.width:175;

  console.log(myColors);
  // @ts-ignore
  window["Jason"]=data

  return (
    <div className="burnchart report_section">
      {!props.hideHeading && (<h2 className="holdingsHeading">{heading}</h2>)}
      {showPL && (<PLComponent transactions={transactions} accounts={accounts} />)}
      {props.subheading !==undefined && (<h5>{props.subheading}</h5>)}
      {!props.hideLine && (<LineChart
        data={data}
        width={500/175*myWidth}
        height={myHeight}
      >
          <XAxis dataKey="name" />
          <YAxis 
            tickFormatter={(value) => "$"+new Intl.NumberFormat('en', { 
              notation: "compact", 
              compactDisplay: "short" }).format(value)}
          />
          <Tooltip formatter={(value:number, name:string, props:any) => ["$"+new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value), capitalizeWords(name, true)]}/>
          {!props.hideLine &&(<Legend formatter={(value:string, entry:any) => capitalizeWords(value, true)}/>)}
          <Line type="monotone" dataKey="balance" stroke={myColors[0]} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="projected_Balance" stroke={myColors[0]} strokeDasharray="3 4 5 2"/>
          <Line type="monotone" dataKey="delta" stroke={myColors[1]} />
          <Line type="monotone" dataKey="projected_Delta" stroke={myColors[1]} strokeDasharray="3 4 5 2"/>
      </LineChart>)}
      <div className="bars" >
        <BarChart 
            data={[{
                name: "Remaining Cash",
                other: currentCashBalance
            }]}
            width={myWidth}
            height={myHeight}
        >
            <YAxis 
              hide={true} 
              domain={[(dataMin:number)=>Math.min(dataMin, 0), (dataMax:number)=>Math.max(dataMax, Math.round(weightedBurn * 18))]}
            />
            <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />
            <Tooltip 
              formatter={(value:number, name:string, props:any) => ["$"+new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value), props.payload.name]}/>
            <Bar dataKey="other" fill={myColors[0]} background={{ fill: '#eee' }} />
        </BarChart>
        <BarChart 
            data={[{
                name: "Cash Burn",
                other_costs: -(weightedBurn-projectedTotal),
                payroll: -projectedTotal
            }]}
            width={myWidth*145/175}
            height={myHeight}
            stackOffset="sign"

        >
            <YAxis hide={true} domain={[(dataMin:number)=>Math.min(-projectedTotal, -weightedBurn, -currentCashBalance)*1.5, (dataMax:number)=>-Math.min(-projectedTotal, -weightedBurn, -currentCashBalance)*1.5]}/>
            <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />
            <Tooltip formatter={(value:number, name:string, props:any) => ["$"+new Intl.NumberFormat('en', { notation: "compact", compactDisplay: "short" }).format(value), capitalizeWords(name, true)]}/>
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey="payroll" stackId="CashBurn" fill={myColors[3]} background={{ fill: '#eee' }} />
            <Bar dataKey="other_costs" stackId="CashBurn" fill={myColors[4]} />
        </BarChart>
        <BarChart
            data={[{name:"Months Remaining", value:monthsRemaining}]}
            width={myWidth*145/175}
            height={myHeight}
        >
            <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />
            <YAxis hide={true} domain={[0, (dataMax:number)=>Math.max(dataMax+1,18)]}/>
            <Tooltip 
                formatter={(value:number, name:string, props:any) => {
                    // console.log(props);
                    return [value===0 || isNaN(value)?'N/A':value, props.payload.name]
                }} 
            />
            <Bar dataKey="value" fill={myColors[5]} background={{ fill: '#eee' }}/>
        </BarChart>
      </div>
    </div>
  );
}
