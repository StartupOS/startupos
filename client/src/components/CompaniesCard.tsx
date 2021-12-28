// import { useEffect, useState } from 'react';

// import { useCompanies, useCurrentUser } from '../services';
import { CompanyCardProps } from './types';
import DomainDisabledIcon from '@mui/icons-material/DomainDisabled';



export default function CompaniesCard(props:CompanyCardProps){
    console.log('props.selected');
    console.log(props.selected);
    console.log('props');
    console.log(props);
    const s = (props.selected && props.id===props.selected.id);
    console.log('s:',s);
    const classes = s?" selected":""
    return (
        <div 
            className={"CompanyCard" + (classes)} 
            onClick={ (e)=>{
                console.log("Onclick S:",s);
                const newCo = s?null:props
                console.log(newCo);
                props.selectCompany(newCo);
            } } 
            key={props.id}
        >
            <div className="CompanyLogo">
                {props.logo ? <img src={props.logo} alt={props.name + " Logo" }/> : <DomainDisabledIcon sx={{ fontSize: "5em" }}/>}
            </div>
            <div className="CompanyName">{props.name}</div>
            <div className="CompanyDescription">{props.description}</div>
            <div className="CompanyLocation">{props.city}, {props.state}</div>
        </div>
    );
}