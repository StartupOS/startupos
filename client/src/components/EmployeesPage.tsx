import React, { useEffect, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import sortBy from 'lodash/sortBy';
import Button from '@mui/material/Button';

import { RouteInfo, EmployeeType, CompanyType } from './types';
import {
  useCurrentUser,
  useCompanies,
  useEmployees,
  useMergeLink as useMergeLinkService
} from '../services';

import { pluralize } from '../util';

import {
  Banner,
  MergeLinkButton,
  EmployeeCard,
  LoadingCallout,
  ErrorMessage,
} from '.';

// provides view of company's employees and payroll

const EmployeesPage = ({ match }: RouteComponentProps<RouteInfo>) => {
    console.log('Employees PAGE!')
    
    const { userState } = useCurrentUser();
    const { companiesByUser } = useCompanies();

    const { generateLinkToken, linkTokens, checkForAccountToken } = useMergeLinkService();
    const [ mergeLinkToken, setMergeLinkToken ] = useState<string>("");
    const [ hasMergeToken, setHasMergeToken ] = useState(false);

    const { getEmployeesByCompany, updateEmployees, employeesByCompany } = useEmployees();
    const [ employees, setEmployees ] = useState<EmployeeType[]>([]);

    const [ currentCompany, setCurrentCompany ] = useState<CompanyType|null>(null);
    const [ companyId, setCompanyId] = useState(0);
    const [ userId, setUserId] = useState(0);

    useEffect(()=>{
      console.log(companiesByUser);
      if(companiesByUser.currentCompany){
        setCurrentCompany(companiesByUser.currentCompany);
        if(companiesByUser.currentCompany.id){
          setCompanyId(companiesByUser.currentCompany.id)
        }
      }
    },[companiesByUser])
    
    useEffect(()=>{
      if(userState.currentUser){
        setUserId(userState.currentUser.id);
      }
    },[userState])

    useEffect(()=>{
      const cId = companiesByUser.currentCompany?.id;
      const owner = companiesByUser.currentCompany?.owner;
      const isOwner = userId && userId == owner;

      console.log(cId);
      console.log(owner, '==', userId);
      if(cId && isOwner)
        generateLinkToken(cId);
    },[generateLinkToken, companiesByUser, userState])
  
    useEffect(()=>{
      const cId = companiesByUser.currentCompany?.id;
      if(cId && linkTokens.byCompany[cId]){
        setMergeLinkToken(linkTokens.byCompany[cId])
        checkForAccountToken(cId);
      }
    },[generateLinkToken, linkTokens.byCompany, companiesByUser])

    useEffect(()=>{
      setHasMergeToken(linkTokens.hasAccountToken);
    },[generateLinkToken, linkTokens.hasAccountToken, companiesByUser])

    useEffect(()=>{
        if(companiesByUser.currentCompany)
            getEmployeesByCompany(companiesByUser.currentCompany.id)
    },[getEmployeesByCompany, companiesByUser])

    useEffect(() => {
        console.log(companiesByUser.currentCompany);
        if(companiesByUser.currentCompany && employeesByCompany[companiesByUser.currentCompany.id])
            setEmployees(Object.values(employeesByCompany[companiesByUser.currentCompany.id]));
    }, [employeesByCompany, companiesByUser, getEmployeesByCompany]);

    const canLink = !!(currentCompany && (userId == currentCompany.owner));
    console.log(mergeLinkToken);
    console.log('Can Link?')
    console.log(canLink);
    console.log(currentCompany);
    console.log('UserId:', userId);
    console.log('Owner:', userId==currentCompany?.owner)

    console.log('Employees:')
    console.log(employees);
    return (
    <div id="employeesWrapper">
        {employees.map(employee => (
            <div className="accountCards" key={employee.id}>
              <EmployeeCard employee={employee} />
            </div>
          ))}
        {canLink && (
            <MergeLinkButton mergeLinkToken={mergeLinkToken} companyId={companyId}>
              Add Payroll Provider
            </MergeLinkButton>
          )}
        {hasMergeToken && (
          <Button onClick={()=>{updateEmployees(companyId)}}>
            Refresh Employees
          </Button>
        )}
    </div>)
}

export default EmployeesPage