import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useCallback,
  Dispatch,
} from 'react';
import { toast } from 'react-toastify';
import { addAsset as apiAddAsset } from './api';
import { getAssetsByCompany as apiGetAssetsByCompany } from './api';
import { deleteAssetByAssetId as apiDeleteAssetByAssetId } from './api';
import { AssetType } from '../components/types';

interface AssetsState {
  assets: AssetType[] | null;
}

const initialState = { assets: null };

type AssetsAction =
  | {
      type: 'SUCCESSFUL_GET';
      payload: string;
    }
  | { type: 'FAILED_GET'; payload: number };

interface AssetsContextShape extends AssetsState {
  dispatch: Dispatch<AssetsAction>;
  addAsset: (companyId: number, description: string, value: number) => void;
  assetsByCompany: AssetsState;
  getAssetsByCompany: (companyId: number) => void;
  deleteAssetByAssetId: (assetId: number, companyId: number) => void;
}
const AssetsContext = createContext<AssetsContextShape>(
  initialState as AssetsContextShape
);

/**
 * @desc Maintains the Properties context state
 */
export function AssetsProvider(props: any) {
  const [assetsByCompany, dispatch] = useReducer(reducer, initialState);

  const getAssetsByCompany = useCallback(async (companyId: number) => {
    try {
      const { data: payload } = await apiGetAssetsByCompany(companyId);
      if (payload != null) {
        dispatch({ type: 'SUCCESSFUL_GET', payload: payload });
      } else {
        dispatch({ type: 'FAILED_GET' });
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const addAsset = useCallback(
    async (companyId, description, value, refresh) => {
      try {
        const { data: payload } = await apiAddAsset(companyId, description, value);
        if (payload != null) {
          toast.success(`Successful addition of ${description}`);
          await getAssetsByCompany(companyId);
        } else {
          toast.error(`Could not add ${description}`);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [getAssetsByCompany]
  );

  const deleteAssetByAssetId = useCallback(
    async (assetId, companyId) => {
      try {
        await apiDeleteAssetByAssetId(assetId);
        await getAssetsByCompany(companyId);
      } catch (err) {
        console.log(err);
      }
    },
    [getAssetsByCompany]
  );
  const value = useMemo(() => {
    return {
      assetsByCompany,
      addAsset,
      getAssetsByCompany,
      deleteAssetByAssetId,
    };
  }, [assetsByCompany, addAsset, getAssetsByCompany, deleteAssetByAssetId]);

  return <AssetsContext.Provider value={value} {...props} />;
}

/**
 * @desc Handles updates to the propertiesByUser as dictated by dispatched actions.
 */
function reducer(state: AssetsState, action: AssetsAction | any) {
  switch (action.type) {
    case 'SUCCESSFUL_GET':
      return {
        assets: action.payload,
      };
    case 'FAILED_GET':
      return {
        ...state,
      };
    default:
      console.warn('unknown action: ', action.type, action.payload);
      return state;
  }
}

/**
 * @desc A convenience hook to provide access to the Properties context state in components.
 */
export default function useAssets() {
  const context = useContext(AssetsContext);

  if (!context) {
    throw new Error(`useAssets must be used within a AssetsProvider`);
  }

  return context;
}
