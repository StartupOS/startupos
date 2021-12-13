import axios from 'axios';
import React, { useEffect } from 'react';
import { useCurrentUser } from '../services';
import { Verb } from '../components/types';
import type { Permission } from '../components/types';

export default async function Permissions(){
    const { userState } = useCurrentUser();
    const { id, permissions } = userState.currentUser;
    const addableFromToken = permissions?.
        filter((p:Permission)=>p.verb==Verb.addPermission || p.verb == '*').
        filter((p:Permission)=>p.subject == id || p.subject == '*');
    const removableFromToken = permissions?.
        filter((p:Permission)=>p.verb==Verb.removePermission || p.verb == '*').
        filter((p:Permission)=>p.subject == id || p.subject == '*');
    const getUrl = 'https://jason.startupos.dev/permissions';
    const databasePermissions = await (await axios.get(getUrl)).data;
    const addableFromDatabase = databasePermissions?.
        filter((p:Permission)=>p.verb==Verb.addPermission || p.verb == '*').
        filter((p:Permission)=>p.subject == id || p.subject == '*');
    const removableFromDatabase = databasePermissions?.
        filter((p:Permission)=>p.verb==Verb.removePermission || p.verb == '*').
        filter((p:Permission)=>p.subject == id || p.subject == '*');

    const addable = addableFromToken?.concat(addableFromDatabase);
    const removable = removableFromToken?.concat(removableFromDatabase);


    
    return(<div>
        <table>
            <tr>
                <td>Subject</td>
                <td>Object</td>
                <td>Verb</td>
                <td>Context</td>
                <td>Edit</td>
                <td>Delete</td>
            </tr>
            databasePermissions.map(PermissionRow)
        </table>
    </div>);
}

function PermissionRow(props:Permission){
    const { subject, object, verb, context } = props
    return (<tr>
        <td>{ subject }</td>
        <td>{ object }</td>
        <td>{ verb }</td>
        <td>{ context }</td>
        <td> edit </td>
        <td> delete </td>
    </tr>);
}