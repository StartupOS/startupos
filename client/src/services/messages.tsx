import {
    createContext,
    useContext,
    useMemo,
    useReducer,
    useCallback,
    Dispatch,
  } from 'react';
import { toast } from 'react-toastify';

import { 
    listMessages as apiListMessages,
    createMessage as apiCreateMessage,
    retrieveMessage as apiRetrieveMessage,
    updateMessage as apiUpdateMessage,
    deleteMessage as apiDeleteMessage,
    archiveMessage as apiArchiveMessage,
    unarchiveMessage as apiUnarchiveMessage,
    markMessageRead as apiMarkMessageRead,
    markMessageUnread as apiMarkMessageUnread,
    acceptMessage as apiAcceptMessage
} from './api';
import { MessageType, ExpandedMessageType } from '../components/types';

interface MessagesState {
    selectedMessage: ExpandedMessageType | null;
    messages: ExpandedMessageType[];
}

const a:ExpandedMessageType[]=[];

const initialState = {
    selectedMessage : null, 
    messages: a,
};

type MessagesAction =
| {
    type: 'SUCCESSFUL_GET_MESSAGES';
    payload: ExpandedMessageType[];
    }
| {
    type: 'SUCCESSFUL_GET_MESSAGE';
    payload: ExpandedMessageType;
    }
| {
  type: 'SUCCESSFUL_UPDATE_MESSAGE';
  payload: ExpandedMessageType;
  }
| { type: 'FAILED_GET'; payload: string }
| { type: 'SELECT_MESSAGE'; payload: ExpandedMessageType | null };

interface MessagesContextShape extends MessagesState {
    dispatch: Dispatch<MessagesAction>;
    getMessages: ()=>void;
    selectMessage: ()=>void;
    createMessage: (message:MessageType)=>void;
    retrieveMessage: (messageId:number)=>void;
    updateMessage: (message:MessageType)=>void;
    deleteMessage: (messageId:number)=>void;
    markMessageRead: (messageId: number)=>void;
    markMessageUnread: (messageId: number)=>void;
    archiveMessage: (messageId: number)=>void;
    unarchiveMessage: (messageId: number)=>void;
    acceptMessage: (messageId: number)=>void;
    messageState: MessagesState;
}
const MessagesContext = createContext<MessagesContextShape>(
    initialState as MessagesContextShape
);

/**
 * @desc Maintains the Properties context state
 */
 export function MessagesProvider(props: any) {
    const [messageState, dispatch] = useReducer(reducer, initialState);
  
    const getMessages = useCallback(async () => {
      try {
        const { data: payload } = await apiListMessages();
        if (payload != null) {
          console.log(payload);
          dispatch({ type: 'SUCCESSFUL_GET_MESSAGES', payload: payload });
        } else {
          dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
        }
      } catch (err) {
        console.log(err);
      }
    }, []);
    const retrieveMessage = useCallback(async (messageId:number)=>{
        try {
            const { data: payload } = await apiRetrieveMessage(messageId);
            if (payload != null) {
              console.log(payload);
              dispatch({ type: 'SUCCESSFUL_GET_MESSAGE', payload: payload });
            } else {
              dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
            }
          } catch (err) {
            console.log(err);
          } 
    },[]);

    const selectMessage = useCallback(async (message:ExpandedMessageType | null)=>{
        dispatch({ type: 'SELECT_MESSAGE', payload: message });
    },[]);
  
    const createMessage = useCallback(
      async (message:MessageType) => {
        try {
          const { data: payload } = await apiCreateMessage(message);
          if (payload != null) {
            toast.success(`Message Sent`);
            await getMessages();
          } else {
            toast.error(`Could not send message`);
          }
        } catch (err) {
          console.log(err);
        }
      },
      [retrieveMessage]
    );

    const markMessageRead = useCallback(async (messageId:number)=>{
        try {
            const { data: payload } = await apiMarkMessageRead(messageId);
            if (payload != null) {
                retrieveMessage(messageId)
            } else {
                dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
            }
        } catch (err) {
            console.log(err);
        } 
    },[retrieveMessage]);

    const markMessageUnread = useCallback(async (messageId:number)=>{
        try {
            const { data: payload } = await apiMarkMessageUnread(messageId);
            if (payload != null) {
                retrieveMessage(messageId)
            } else {
                dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
            }
        } catch (err) {
            console.log(err);
        } 
    },[retrieveMessage]);

    const archiveMessage = useCallback(async (messageId:number)=>{
        try {
            const { data: payload } = await apiArchiveMessage(messageId);
            if (payload != null) {
                retrieveMessage(messageId)
            } else {
                dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
            }
        } catch (err) {
            console.log(err);
        } 
    },[retrieveMessage]);

    const unarchiveMessage = useCallback(async (messageId:number)=>{
        try {
            const { data: payload } = await apiUnarchiveMessage(messageId);
            if (payload != null) {
                retrieveMessage(messageId)
            } else {
                dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
            }
        } catch (err) {
            console.log(err);
        } 
    },[retrieveMessage]);

    const acceptMessage = useCallback(async (messageId:number)=>{
        try {
            const { data: payload } = await apiAcceptMessage(messageId);
            if (payload != null) {
                retrieveMessage(messageId)
            } else {
                dispatch({ type: 'FAILED_GET', payload:"It's Borked, Jim" });
            }
        } catch (err) {
            console.log(err);
        } 
    },[retrieveMessage])

    const updateMessage = useCallback(
      async (message:MessageType) => {
        try {
          const { data: payload } = await apiUpdateMessage(message);
          if (payload != null) {
            toast.success(`Message Updated`);
            await getMessages();
          } else {
            toast.error(`Could not update message`);
          }
        } catch (err) {
          console.log(err);
        }
      },
      [getMessages]
    );
    
    const deleteMessage = useCallback(
      async (messageId) => {
        try {
          await apiDeleteMessage(messageId);
          await getMessages();
        } catch (err) {
          console.log(err);
        }
      },
      [getMessages]
    );

    const value = useMemo(() => {
      return {
        getMessages,
        createMessage,
        deleteMessage,
        updateMessage,
        selectMessage,
        retrieveMessage,
        markMessageRead,
        markMessageUnread,
        archiveMessage,
        unarchiveMessage,
        acceptMessage,
        messageState
      };
    }, [
      getMessages, 
      createMessage, 
      deleteMessage, 
      updateMessage, 
      selectMessage,
      retrieveMessage,
      markMessageRead,
      markMessageUnread,
      archiveMessage,
      unarchiveMessage,
      acceptMessage,
      messageState
    ]);
  
    return <MessagesContext.Provider value={value} {...props} />;
  }
  
    /**
     * @desc Handles updates to the propertiesByUser as dictated by dispatched actions.
     */
    function reducer(state: MessagesState, action: MessagesAction):MessagesState {
        const newState = {...state};
        switch (action.type) {
            case 'SELECT_MESSAGE':
                newState.selectedMessage=action.payload;
                return newState;
            case 'SUCCESSFUL_GET_MESSAGES':
                newState.messages=action.payload;
                return newState;
            case 'SUCCESSFUL_GET_MESSAGE':
                newState.messages.push(action.payload);
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
    const context = useContext(MessagesContext);
  
    if (!context) {
      throw new Error(`useMessages must be used within a CompaniessProvider`);
    }
  
    return context;
  }
