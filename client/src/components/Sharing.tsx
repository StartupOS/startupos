import React, { useEffect, useState } from 'react';
// import Button from '@mui/material/Button';
import { DataGrid, GridRowsProp, GridColDef, GridSelectionModel, GridCallbackDetails } from '@mui/x-data-grid';
import { blue, red } from '@mui/material/colors';

import { 
    useCompanies, 
    useCurrentUser, 
    useUsers, 
    useMessages 
} from '../services';
import { 
    UserType,
    ExtendedCompanyType, 
    CompanyType, 
    MessageType,
    ExpandedMessageType,
    permission
} from './types';
import { Button, Switch, FormControlLabel, FormGroup, Select, MenuItem } from '@mui/material';
import DomainDisabledIcon from '@mui/icons-material/DomainDisabled';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { createMessage } from '../services/api';

type orgPermissionType = {
    subject:number;
    object:number;
    permission: permission
        
}
enum permissionEnum{
    viewBalance='viewBalance',
    viewTransactions='viewTransactions',
    viewEmployees='viewEmployees',
    viewEmployeeDetails='viewEmployeeDetails',
    viewInsurance='viewInsurance',
}


interface PermissionsToAdd {
    [o:number]:{
        [p in permissionEnum]:boolean
    }
}

// interface PermissionsArray[{[key:permission]:boolean}]

export default function SharingPage(){
    const { userState, getCurrentUser } = useCurrentUser();

    const { 
        messageState,
        selectMessage, 
        getMessages, 
        markMessageRead, 
        markMessageUnread, 
        archiveMessage, 
        unarchiveMessage,
        acceptMessage
    } = useMessages();
    const [ messages, setMessages] = useState<ExpandedMessageType[]>([]);
    const [ filteredMessages, setFilteredMessages] = useState<ExpandedMessageType[]>([]);
    const [ selectedMessage, setSelectedMessage] = useState<ExpandedMessageType|null>(null);
    const [ showArchived, setShowArchived ] = useState(false);

    const [ permissionsToAdd, setPermissionsToAdd] = useState<PermissionsToAdd>({});

    const {
        companiesByUser, 
        listCompanies, 
        updateCompany,
        canEnableSharing,
        enableSharing,
        disableSharing,
        listFunders,
    } = useCompanies();
    const [ selected, setSelected] = useState<CompanyType | null>(null);
    const [ companies, setCompanies] = useState<CompanyType[]>([]);
    const [ funders, setFunders ] = useState<CompanyType[]>([]);

    useEffect(() => {
        getCurrentUser();
        listFunders();
        listCompanies();
        getMessages();
    }, [getCurrentUser, listFunders, listCompanies, getMessages]);

    useEffect(()=>{
        if(messageState.selectedMessage){
            setSelectedMessage(messageState.selectedMessage)
        }
        setMessages(messageState.messages)
    },[messageState])

    useEffect(()=>{
        const c = companiesByUser
        if(c){
            if(c.companies){
                setCompanies(c.companies);
            }
            if(c.funders){
                setFunders(c.funders);
            }
            if(c.currentCompany){
                setSelected(c.currentCompany);
            }
        }
    },[companiesByUser])

    const rowData = funders
        // .filter((funder)=>funder.id !== selected?.id)
        .map((funder)=>{ 
            return {
                ...funder
            }
    });
    const rows:GridRowsProp=rowData;
    const cols:GridColDef[]=[
        {
            field: 'logo',
            headerName: 'Logo',
            width:100,
            renderCell: (params) => {
                if(params.value) 
                    return (<img src={params.value} style={{height:"2em"}}/>)
                else
                    return (<DomainDisabledIcon sx={{ fontSize: "2em" }} />)
            }
        },
        {
            field: 'name',
            headerName: 'Name',
            width:300
        },
        {
            field: 'city',
            headerName: 'City',
            width:250
        },
        {
            field: 'state',
            headerName: 'State',
            width:100
        },
    ];
    
    const [selectedFunders, setSelectedFunders] = useState<(CompanyType|null)[]>([])
    function selectionChanged(selectionModel:GridSelectionModel, details:GridCallbackDetails){
        const ids=selectionModel.map(selection=>+selection);
        const rows = rowData
            .filter((user)=>ids.includes(user.id));
        const s = rows.map((row)=>{
            const company = funders.find((u)=>u.id===row.id);
            if(company)
                return company;
            else return null;
        }).filter(u=>u);

        setSelectedFunders(s);
    }

    function modifyCompany(){
        const currentUser = userState.currentUser;
        if(selected && currentUser){
            console.log(selected);
            const selectedIds:number[] = [];
            selectedFunders.forEach(u=>{if(u && u.id) selectedIds.push(u.id)});
            selectedIds.forEach((recipient)=>{
                const keys = Object.keys(permissionsToAdd[recipient]);
                const keysToAdd = keys.filter(key=>permissionsToAdd[recipient]);
                const message:MessageType={
                    pending_permission:keysToAdd.join(','),
                    receiver_org:recipient,
                    sender_user:currentUser.id,
                    sender_org:selected.id
                }
                createMessage(message);
            });
        }
    }

    async function onChange(e:any){
        const checked = await e.target.checked;
        if(selected)
            checked?enableSharing(selected):disableSharing(selected)
    }

    function modifyPermission(subject:number, permission:permission, value:boolean){
        const p = {...permissionsToAdd};
        p[subject] = p[subject] || {};
        p[subject][permission] = value;
        console.log(p);
        setPermissionsToAdd(p);
    }

    function approveMessageClick(m:ExpandedMessageType){
        console.log('Approve')
        console.log(m);
        // acceptMessage(m.id);
    }
    function rejectMessageClick(m:ExpandedMessageType){
        console.log('Archive')
        console.log(m);
        // archiveMessage(m.id);
    }

    console.log(messages);
    function shouldShow(message:ExpandedMessageType){
        let shouldShow = true;
        const matchesSelectedCompany = !!message.receiver_org && message.receiver_org == selected?.id;
        if(!showArchived){
          shouldShow = shouldShow && !message.archived && !message.approved
        }
        shouldShow = shouldShow && !!message.pending_permission && matchesSelectedCompany && !!selected.is_funder
        return shouldShow;
    };

    interface OrgCardProps{
        logo?: string;
        name?: string;
        city?: string;
        state?: string;
        description?: string;
    }
    interface UserCardProps{
        picture?: string;
        given_name?: string;
        family_name?: string;
    }
    function OrgCard(props:OrgCardProps){
        return (
            <div className="OrgCard" title={props.description}>
                {props.logo? 
                    <img className="logo" src={props.logo} /> :
                    <DomainDisabledIcon sx={{ fontSize: "3em" }}/>
                }
                <div className="name">{props.name}</div>
                <div className="location">{props.city}, {props.state}</div>
            </div>
        )
    }
    function UserCard(props:UserCardProps){
        return (
            <div className="UserMicroCard">
                {props.picture? 
                    <img className="logo" src={props.picture} />:
                    <AccountBoxIcon sx={{ fontSize: "3em" }} />
                    
                }
                <div className="name">{props.given_name} {props.family_name}</div>
            </div>
        )
    }
    
    type FunderRowProps={
        funder:ExtendedCompanyType
    }
    function FunderRow(props:FunderRowProps){
        const {funder} = props;
        function dfv(p:permissionEnum){
            return (
                funder.permissions.includes(p) ||
                (
                    permissionsToAdd[funder.id] &&
                    permissionsToAdd[funder.id][p]
                )
            )
        }
        return (<tr>
            <td>{
            funder.logo? 
                (<img src={funder.logo} style={{height:"2em"}}/>):
                (<DomainDisabledIcon sx={{ fontSize: "2em" }} />)
            }
            </td>
            <td>{funder.name}</td>
            <td>
                <Switch
                    onChange={(e)=>{
                        modifyPermission(
                            funder.id, 
                            permissionEnum.viewBalance, 
                            e.target.checked
                        )
                    }}
                    defaultChecked={dfv(permissionEnum.viewBalance)}
                 />
            </td>
            <td>
            <Switch
                    onChange={(e)=>{
                        modifyPermission(
                            funder.id, 
                            permissionEnum.viewTransactions, 
                            e.target.checked
                        )
                    }}
                    defaultChecked={dfv(permissionEnum.viewTransactions)}
                 />
            </td>
            <td>
            <Switch
                    onChange={(e)=>{
                        modifyPermission(
                            funder.id, 
                            permissionEnum.viewEmployees, 
                            e.target.checked
                        )
                    }}
                    defaultChecked={dfv(permissionEnum.viewEmployees)}
                 />
            </td>
            <td>
            <Switch
                    onChange={(e)=>{
                        modifyPermission(
                            funder.id, 
                            permissionEnum.viewEmployeeDetails, 
                            e.target.checked
                        )
                    }}
                    defaultChecked={dfv(permissionEnum.viewEmployeeDetails)}
                 />
            </td>
            <td>
            <Switch
                    onChange={(e)=>{
                        modifyPermission(
                            funder.id, 
                            permissionEnum.viewInsurance, 
                            e.target.checked
                        )
                    }}
                    defaultChecked={dfv(permissionEnum.viewInsurance)}
                 />
            </td>
        </tr>);
    }
    
    return (
        <>
        {selected && (
            <div style={{height:"20em"}}>
                This is the Sharing Page.
                Please choose companies to share {selected?.name} with.
                You will be prompted to provide more fine-grained permissions below.
                <DataGrid 
                    rows={rows} 
                    columns={cols} 
                    checkboxSelection={true}
                    onSelectionModelChange={selectionChanged}
                    className="Funders_Grid"
                    
                />
            </div>
        )}
        {messages.filter(shouldShow).map((message, index) => {
            return (
                <div className="PendingShare" key={index}>
                    <div className="from_org">
                        <h5>Sender:</h5>
                        <OrgCard 
                            logo={message.sender_org_logo}
                            name={message.sender_org_name}
                            city={message.sender_org_city}
                            state={message.sender_org_state}
                            description={message.sender_org_description}
                        />
                    </div>
                    <div className="from_user">
                        <UserCard 
                            picture={message.sender_picture} 
                            given_name={message.sender_given_name}
                            family_name={message.sender_family_name} 
                        />
                    </div>
                    <div className="to_org">
                        <h5>Receiver:</h5>
                        <OrgCard 
                            logo={message.receiver_org_logo}
                            name={message.receiver_org_name}
                            city={message.receiver_org_city}
                            state={message.receiver_org_state}
                            description={message.receiver_org_description}
                        />
                    </div>
                    <div className="to_user">
                        <UserCard 
                            picture={message.sender_picture} 
                            given_name={message.sender_given_name}
                            family_name={message.sender_family_name} 
                        />
                    </div>
                    
                    <div className="permissions">Would like to grant you the following permissions: {message.pending_permission?.split(',').join(', ')}</div>
                    <div className="buttons">
                        <Button 
                            size="large" 
                            variant="contained"
                            color="success"
                            onClick={()=>{approveMessageClick(message)}}
                        >
                            Approve
                        </Button>
                        <Button 
                            size="large" 
                            variant="contained"
                            color="error"
                            onClick={()=>{rejectMessageClick(message)}}
                        >
                            Reject
                        </Button>
                    </div>
                </div>
            )}
        )}
        {(selected || companiesByUser.canSeeMe) && (
            <div className="permissions_sharing">
                <table style={{borderCollapse:"collapse"}}>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Balance Summary</th>
                        <th>Transaction Details</th>
                        <th>Employee Summary</th>
                        <th>Employee Details</th>
                        <th>Insurance</th>
                        <th></th>
                    </tr>
                {selectedFunders && selectedFunders.map((funder)=>{
                    if(funder){
                        const eFunder:ExtendedCompanyType = {
                            ...funder,
                            permissions:[]
                        }
                        return (<FunderRow funder={eFunder} />)
                    }
                })}
                {companiesByUser.canSeeMe && companiesByUser.canSeeMe.map((funder)=>{
                    if(funder){
                        return (<FunderRow funder={funder} />)
                    }
                })}
                </table>
            </div>
        )}
        
        {selectedFunders && (
            <Button size="large" variant="contained" onClick={modifyCompany} className="ModifyButton">
                Update Permissions
            </Button>
        )}
        <FormGroup className="EnableShareReceive">
            <FormControlLabel 
                disabled={!(!!selected && canEnableSharing(selected))}
                control={
                    <Switch 
                        onChange={onChange}
                    />
                } 
                label="Enable Receiving Reports From Other Companies"
                title="This is a paid feature"
            />
        </FormGroup>
        </>
    )
}