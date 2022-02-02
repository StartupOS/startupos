import React, {
    createContext,
    useContext,
    useMemo,
    useReducer,
    useCallback,
    Dispatch,
  } from 'react';
import { toast } from 'react-toastify';

import { 
    listCompanies as apiListCompanies,
    listFunders as apiListFunders,
    createCompany as apiCreateCompany,
    updateCompany as apiUpdateCompany,
    deleteCompany as apiDeleteCompany,
    grantPermissions as apiGrantPermissions,
    revokePermissions as apiRevokePermissions,
    enableSharing as apiEnableSharing,
    disableSharing as apiDisableSharing,
    canEnableSharing as apiCanEnableSharing,
    whoCanISee,
    whoSeesMe
} from './api';
import { CompanyType, UserType, permission, ExtendedCompanyType } from '../components/types';


interface CompaniesState {
    currentCompany: CompanyType | null;
    companies: CompanyType[];
    funders:CompanyType[];
    canSeeMe:ExtendedCompanyType[];
    ICanSee:ExtendedCompanyType[];
}



const companyFromStorage = localStorage.getItem('selectedCompany');
const companyObjFromStorage = companyFromStorage?JSON.parse(companyFromStorage):null;
const emptyCompanyArr:CompanyType[]=[];
const emptyExtendedCompanyArr:ExtendedCompanyType[]=[];

const initialState = {
    currentCompany : companyObjFromStorage, 
    companies: emptyCompanyArr,
    funders:emptyCompanyArr,
    canSeeMe:emptyExtendedCompanyArr,
    ICanSee:emptyExtendedCompanyArr
};

type SelectedCompany = {
  company: CompanyType;
  canSeeMe: ExtendedCompanyType[];
  ICanSee: ExtendedCompanyType[];
}

type CompaniesAction =
| {
    type: 'SUCCESSFUL_GET_COMPANIES';
    payload: CompanyType[];
    }
| {
  type: 'SUCCESSFUL_GET_FUNDERS';
  payload: CompanyType[];
  }
| { type: 'FAILED_GET'; payload: string }
| { type: 'SELECT_COMPANY'; payload: SelectedCompany | null };

interface CompaniesContextShape extends CompaniesState {
    dispatch: Dispatch<CompaniesAction>;
    listCompanies: ()=>void;
    listFunders: ()=>void;
    getCompany: (companyId: number)=>void;
    createCompany: (company: CompanyType)=>void;
    updateCompany: (company: CompanyType)=>void;
    deleteCompany: (companyId: number)=>void;
    selectCompany: (company: CompanyType | null)=>void;
    grantPermissions: (company: CompanyType, target:UserType, permissions:string[])=>void;
    revokePermissions: (company: CompanyType, target:UserType, permissions:string[])=>void;
    enableSharing: (company: CompanyType)=>void;
    disableSharing: (company: CompanyType)=>void;
    canEnableSharing: (company: CompanyType)=>boolean;
    companiesByUser: CompaniesState;
}
const CompaniesContext = createContext<CompaniesContextShape>(
    initialState as CompaniesContextShape
);

/**
 * @desc Maintains the Properties context state
 */
 export function CompaniesProvider(props: any) {
    const [companiesByUser, dispatch] = useReducer(reducer, initialState);
  
    const listCompanies = useCallback(async () => {
      try {
        const { data: payload } = await apiListCompanies();
        if (payload != null) {
          console.log(payload);
          dispatch({ type: 'SUCCESSFUL_GET_COMPANIES', payload: payload });
        } else {
          dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
        }
      } catch (err) {
        console.log(err);
      }
    }, []);
    
    const listFunders = useCallback(async () => {
      try {
        const { data: payload } = await apiListFunders();
        if (payload != null) {
          console.log(payload);
          dispatch({ type: 'SUCCESSFUL_GET_FUNDERS', payload: payload });
        } else {
          dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
        }
      } catch (err) {
        console.log(err);
      }
    }, []);

    const selectCompany = useCallback(async (company:CompanyType | null)=>{
        console.log('selecting company');
        if(company){
          const canSeeMe = (await whoSeesMe(company.id)).data;
          const ICanSee = (await whoCanISee(company.id)).data;
          dispatch({ type: 'SELECT_COMPANY', 
            payload: { 
              company, 
              canSeeMe, 
              ICanSee 
            }});
        } else {
          dispatch({
            type: 'SELECT_COMPANY', 
            payload:null
          })
        }
    },[]);
  
    const createCompany = useCallback(
      async (company) => {
        try {
          const { data: payload } = await apiCreateCompany(company);
          if (payload != null) {
            toast.success(`Successful addition of ${company.name}`);
            await listCompanies();
          } else {
            toast.error(`Could not add ${company.name}`);
          }
        } catch (err) {
          console.log(err);
        }
      },
      [listCompanies]
    );

    const updateCompany = useCallback(
      async (company) => {
        try {
          const { data: payload } = await apiUpdateCompany(company);
          if (payload != null) {
            toast.success(`Successful modification of ${company.name}`);
            await listCompanies();
          } else {
            toast.error(`Could not add ${company.name}`);
          }
        } catch (err) {
          console.log(err);
        }
      },
      [listCompanies]
    );
    
    const grantPermissions = useCallback(
      async (company, target, permissions) => {
        try {
          const { data: payload } = await apiGrantPermissions(company.id, target, permissions);
          if (payload != null) {
            toast.success(`Successful modification of ${company.name}`);
          } else {
            toast.error(`Could not modify ${company.name}`);
          }
        } catch (err) {
          console.log(err);
        }
      },
      []
    );

    const revokePermissions = useCallback(
      async (company, target, permissions) => {
        try {
          const { data: payload } = await apiRevokePermissions(company.id, target, permissions);
          if (payload != null) {
            toast.success(`Successful modification of ${company.name}`);
          } else {
            toast.error(`Could not modify ${company.name}`);
          }
        } catch (err) {
          console.log(err);
        }
      },
      []
    );

    const enableSharing = useCallback(
      async (company) => {
        try {
          const { data: payload } = await apiEnableSharing(company.id);
          if (payload != null) {
            toast.success(`Successful modification of ${company.name}`);
            await listCompanies();
          } else {
            toast.error(`Could not modify ${company.name}`);
          }
        } catch (err) {
          console.log(err);
        }
      },
      [listCompanies]
    );
    const disableSharing = useCallback(
      async (company) => {
        try {
          const { data: payload } = await apiDisableSharing(company.id);
          if (payload != null) {
            toast.success(`Successful modification of ${company.name}`);
            await listCompanies();
          } else {
            toast.error(`Could not modify ${company.name}`);
          }
        } catch (err) {
          console.log(err);
        }
      },
      [listCompanies]
    );
    const canEnableSharing = useCallback(
      async (company) => {
        try {
          const { data } = await apiCanEnableSharing(company.id);
          return data.canShare;
        } catch (err) {
          console.log(err);
        }
      },
      [listCompanies]
    );
    
  
    const deleteCompany = useCallback(
      async (companyId) => {
        try {
          await apiDeleteCompany(companyId);
          await listCompanies();
        } catch (err) {
          console.log(err);
        }
      },
      [listCompanies]
    );

    const value = useMemo(() => {
      return {
        listCompanies,
        createCompany,
        deleteCompany,
        updateCompany,
        selectCompany,
        enableSharing,
        disableSharing,
        grantPermissions,
        revokePermissions,
        canEnableSharing,
        listFunders,
        companiesByUser
      };
    }, [
      listCompanies, 
      createCompany, 
      deleteCompany, 
      updateCompany, 
      selectCompany,
      enableSharing,
      disableSharing,
      grantPermissions,
      revokePermissions, 
      canEnableSharing,
      listFunders,
      companiesByUser
    ]);
  
    return <CompaniesContext.Provider value={value} {...props} />;
  }
  
    /**
     * @desc Handles updates to the propertiesByUser as dictated by dispatched actions.
     */
    function reducer(state: CompaniesState, action: CompaniesAction) {
        const newState = {...state};
        switch (action.type) {
            case 'SELECT_COMPANY':
                if(action.payload) {
                  newState.currentCompany=action.payload.company
                  newState.ICanSee=action.payload.ICanSee;
                  newState.canSeeMe=action.payload.canSeeMe;
                  localStorage.setItem('selectedCompany', JSON.stringify(action.payload));
                } else 
                  newState.currentCompany=null
                  newState.ICanSee=emptyExtendedCompanyArr;
                  newState.canSeeMe=emptyExtendedCompanyArr;
                  localStorage.removeItem('selectedCompany');
                return newState;
            case 'SUCCESSFUL_GET_COMPANIES':
                newState.companies=action.payload;
                return newState;
            case 'SUCCESSFUL_GET_FUNDERS':
                  newState.funders=action.payload;
                  return newState;
            case 'FAILED_GET':
                return newState;
            default:
                return state;
        }
    }
  
  /**
   * @desc A convenience hook to provide access to the Properties context state in components.
   */
  export default function useCompanies() {
    const context = useContext(CompaniesContext);
  
    if (!context) {
      throw new Error(`useCompaniess must be used within a CompaniessProvider`);
    }
  
    return context;
  }
