import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';

import { useBoolean } from '../hooks';
import { useCompanies, useCurrentUser } from '../services';
import { CompaniesCard, AddCompanyForm } from '.'
import { CompanyType, CompanyCardProps } from './types';


export default function CompaniesPage(){
    const [isAdding, hideForm, toggleForm] = useBoolean(false);
    const { getCurrentUser } = useCurrentUser();
    const { companiesByUser, listCompanies, updateCompany, deleteCompany, createCompany, selectCompany} = useCompanies();
    const [companies, setCompanies] = useState<CompanyType[]>([]);
    const [selected, setSelected] = useState<CompanyType | null>(null);


    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    useEffect(()=>{
        listCompanies();
    },[listCompanies, getCurrentUser]);

    useEffect(()=>{
        if(companiesByUser?.companies)
            setCompanies(companiesByUser.companies);
        
        setSelected(companiesByUser.currentCompany);
    }, [companiesByUser, listCompanies, getCurrentUser])
    console.log('CompaniesPage.tsx');
    console.log(companies);
    console.log(companiesByUser);
    const companyCards = companies.map((c)=>{
        const props:CompanyCardProps = {
            ...c,
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