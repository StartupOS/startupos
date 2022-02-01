import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';

import { useBoolean } from '../hooks';
import { 
    useCompanies, 
    useCurrentUser,
    useTransactions,
    useEmployees,
    useAccounts
 } from '../services';
import { CompaniesCard, AddCompanyForm } from '.'
import { CompanyType, CompanyCardProps, AccountType, EmployeeType, TransactionType } from './types';


export default function CompaniesPage(){
    const [isAdding, hideForm, toggleForm] = useBoolean(false);
    const { getCurrentUser } = useCurrentUser();
    const { companiesByUser, listCompanies, updateCompany, deleteCompany, createCompany, selectCompany} = useCompanies();
    const [companies, setCompanies] = useState<CompanyType[]>([]);
    const [selected, setSelected] = useState<CompanyType | null>(null);

    const [accounts, setAccounts] = useState<AccountType[]>([]);
    const [employees, setEmployees] = useState<EmployeeType[]>([]);
    const [transactions, setTransactions] = useState<TransactionType[]>([]);
    const { getAccountsByCompany, accountsByCompany } = useAccounts();
    const { getTransactionsByCompany, transactionsByCompany } = useTransactions();
    const { getEmployeesByCompany, employeesByCompany } = useEmployees();


    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    useEffect(()=>{
        listCompanies();
    },[listCompanies, getCurrentUser]);

    useEffect(()=>{
        if(companiesByUser?.companies){
            setCompanies(companiesByUser.companies);
            for(const c of companiesByUser?.companies){
                const companyId = c.id;
                getTransactionsByCompany(companyId);
                getAccountsByCompany(companyId);
                getEmployeesByCompany(companyId);
            }
        }
        
        setSelected(companiesByUser.currentCompany);
    }, [companiesByUser, listCompanies, getCurrentUser])
    console.log('CompaniesPage.tsx');
    console.log(companies);
    console.log(companiesByUser);
    companies.sort((a,b)=>b.risk_score-a.risk_score);
    const companyCards = companies.map((c)=>{
        const props:CompanyCardProps = {
            company:c,
            employees: employeesByCompany[c.id] ? Object.values(employeesByCompany[c.id]) : [],
            accounts: accountsByCompany[c.id] || [],
            transactions: transactionsByCompany[c.id] || [],
            selected,
            selectCompany 
        };
        return CompaniesCard(props)});
    console.log(companyCards);
    return (
        <div>
            This is the Companies Page
            You have access to the following companies:
            { companyCards }
            <Button onClick={toggleForm}> Create a new company </Button>
            {isAdding && <AddCompanyForm hideForm={hideForm} />}
        </div>
    )
}