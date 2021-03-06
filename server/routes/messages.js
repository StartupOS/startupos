const express = require('express');
const Boom = require('@hapi/boom');

const { asyncWrapper } = require('../middleware');
const {
    getMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    retrieveMessage,
    companiesWithPermissions,
    hasPermissions,
    grantPermissions,
    grantPermissionsToOrg
} = require('../db/queries');
const router = express.Router();

function dedupe(messages){
    const h = {}
    for(m of messages){
        h[m.id] = m;
    }
    return Object.values(h);
}

async function canGrant(userId, companyId, permissions){
    const permissionsArr = permissions.split(',');
    return permissionsArr.reduce(async (prev, permission)=>{
        return await hasPermissions(userId, companyId, ['grant_'+permission]) && prev;
    }, true) && await hasPermissions(userId, companyId, ['employee', 'sendMessages']);
}

router.post('/', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const message = await req.body;
    message.sender_user = user.id;
    if(message.permissions_pending){
        if(!message.sender_org){
            throw new Boom("Can't grant permissions on null org", { statusCode: 400 });
        } else if(await canGrant(user,id, message.sender_org, message.permissions_pending)) {
            const m = await createMessage(message);
            res.json(m);
        } else {
            throw new Boom("Can't grant permissions you don't have", { statusCode: 400 });
        }
    } else {
        const m = await createMessage(message);
        res.json(m);
    }
    
}))

router.get('/', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const companies = await companiesWithPermissions(user.id, ['viewMessages', 'employee']);
    let a = [];
    for(let company of companies){
        const m = await getMessages(user.id, company.id);
        a = a.concat(m);
    }
    const m = await getMessages(user.id);
    a = a.concat(m);
    a = dedupe(a);
    res.json(a);
}))

router.get('/:id', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const {id} = await req.params;
    const companies = await companiesWithPermissions(user.id, ['viewMessages', 'employee']);
    const m = await retrieveMessage(id);
    if(m && companies.includes({id:m.receiver_org}) || m.receiver_user===user.id){
        res.json(m);
    } else {
        res.statusCode(404);
    }
    
}))
router.put('/:id', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const {id} = await req.params;
    const message = await req.body;
    const companies = await companiesWithPermissions(user.id, ['sendMessages', 'employee']);
    const originalMessage = await retrieveMessage(id);
    if(!originalMessage){
        return res.statusCode(404);
    } else if(originalMessage.approved){
        throw new Boom('Cannot modify an approved Message', {statusCode: 400});
    } else {
        if(message.permissions_pending){
            // Can I grant these permissions? 
            // Includes check to see if I can send messages for this org.
            if(!message.sender_org){
                throw new Boom("Can't grant permissions on null org", { statusCode: 400 });
            } else if(
                    await canGrant(user,id, message.sender_org, message.permissions_pending) && 
                    message.sender_org === originalMessage.sender_org
                ) {
                const sanitizedMessage = {
                    id,
                    message_body: message.message_body,
                    receiver_user: message.receiver_user,
                    receiver_org: message.receiver_org,
                    permissions_pending: message.permissions_pending
                };
                const m = await updateMessage(sanitizedMessage);
                res.json(m);
            } else {
                throw new Boom("Can't grant permissions you don't have", { statusCode: 400 });
            }
        } else if(
                    originalMessage.receiver_user == user.id || 
                    (message.receiver_org && companies.includes({id:message.receiver_org}))
                ) {
            // Is this my message, and am I modifying receiver modifiable fields?
            const sanitizedMessage = {
                id,
                is_read: message.is_read,
                archived: message.archived
            };
            const m = await updateMessage(message);
            res.json(m);
        } else if(
                originalMessage.sender_user == user.id ||
                (originalMessage.sender_org && companies.includes({id:originalMessage.sender_org}))
            ) {
            // Did I send this message, and am I modifying only sender modifiable fields
            const sanitizedMessage = {
                id,
                message_body: message.message_body,
                receiver_user: message.receiver_user,
                receiver_org: message.receiver_org
            };
            const m = await updateMessage(sanitizedMessage)
        }
    }
    
    
}))
router.delete('/:id', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const {id} = await req.params;
    const companies = await companiesWithPermissions(user.id, ['sendMessages', 'employee']);
    const m = await retrieveMessage(id);
    if(m && companies.includes({id:m.receiver_org}) || m.receiver_user===user.id){
        const newMessage = await deleteMessage(id);
        res.json(newMessage);
    } else {
        res.statusCode(404);
    }
}))

router.post(':id/read', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const {id} = await req.params;
    const companies = companiesWithPermissions(user.id, ['sendMessages', 'employee']);
    const m = await retrieveMessage(id);
    if(m && companies.includes({id:m.receiver_org}) || m.receiver_user===user.id){
        const newMessage = await updateMessage({is_read:true});
        res.json(newMessage);
    } else {
        res.statusCode(404);
    }
}));

router.post(':id/unread', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const {id} = await req.params;
    const companies = companiesWithPermissions(user.id, ['sendMessages', 'employee']);
    const m = await retrieveMessage(id);
    if(m && companies.includes({id:m.receiver_org}) || m.receiver_user===user.id){
        const newMessage = await updateMessage({is_read:false});
        res.json(newMessage);
    } else {
        res.statusCode(404);
    }
}));

router.post(':id/archive', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const {id} = await req.params;
    const companies = await companiesWithPermissions(user.id, ['sendMessages', 'employee']);
    const m = await retrieveMessage(id);
    if(m && companies.includes({id:m.receiver_org}) || m.receiver_user===user.id){
        const newMessage = await updateMessage({archived:true});
        res.json(newMessage);
    } else {
        res.statusCode(404);
    }
}));

router.post(':id/unarchive', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const {id} = await req.params;
    const companies = await companiesWithPermissions(user.id, ['sendMessages', 'employee']);
    const m = await retrieveMessage(id);
    if(m && companies.includes({id:m.receiver_org}) || m.receiver_user===user.id){
        const newMessage = await updateMessage({archived:false});
        res.json(newMessage);
    } else {
        res.statusCode(404);
    }
}));

router.post(':id/accept', asyncWrapper(async (req,res)=>{
    const user = await req.user;
    const {id} = await req.params;
    const m = await retrieveMessage(id);
    if(!m){
        return res.statusCode(404);
    }
    if(!m.permissions_pending){
        throw new Boom("Can't accept non-existent permissions", {statusCode:400});
    }
    const permissions = m.permissions_pending.split(',');
    const companies = await companiesWithPermissions(user.id, ['readMessages', 'employee']);
    
    if(m.receiver_org && companies.includes(user.id)){
        // This is to an org
        const hasPermission = hasPermissions(user.id, m.receiver_org, ['spendMoney'])
        if(hasPermission){
            await grantPermissionsToOrg(m.receiver_org, m.sender_org, permissions);
            const m = await updateMessage({id, accepted:true, is_read:true})
            res.json(m);
        } else {
            throw new Boom("Can't accept permissions that weren't granted to you", {statusCode:401})
        }
    } else {
        // This is to an individual
        if(user.id === m.receiver_user){
            await grantPermissions(m.receiver_user, m.sender_org, permissions);
            const m = await updateMessage({id, accepted:true, is_read:true})
            res.json(m);
        } else {
            throw new Boom("Can't accept permissions that weren't granted to you", {statusCode:401})
        }
    }
    
}));

module.exports=router;