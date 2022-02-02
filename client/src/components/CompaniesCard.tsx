import { useEffect, useState } from 'react';

import { useCurrentUser, useAccounts, useEmployees, useTransactions } from '../services';
import { 
    CompanyCardProps, 
    AccountType,
    EmployeeType,
    TransactionType 
} from './types';
import { BurnChart } from './'
import DomainDisabledIcon from '@mui/icons-material/DomainDisabled';
import colors from 'plaid-threads/scss/colors';



export default function CompaniesCard(props:CompanyCardProps){
    const { company, transactions, accounts, employees } = props;
    console.log(props);
    const { id } = company;
    
    const reds=[
        colors.red1000,
        colors.red900,
        colors.red800,
        colors.red600,
        colors.red400,
        colors.red200,
        colors.white
    ]


    console.log('props.selected');
    console.log(props.selected);
    console.log('props');
    console.log(props);
    const s = (props.selected && id===props.selected.id);
    console.log('s:',s);
    const classes = s?" selected":""
    reds.reverse();
    console.log(company.risk_score);
    const warningClasses="Warning_Level_"+Math.min(company.risk_score, 10);
    return (
        <div 
            className={"CompanyCard" + (classes + " " + warningClasses)} 
            onClick={ (e)=>{
                console.log("Onclick S:",s);
                const newCo = s?null:company
                console.log(newCo);
                props.selectCompany(newCo);
            } } 
            key={company.id}
        >
            <div className="CompanyLogo">
                {company.logo ? <img src={company.logo} alt={company.name + " Logo" }/> : <DomainDisabledIcon sx={{ fontSize: "5em" }}/>}
            </div>
            <div className="CompanyName">{company.name}</div>
            <div className="CompanyDescription">{company.description}</div>
            <div className="CompanyLocation">{company.city}, {company.state}</div>
            <div className="EmployeeCount">Employees: {employees.length}</div>
            <BurnChart 
                accounts={accounts}
                employees={employees}
                transactions={transactions}
                hideHeading={true}
                width={175}
                height={200}
                hideLine={true}
            />
        </div>
    );
}