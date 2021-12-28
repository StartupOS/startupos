import React, { useEffect, useState } from 'react';
// import Button from '@mui/material/Button';
import { DataGrid, GridRowsProp, GridColDef, GridSelectionModel, GridCallbackDetails } from '@mui/x-data-grid';

import { useCompanies, useCurrentUser, useUsers } from '../services';
import { UserType, CompanyType } from './types';
import { Button } from '@mui/material';


export default function SharingPage(){
    const { allUsers, getUsers, usersById } = useUsers();
    const [users, setUsers] = useState<UserType[]>([]);

    useEffect(() => {
        getUsers(true);
    }, [getUsers]);

    useEffect(() => {
        setUsers(allUsers);
    }, [allUsers, usersById]);
    const { userState, getCurrentUser } = useCurrentUser();
    const { companiesByUser, listCompanies, updateCompany} = useCompanies();
    const [companies, setCompanies] = useState<CompanyType[]>([]);
    const [selected, setSelected] = useState<CompanyType | null>(null);
    const [currentUser, setUser] = useState<UserType | null>(null);

    useEffect(() => {
        getCurrentUser();
    }, [getCurrentUser]);

    useEffect(()=>{
        if(userState.currentUser){
            setUser(userState.currentUser);
        }
    },[userState, getCurrentUser])

    useEffect(()=>{
        listCompanies();
    },[listCompanies, getCurrentUser]);

    useEffect(()=>{
        if(companiesByUser?.companies)
            setCompanies(companiesByUser.companies);
        
        setSelected(companiesByUser.currentCompany);
    }, [companiesByUser, listCompanies, getCurrentUser])
    console.log(users);
    const rowData = users
        .filter((user)=>user.id!=currentUser?.id)
        .map((user, index)=>{ 
            return {
                ...user, 
                id:index+1
            }
    });
    const rows:GridRowsProp=rowData;
    console.log(rows);
    const cols:GridColDef[]=[
        {
            field: 'given_name',
            headerName: 'First Name',
            width:150
        },
        {
            field: 'family_name',
            headerName: 'Last Name',
            width:150
        },
        {
            field: 'username',
            headerName: 'Email',
            width:250
        }
    ];
    
    const [selectedUsers, setSelectedUsers] = useState<(UserType|null)[]>([])
    function selectionChanged(selectionModel:GridSelectionModel, details:GridCallbackDetails){
        const ids=selectionModel.map(selection=>+selection);
        const rows = rowData
            .filter((user)=>ids.includes(user.id));
        const selectedUsers = rows.map((row)=>{
            const user = users.find((u)=>u.username==row.username);
            if(user)
                return user;
            else return null;
        }).filter(u=>u);

        setSelectedUsers(selectedUsers);
    }
    function modifyCompany(){
        if(selected){
            console.log(selected);
            const modifiedCo = {...selected};
            const selectedIds:Number[] = [];
            selectedUsers.forEach(u=>{if(u && u.id) selectedIds.push(u.id)});
            modifiedCo.shared = selectedIds;
            console.log(modifiedCo);
            updateCompany(modifiedCo);
        }
    }
    return (
        <>
        {selected && (
            <div style={{height:"80vh"}}>
                This is the Sharing Page
                Please choose users to share {selected?.name} with
                <DataGrid 
                    rows={rows} 
                    columns={cols} 
                    checkboxSelection={true}
                    onSelectionModelChange={selectionChanged}
                />
            </div>
        )}
        {selectedUsers && (
            <Button size="large" variant="contained" onClick={modifyCompany}>
                Share With Users
            </Button>
        )}
        </>
    )
}