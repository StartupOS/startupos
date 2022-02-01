import { ProcessorStripeBankAccountTokenCreateResponse } from 'plaid';
import { number } from 'prop-types';
import {
    useCallback,
    useContext,
    useMemo,
    useReducer,
    Dispatch,
    createContext,
  } from 'react';
  
import { 
    getMergeLinkToken as apiGetMergeLinkToken, 
    exchangeMergePublicToken as apiExchangeMergePublicToken,
    hasMergeAccountToken as apiHasMergeAccountToken 
} from './api';
  


interface MergeLinkToken {
    [key: string]: string;
}

interface MergeLinkState {
    byCompany: MergeLinkToken;
    hasAccountToken: boolean;
}

const initialState = {
    byCompany: {}, // normal case
    hasAccountToken: false
};

type MergeLinkAction =
| {
    type: 'MERGE_LINK_TOKEN_CREATED';
    id: number;
    token: string;
    }
| { type: 'MERGE_LINK_TOKEN_ERROR'; error: any }
| { type: 'MERGE_ACCOUNT_TOKEN_CREATED'; id: number }
| { type: 'MERGE_HAS_ACCOUNT_TOKEN'; companyId: number, hasToken:boolean };

interface MergeLinkContextShape extends MergeLinkState {
    dispatch: Dispatch<MergeLinkAction>;
    generateLinkToken: (companyId: number) => void;
    checkForAccountToken: (companyId:number)=>void;
    exchangePublicToken:(companyId: number, publicToken: string) => void;
    linkTokens: MergeLinkState;
}

const MergeLinkContext = createContext<MergeLinkContextShape>(
    initialState as MergeLinkContextShape,
);

/**
 * @desc Maintains the Link context state and fetches link tokens to update that state.
 */
export function MergeLinkProvider(props: any) {
    const [linkTokens, dispatch] = useReducer(reducer, initialState);

    /**
     * @desc Creates a new link token for a given Company.
     */

    const generateLinkToken = useCallback(async (companyId:number) => {
        console.log('Generating Link Token');
        console.log('CompanyID:', companyId);
        const linkTokenResponse = await apiGetMergeLinkToken(companyId);
        if (linkTokenResponse.data.link_token) {
            const token = await linkTokenResponse.data.link_token;
            dispatch({ type: 'MERGE_LINK_TOKEN_CREATED', id: +companyId, token });
        } else {
            dispatch({ type: 'MERGE_LINK_TOKEN_ERROR', error: linkTokenResponse.data });
            console.log('error', linkTokenResponse.data);
        }
    }, []);

    const exchangePublicToken = useCallback(async (companyId:number, publicToken:string)=>{
        const AccountToken = await apiExchangeMergePublicToken(companyId, publicToken);
        dispatch({type:'MERGE_ACCOUNT_TOKEN_CREATED', id:companyId})
    },[])

    const checkForAccountToken = useCallback(async (companyId:number)=>{
        const { data } = await apiHasMergeAccountToken(companyId);
        const { hasToken } = data;
        dispatch({type:'MERGE_HAS_ACCOUNT_TOKEN', hasToken, companyId})
    },[]);

    const value = useMemo(
        () => ({
            generateLinkToken,
            exchangePublicToken,
            checkForAccountToken,
            linkTokens,
        }),
        [linkTokens, generateLinkToken, exchangePublicToken, checkForAccountToken]
    );

    return <MergeLinkContext.Provider value={value} {...props} />;
}

/**
 * @desc Handles updates to the LinkTokens state as dictated by dispatched actions.
 */
function reducer(state: any, action: MergeLinkAction) {
    switch (action.type) {
        case 'MERGE_LINK_TOKEN_CREATED':
        return {
            ...state,
            byCompany: {
                [action.id]: action.token,
            },
            error: {},
        };
        case 'MERGE_LINK_TOKEN_ERROR':
        return {
            ...state,
            error: action.error,
        };
        case 'MERGE_ACCOUNT_TOKEN_CREATED':
        return {
            ...state,
            hasAccountToken: true
        };
        case 'MERGE_HAS_ACCOUNT_TOKEN':
        return {
            ...state,
            hasAccountToken: action.hasToken
        };
        default:
            console.warn('unknown action');
            return state;
    }
}

/**
 * @desc A convenience hook to provide access to the Link context state in components.
 */
export default function useMergeLink() {
    const context = useContext(MergeLinkContext);
    if (!context) {
        throw new Error(`useLink must be used within a LinkProvider`);
    }

    return context;
}
