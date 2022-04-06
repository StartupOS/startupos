import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  Dispatch,
} from 'react';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import { 
  getLoginUser as apiGetLoginUser,
  getCurrentUser as apiGetCurrentUser,
  getLinkedInCredentials as apiGetLinkedInCredentials 
} from './api';

import { UserType } from '../components/types';

interface CurrentUserState {
  currentUser: UserType;
  newUser: string | null;
}
declare global {
  interface Window { blockReq: boolean; }
}
const initialState = {
  currentUser: {},
  newUser: null,
};
type CurrentUserAction =
  | {
      type: 'SUCCESSFUL_GET';
      payload: UserType;
    }
  | { type: 'ADD_USER'; payload: string }
  | { type: 'FAILED_GET' };

interface CurrentUserContextShape extends CurrentUserState {
  dispatch: Dispatch<CurrentUserAction>;
  setNewUser: (username: string) => void;
  userState: CurrentUserState;
  setCurrentUser: (username: string) => void;
  getCurrentUser: ()=>void;
  logout: ()=>void;
  login: (username: string) => void;
}
const CurrentUserContext = createContext<CurrentUserContextShape>(
  initialState as CurrentUserContextShape
);



/**
 * @desc Maintains the currentUser context state and provides functions to update that state
 */
export function CurrentUserProvider(props: any) {
  const [userState, dispatch] = useReducer(reducer, initialState);
  const history = useHistory();

  

  const getCurrentUser = useCallback(async () =>{
    try {
      const token = localStorage.getItem('token');
      if(token){
        const { data: payload } = await apiGetCurrentUser();
        console.log(payload[0]);
        if (payload != null) {
          dispatch({ type: 'SUCCESSFUL_GET', payload: payload[0] });
        } else {
          dispatch({ type: 'FAILED_GET' });
        }
      } else {
        dispatch({ type: 'FAILED_GET' });
      }
    } catch (err) {
      console.log(err);
    }

  },[]);

  /**
   * @desc Requests details for a single User.
   */
  const login = useCallback(
    async user => {
      try {
        const { username } = user;
        if (user != null) {
          localStorage.setItem('token', user.token);
          toast.success(`Successful login.  Welcome back ${user.given_name}`);
          dispatch({ type: 'SUCCESSFUL_GET', payload: user });
          history.push(`/Dashboard`);
        } else {
          toast.error(`Username ${username} is invalid.  Try again. `);
          dispatch({ type: 'FAILED_GET' });
        }
      } catch (err) {
        console.log(err);
      }
    },
    [history]
  );


  const setCurrentUser = useCallback(
    async username => {
      try {
        const { data: payload } = await apiGetLoginUser(username);
        if (payload != null) {
          console.log('setCurrentUser');
          dispatch({ type: 'SUCCESSFUL_GET', payload: payload[0] });
          console.log(payload[0]);
          history.push(`/Dashboard`);
        } else {
          dispatch({ type: 'FAILED_GET' });
        }
      } catch (err) {
        console.log(err);
      }
    },
    [history]
  );

  const logout = useCallback(async ()=>{
    localStorage.removeItem('token');
    dispatch({ type: 'LOG_OUT', payload: null });

  },[]);

  const setNewUser = useCallback(async username => {
    dispatch({ type: 'ADD_USER', payload: username });
  }, []);

  /**
   * @desc Builds a more accessible state shape from the Users data. useMemo will prevent
   * these from being rebuilt on every render unless usersById is updated in the reducer.
   */
  const value = useMemo(() => {
    return {
      userState,
      login,
      logout,
      setCurrentUser,
      getCurrentUser,
      setNewUser
    };
  }, [userState, login, logout, setCurrentUser, getCurrentUser, setNewUser]);

  return <CurrentUserContext.Provider value={value} {...props} />;
}

/**
 * @desc Handles updates to the Users state as dictated by dispatched actions.
 */
function reducer(state: CurrentUserState, action: CurrentUserAction | any) {
  switch (action.type) {
    case 'SUCCESSFUL_GET':
      console.log(action.payload)
      if(action.payload && action.payload.token) localStorage.setItem('token', action.payload.token);
      return {
        currentUser: action.payload,
        newUser: null,
      };
    case 'FAILED_GET':
      return {
        ...state,
        newUser: null,
      };
    case 'ADD_USER':
      return {
        ...state,
        newUser: action.payload,
      };
    case 'LOG_OUT':
      return {
        currentUser:null,
        newUser: null
      }
    default:
      console.warn('unknown action: ', action.type, action.payload);
      return state;
  }
}

/**
 * @desc A convenience hook to provide access to the Users context state in components.
 */
export default function useCurrentUser() {
  const context = useContext(CurrentUserContext);
  const getCodeFromWindowURL = (url:string) => {
    const popupWindowURL = new URL(url);
    const code = popupWindowURL.searchParams.get("code");
    return code;
  };
  
  const getUserCredentials = async (code:string) => {
    const res = await apiGetLinkedInCredentials(code);
    const user = res.data;
    localStorage.setItem('user', JSON.stringify(user));
    context.login(user);
  };
  
  
  const code = getCodeFromWindowURL( window.location.href );
  
  if(code && !window.blockReq){
    window.blockReq = true;
    getUserCredentials(code);
  }
  
  
  if (!context) {
    throw new Error(`useUsers must be used within a UsersProvider`);
  }

  return context;
}
