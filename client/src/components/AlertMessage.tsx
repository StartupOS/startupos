import React from 'react';
import { Link } from "react-router-dom";

import { ExpandedMessageType } from './types'
import { useBoolean } from '../hooks'
import { DateTime } from 'luxon';
import { formatDistanceToNow, parseISO } from 'date-fns';


interface Props {
    message:ExpandedMessageType
}

export default function AlertMessage(props:Props){
    const { message } = props;
    const [ expanded, collapse, flip ] = useBoolean(false);
    const to='You',
          from='Me',
          subject=message.pending_permission?
            (<Link to="/Sharing">Sharing Request</Link>):
            'Message',
          body=message.message_body,
          permissions=message.pending_permission || [],
          date=message.updated_at || message.created_at,
          dt = DateTime.fromISO(date);
    // const expanded=false;
    console.log(dt);
    console.log(date);
    let p2 = new Date();
    p2.setSeconds(p2.getSeconds()-10);

    const p = date ? parseISO(date) : p2;
    console.log(p);
    const q = p || p2;
    console.log(q)
    const s = formatDistanceToNow(q);
    function swap(){
        console.log('swap');
        flip();
    }
    return (
        <div className='AlertMessage'>
            <div 
                className='Min' 
                style={{display:expanded?'None':'block'}}
                onClick={swap}
            >
                <div className='Subject'>{subject}</div>
                <div className='Date'>{ s } ago</div>
            </div>
            <div 
                className='Max' 
                style={{display:expanded?'block':'none'}}
                onClick={swap}
            >
                <div className='From'>{from}</div>
                <div className='To'>{to}</div>
                <div className='Date'>{date}</div>
                <div className='Subject'>{subject}</div>
                <div className='Body'>{body}</div>
            </div>
        </div>
    )
}