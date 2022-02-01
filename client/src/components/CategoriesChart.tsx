import React from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import colors from 'plaid-threads/scss/colors';
import { WidgetsSharp } from '@mui/icons-material';

interface Props {
  categories: {
    [key: string]: number;
  };
  currencySymbol?: string;
  heading?:string;
  width?:number;
  colors?:string[];
  subheading?:string
}

export default function CategoriesChart(props: Props) {
  const data = [];
  const labels = Object.keys(props.categories);
  const values = Object.values(props.categories);
  for (let i = 0; i < labels.length; i++) {
    data.push({ name: labels[i], value: Math.round(values[i]) });
  }

  const COLORS = [
    colors.yellow900,
    colors.red900,
    colors.blue900,
    colors.green900,
    colors.black1000,
    colors.purple600,
  ];
  const currencySymbol = props.currencySymbol!==undefined?props.currencySymbol:"$";
  const renderLabel = (value: any) => {
    return `${currencySymbol}${value.value.toLocaleString()}`;
  };
  const heading = props.heading!==undefined?props.heading:"Spending Categories";
  const width = props.width!==undefined?props.width:400;
  const myColors = props.colors!==undefined?props.colors:COLORS;


  return (
    <div className="holdingsList">
      <h4 className="holdingsHeading">{heading}</h4>
      {props.subheading !==undefined && (<h5>{props.subheading}</h5>)}
      <PieChart width={width} height={width}>
        <Legend />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          isAnimationActive={false}
          paddingAngle={5}
          label={renderLabel}
          innerRadius={70}
          outerRadius={90}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={myColors[index % myColors.length]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
}
