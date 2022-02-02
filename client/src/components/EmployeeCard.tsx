import React, { useEffect, useState } from 'react';
import startCase from 'lodash/startCase';
import toLower from 'lodash/toLower';

import { EmployeeType } from './types';
import { currencyFilter } from '../util';

interface Props {
  employee: EmployeeType;
}

export default function EmployeeCard(props: Props) {
  const { id } = props.employee;
  
  return (
    <div>
      <div className="account-data-row">
      {props.employee.avatar && (<img src={props.employee.avatar} className="AccountLogo" />)}
        <div className="account-data-row__left">
          <div className="account-data-row__name">{props.employee.display_full_name}</div>
          <div className="account-data-row__balance">
            {` • Salary: ${currencyFilter(+props.employee.rate)} per ${startCase(toLower(props.employee.period))}`}
          </div>
        </div>
      </div>
    </div>
  );
}
