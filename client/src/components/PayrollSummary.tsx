import React, { useEffect, useState } from 'react';
import startCase from 'lodash/startCase';
import toLower from 'lodash/toLower';
import { CategoriesChart } from '.';


import { EmployeeType } from './types';
import { currencyFilter, pluralize, payrollBreakDown } from '../util';


interface Props {
  employees: EmployeeType[];
}

export default function EmployeeCard(props: Props) {
  const { employees } = props;
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

  const colors=[
      "#63daff", //blue
      "#FF8863" // orange
  ]
  return (
    <div className="payrollSummary report_section">
      <h2> Payroll Summary</h2>
      <div className="projected">
        <CategoriesChart 
            heading="Projected Payroll:"
            subheading="(next month)"
            categories={{salary:projectedMonthlySalaried, hourly:projectedMonthlyHourly}} 
            width={375}
            colors={colors}
        />
        <div className="total">Total: {currencyFilter(projectedTotal)}</div>
      </div>
      <div className="actual">
        <CategoriesChart 
            heading="Actual Payroll:"
            subheading="(last Month)"
            categories={{salary:actualMonthlySalaried, hourly:actualMonthlyHourly}} 
            width={375}
            colors={colors}
        />
        <div className="total">Total: {currencyFilter(actualTotal)}</div>
      </div>
      <div className="breakdown">
        <CategoriesChart 
            heading="Employees:"
            subheading="(this month)"
            categories={{salary:salaried.length, hourly:hourly.length}} 
            currencySymbol=""
            width={375}
            colors={colors}
        />
        <div className="total">Total: {salaried.length + hourly.length} employees</div>
      </div>
    </div>
  );
}
