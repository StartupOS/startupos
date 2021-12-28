import React, { useState, useEffect } from 'react';
import Button from 'plaid-threads/Button';
import TextInput from 'plaid-threads/TextInput';

import { useCompanies } from '../services';
import { CompanyType } from './types';
// import { filterProps } from 'recharts/types/util/types';
// import { createInferTypeNode } from 'typescript';

interface Props {
  hideForm: () => void;
}
enum fieldNames {
  id="id",
  name="name",
  ein="ein",
  description="description",
  logo="logo",
  street1="street1",
  street2="street2",
  city="city",
  state="state",
  country="country",
  owner="owner"
}
const c:CompanyType={
    id: 0,
    name:'Awesome Co',
    ein: '00-0000000',
    description: 'Awesome Co is Awesome',
    logo:'',
    street1: '123 Awesome St.',
    street2: '5th Floor',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    owner:0
};



const AddCompanyForm = (props: Props) => {
    const { createCompany, listCompanies } = useCompanies();
    const [company, setCompany] = useState<CompanyType>(c)  
  
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if(company){
            createCompany(company);
        }
        props.hideForm();
    };

  useEffect(() => {
    listCompanies();
  }, [listCompanies]);

  function reduceField(field:fieldNames, value:string|number){
    const localCo:CompanyType = {...company};
    // @ts-ignore
    localCo[field] = value;
    setCompany(localCo);
  }
  interface FieldProps {
    name: fieldNames;
    index: number;
    description: string;
    placeholder: string;
    value: string | number;
    required: boolean
    id: string
  }

  function FormField(props: FieldProps){
        return ( company &&
            (<div className={"add-user__column-" + props.index}>
                <p className="value add-user__value">
                    {props.description}
                </p>
                <TextInput
                    id={props.id}
                    name={props.id}
                    required={props.required}
                    autoComplete="off"
                    className="input_field"
                    value={company[props.name]+"" }
                    placeholder={props.placeholder}
                    label={props.id}
                    onChange={e => reduceField(props.name, e.target.value)}
                />
            </div>)
        )
    }

    // TODO: Figure out why this needed <any>
    const fields:Array<any> = [
        {
            name: "name",
            description: 'Legal Company Name',
            placeholder: 'AwesomeCo Inc.',
            value: company?.name,
            required: true,
            id: "companyName",
        },
        {
            name: "ein",
            description: 'Employer Identification Number (EIN)',
            placeholder: '00-0000000',
            value: company?.ein,
            required: true,
            id: "companyEIN",
        },
        {
            name: "description",
            description: 'Brief Description',
            placeholder: 'AwesomeCo is Awesome!',
            value: company?.description,
            required: false,
            id: "companyDescription",
        },
        {
            name: "logo",
            description: 'Logo URL',
            placeholder: 'https://jason.startupos.dev/lifePreserver.png',
            value: company?.logo,
            required: false,
            id: "companyLogo",
        },
        {
            name: "street1",
            description: 'Street Address',
            placeholder: '123 Awesome street',
            value: company?.street1,
            required: true,
            id: "companyStreet1",
        },
        {
            name: "street2",
            description: 'Street Address (cont\'d)',
            placeholder: '5th Floor',
            value: company?.street2,
            required: false,
            id: "companyStreet2",
        },
        {
            name: "city",
            description: 'City',
            placeholder: 'New York',
            value: company?.city,
            required: true,
            id: "companyCity",
        },
        {
            name: "state",
            description: 'State',
            placeholder: 'NY',
            value: company?.state,
            required: true,
            id: "companyState",
        },
        {
            name: "country",
            description: 'Country',
            placeholder: 'USA',
            value: company?.country,
            required: true,
            id: "companyCountry",
        },
    ]
  const fieldEls = fields.map((field, idx)=>{
      field.index = idx+1;
      // @ts-ignore
      field.value=c[field.name];
      return FormField(field);
    });

  return (
    <div className="box addUserForm">
      <form onSubmit={handleSubmit}>
        <div className="card" style={{display:"block"}}>
          <div className="add-user__column-0">
            <h3 className="heading add-user__heading">Add a new Company</h3>
          </div>
          {fieldEls}
          <div className="add-user__column--1">
            <Button className="add-user__button" centered small type="submit">
              Add Company
            </Button>
            <Button
              className="add-user__button"
              centered
              small
              secondary
              onClick={props.hideForm}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCompanyForm;
