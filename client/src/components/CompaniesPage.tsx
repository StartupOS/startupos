import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';

import { useBoolean } from '../hooks';
import { useCompanies, useCurrentUser } from '../services';
import { CompaniesCard, AddCompanyForm } from '.'
import { CompanyType } from './types';


export default function CompaniesPage(){
    const [isAdding, hideForm, toggleForm] = useBoolean(false);
    const { getCurrentUser } = useCurrentUser();
    const { companiesByUser, listCompanies, updateCompany, deleteCompany, createCompany} = useCompanies();
    const [companies, setCompanies] = useState<CompanyType[]>([]);


    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    useEffect(()=>{
        listCompanies();
    },[listCompanies, getCurrentUser]);

    useEffect(()=>{
        if(companiesByUser?.companies)
            setCompanies(companiesByUser.companies);
    }, [companiesByUser, listCompanies, getCurrentUser])

    console.log(companies);
    const companyCards = companies.map((c)=>CompaniesCard(c));
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