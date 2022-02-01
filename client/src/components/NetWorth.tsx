import React from 'react';
import IconButton from 'plaid-threads/IconButton';
import Trash from 'plaid-threads/Icons/Trash';

import { currencyFilter, pluralize } from '../util';
import { Asset } from '.';
import { AccountType, AssetType } from './types';
import { useAssets } from '../services';
interface Props {
  numOfItems: number;
  accounts: AccountType[];
  personalAssets: AssetType[];
  companyId: number;
  assetsOnly: boolean;
  canEdit: boolean
}

export default function NetWorth(props: Props) {
  const { deleteAssetByAssetId } = useAssets();
  // sums of account types
  const addAllAccounts = (
    accountSubtypes: Array<AccountType['subtype']>
  ): number =>
    props.accounts
      .filter(a => accountSubtypes.includes(a.subtype) && !a.deleted)
      .reduce((acc: number, val: AccountType) => acc + val.current_balance, 0);

  const depository: number = addAllAccounts([
    'checking',
    'savings',
    'cd',
    'money market',
  ]);
  const investment: number = addAllAccounts(['ira', '401k']);
  const loan: number = addAllAccounts(['student', 'mortgage']);
  const credit: number = addAllAccounts(['credit card']);

  const personalAssetValue = props.personalAssets.reduce((a, b) => {
    return a + b.value;
  }, 0);

  const assets = depository + investment + personalAssetValue;
  const liabilities = loan + credit;

  const handleDelete = (assetId: number, companyId: number) => {
    deleteAssetByAssetId(assetId, companyId);
  };

  return (
    <div className="netWorthContainer report_section">
      <h2 className="netWorthHeading">Balance Sheet</h2>
      <h4 className="tableSubHeading">
        A summary of your assets and liabilities
      </h4>
      {!props.assetsOnly && (
        <>
          <div className="netWorthText">{`Your total across ${
            props.numOfItems
          } bank ${pluralize('account', props.numOfItems)}`}</div>
          <h2 className="netWorthDollars">
            {currencyFilter(assets - liabilities)}
          </h2>
          <div className="holdingsContainer">
            <div className="userDataBox">
              <div className="holdingsList">
                <div className="assetsHeaderContainer">
                  <h4 className="dollarsHeading">{currencyFilter(assets)}</h4>
                  <Asset companyId={props.companyId} canEdit={props.canEdit}/>
                </div>

                <div className="data">
                  {/* 3 columns */}
                  <h4 className="holdingsHeading">Assets</h4>
                  <p>{''}</p>
                  <p>{''}</p>
                  <p className="dataItem">Cash</p>{' '}
                  <p className="dataItem">{currencyFilter(depository)}</p>
                  <p>{''}</p>
                  <p className="dataItem">Investment</p>
                  <p className="dataItem">{currencyFilter(investment)}</p>
                  <p>{''}</p>
                </div>
                <div className="personalAssets">
                  {props.personalAssets.map(asset => (
                    <div className="personalAsset">
                      <p className="dataItem">{asset.description}</p>
                      <p className="dataItem">{currencyFilter(asset.value)}</p>
                      <p>
                        <IconButton
                          accessibilityLabel="Navigation"
                          icon={<Trash />}
                          onClick={() => {
                            handleDelete(asset.id, props.companyId);
                          }}
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="userDataBox">
              <div className="holdingsList">
                <h4 className="dollarsHeading">
                  {currencyFilter(liabilities)}
                </h4>

                <div className="data">
                  {/* 3 columns */}
                  <h4 className="holdingsHeading">Liabilities</h4>
                  <p>{''}</p>
                  <p>{''}</p>
                  <p className="dataItem">Credit Cards</p>{' '}
                  <p className="dataItem">{currencyFilter(credit)}</p>
                  <p>{''}</p>
                  <p className="dataItem">Loans</p>
                  <p className="dataItem">{currencyFilter(loan)}</p>
                  <p>{''}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {props.assetsOnly && (
        <>
          <h2 className="netWorthDollars">
            {currencyFilter(assets - liabilities)}
          </h2>
          <div className="holdingsContainer">
            <div className="userDataBox">
              <div className="holdingsList">
                <div className="assetsHeaderContainer">
                  <h4 className="dollarsHeading">{currencyFilter(assets)}</h4>
                  <Asset companyId={props.companyId} canEdit={props.canEdit} />
                </div>
                <div className="data">
                  <p className="title">Assets</p>
                </div>
                <div className="personalAssets">
                  {props.personalAssets.map(asset => (
                    <div className="personalAsset">
                      <p className="dataItem">{asset.description}</p>
                      <p className="dataItem">{currencyFilter(asset.value)}</p>
                      <p>
                        <IconButton
                          accessibilityLabel="Navigation"
                          icon={<Trash />}
                          onClick={() => {
                            handleDelete(asset.id, props.companyId);
                          }}
                        />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
