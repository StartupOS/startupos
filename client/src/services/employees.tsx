import React, {
    createContext,
    useContext,
    useMemo,
    useReducer,
    useCallback,
    Dispatch,
    ReactNode,
  } from 'react';
  import groupBy from 'lodash/groupBy';
  import keyBy from 'lodash/keyBy';
  import omitBy from 'lodash/omitBy';
  import { EmployeeType } from '../components/types';
  
  import {
    updateEmployees as apiUpdateEmployees,
    listEmployees as apiListEmployees,
    retrieveEmployee as apiRetrieveEmployee
  } from './api';
  
  interface EmployeesState {
    [companyId: number] :{
      [employeeId: number]: EmployeeType;
    }
  }
  
  const initialState: EmployeesState = {};
  type EmployeesAction =
    | {
        type: 'SUCCESSFUL_GET';
        payload: {
          companyId: number;
          employees: EmployeeType[];
        }
      }
    | {
        type: 'SUCCESSFUL_UPDATE';
        payload: {
          companyId: number;
          employees: EmployeeType[];
        }
      }
    | { type: 'DELETE_BY_ID'; payload: number }
    | { type: 'UNDELETE_BY_ID'; payload: number }
  
  interface EmployeesContextShape extends EmployeesState {
    dispatch: Dispatch<EmployeesAction>;
    getEmployeesByCompany: (companyId:number)=>void;
    getEmployeesById: (companyId:number, employeeId:number)=>void;
    updateEmployees: (companyId: number)=>void;
    employeesByCompany: EmployeesState;
    // deleteEmployee: (employeeId:number)=>void
    // unDeleteAccountById: (employeeId:number)=>void;
  }
  const EmployeesContext = createContext<EmployeesContextShape>(
    initialState as EmployeesContextShape
  );
  
  /**
   * @desc Maintains the Employees context state and provides functions to update that state.
   */
  export const EmployeesProvider: React.FC<{ children: ReactNode }> = (
    props: any
  ) => {
    const [employeesByCompany, dispatch] = useReducer(reducer, initialState);
  
    /* Need: 
        Update Employees
        List Employees
        Get Employee
        Delete Employee
        Undelete Employee
    */
    /**
     * @desc Update data from HRIS that belong to an individual Item.
     */
    const updateEmployees = useCallback(async companyId => {
      const { data: employees } = await apiUpdateEmployees(companyId);
      dispatch({ type: 'SUCCESSFUL_UPDATE', payload: { companyId, employees }});
    }, []);
  
    // const deleteEmployee = useCallback(async employeeId=>{
    //   const {data:payload} = await apiDeleteEmployee(accountId);
    //   const id:number = payload[0].id;
    //   dispatch({type: 'DELETE_BY_ID', payload:id});
    // },[])
  
    // const unDeleteAccountById = useCallback(async employeeId=>{
    //   const {data:payload} = await apiUnDeleteEmployee(employeeId);
    //   const id:number = payload[0].id;
    //   dispatch({type: 'UNDELETE_BY_ID', payload:id});
    // },[])
  
    /**
     * @desc Requests all Employees that belong to an individual Company.
     * from internal database.
     */
    const getEmployeesByCompany = useCallback(async companyId => {
      const { data: employees } = await apiListEmployees(companyId);
      dispatch({ type: 'SUCCESSFUL_GET', payload: { companyId, employees } });
    }, []);
  
    /**
     * @desc Requests all information about an individual Employee.
     */
     const getEmployeeById = useCallback(async (companyId, employeeId) => {
      const { data: employees } = await apiRetrieveEmployee(companyId, employeeId);
      dispatch({ type: 'SUCCESSFUL_UPDATE',  payload: { companyId, employees }  });
    }, []);
  
    
  
    /**
     * @desc Builds a more accessible state shape from the Accounts data. useMemo will prevent
     * these from being rebuilt on every render unless accountsById is updated in the reducer.
     */
    const value = useMemo(() => {
  
      return {
        employeesByCompany,
        updateEmployees,
        getEmployeesByCompany,
        getEmployeeById,
        // deleteAccountById,
        // unDeleteAccountById
      };
    }, [
      employeesByCompany,
      updateEmployees,
      getEmployeesByCompany,
      getEmployeeById,
    ]);
  
    return <EmployeesContext.Provider value={value} {...props} />;
  };
  
  /**
   * @desc Handles updates to the Accounts state as dictated by dispatched actions.
   */
  function reducer(state: EmployeesState, action: EmployeesAction) {
    switch (action.type) {
      case 'SUCCESSFUL_GET':
        console.log('Successful Get');
        console.log(action.payload);
        const newGetState= {
          ...state
        };
        const activeEmployees = action.payload.employees.filter((employee:EmployeeType) => !employee.deleted)
        newGetState[action.payload.companyId] = keyBy(activeEmployees, "id")
        console.log('New Get State:')
        console.log(newGetState);
        return newGetState
      case 'SUCCESSFUL_UPDATE':
          console.log(action.payload);
          if (!action.payload.employees.length) {
            return state;
          }
          const newUpdateState= {
            ...state,
          };
          const activeEmployeesFromUpdate = action.payload.employees.filter((employee:EmployeeType) => !employee.deleted)
          newUpdateState[action.payload.companyId] = keyBy(activeEmployeesFromUpdate, "id")
          console.log(newUpdateState);
          return newUpdateState
      // case 'DELETE_BY_ID':
      //   console.log(action.payload)
      //   console.log(state);
      //   const newState = {...state};
      //   if(newState[action.payload])
      //     newState[action.payload].deleted=true;  
      //   return omitBy(
      //     newState,
      //     employee => employee.deleted
      //   );
      // case 'UNDELETE_BY_ID':
      //   const unDeleteState = {...state};
      //   if(unDeleteState[action.payload])
      //     unDeleteState[action.payload].deleted=false;  
      //   return omitBy(
      //     unDeleteState,
      //     employee => employee.deleted
      //   );
      default:
        console.warn('unknown action');
        return state;
    }
  }
  
  /**
   * @desc A convenience hook to provide access to the Accounts context state in components.
   */
  export default function useEmployees() {
    const context = useContext(EmployeesContext);
  
    if (!context) {
      throw new Error(`useEmployees must be used within an AccountsProvider`);
    }
  
    return context;
  }
  