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
    createCompany as apiCreateCompany,
    updateCompany as apiUpdateCompany,
    deleteCompany as apiDeleteCompany,
} from './api';
import { CompanyType } from '../components/types';

interface CompaniesState {
    currentCompany: CompanyType | null;
    companies: CompanyType[] | null;
}
  
const initialState = {
    currentCompany : null, 
    companies: null
};

type CompaniesAction =
| {
    type: 'SUCCESSFUL_GET';
    payload: string;
    }
| { type: 'FAILED_GET'; payload: number }
| { type: 'SELECT_COMPANY'; payload: CompanyType };

interface CompaniesContextShape extends CompaniesState {
    dispatch: Dispatch<CompaniesAction>;
    listCompanies: ()=>void;
    getCompany: (companyId: number)=>void;
    createCompany: (company: CompanyType)=>void;
    updateCompany: (company: CompanyType)=>void;
    deleteCompany: (companyId: number)=>void;
    selectCompany: (company: CompanyType | null)=>void;
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
          dispatch({ type: 'SUCCESSFUL_GET', payload: payload });
        } else {
          dispatch({ type: 'FAILED_GET' });
        }
      } catch (err) {
        console.log(err);
      }
    }, []);

    const selectCompany = useCallback(async (company:CompanyType | null)=>{
        console.log('selecting company');
        dispatch({ type: 'SELECT_COMPANY', payload: company });
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
        companiesByUser
      };
    }, [listCompanies, createCompany, deleteCompany, updateCompany, selectCompany, companiesByUser]);
  
    return <CompaniesContext.Provider value={value} {...props} />;
  }
  
    /**
     * @desc Handles updates to the propertiesByUser as dictated by dispatched actions.
     */
    function reducer(state: CompaniesState, action: CompaniesAction | any) {
        const newState = {...state};
        switch (action.type) {
            case 'SELECT_COMPANY':
                console.log('selected');
                console.log(action.payload);
                newState.currentCompany=action.payload;
                return newState;
            case 'SUCCESSFUL_GET':
                newState.companies=action.payload;
                return newState;
            case 'FAILED_GET':
                return newState;
            default:
                console.warn('unknown action: ', action.type, action.payload);
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
