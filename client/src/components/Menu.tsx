import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";

import {Avatar, Alerts, SOSButton} from '.';
import { useCurrentUser } from '../services';
import { useCompanies } from '../services';
import { CompanyType } from './types';
import DomainDisabledIcon from '@mui/icons-material/DomainDisabled';



type User = {
  given_name: string
  family_name: string
  email: string
  picture: string
}



export default function Menu(){
  const { userState, getCurrentUser, setCurrentUser } = useCurrentUser();
  const { companiesByUser, getCompany, listCompanies } = useCompanies();
  const [ currentCompany, setCurrentCompany ] = useState<CompanyType|null>(null);
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  useEffect(()=>{
    setCurrentCompany(companiesByUser.currentCompany);
  },[companiesByUser, listCompanies, getCompany])
    
  console.log(userState);
    return(
        <div className="SOS_Menu">
            { currentCompany && (
            <>
              {currentCompany.logo ?  
                <img src={currentCompany.logo} alt="Your Company Logo" className="Menu_Logo" /> : 
                <DomainDisabledIcon sx={{ fontSize: "5em" }} className="Menu_Logo"/>
              }
              <span className="Menu_CompanyName">{currentCompany.name}</span>
            </>
            )}
            { !currentCompany && (
              <Link to="/Companies">
                <DomainDisabledIcon sx={{ fontSize: "5em" }} />
                <span className="Menu_CompanyName">Select a Company</span>
              </Link>
            )}  
            
            <span className="Menu_Spacer-large"></span>
            <Link to="/Dashboard">
              Dashboard 
            </Link> 
            <span className="Menu_Spacer-small"></span>
            <Link to="/Accounts">
              Accounts 
            </Link>
            <span className="Menu_Spacer-small"></span>
            <Link to="/Employees">
              Employees 
            </Link> 
            <span className="Menu_Spacer-small"></span>
            <Link to="/Sharing">
              Reporting 
            </Link> 
            
            <Alerts />
            <Avatar />
            <SOSButton />
            <hr />
        </div>
    )
}
