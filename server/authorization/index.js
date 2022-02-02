const assert = require('assert').strict;
const db = require('../db');

async function addPermission(author, permission){
    const addPermission = JSON.parse(JSON.stringify(permission));
    addPermission.verb='addPermission';
    const action = {permissions: [addPermission]}
    if(validatePermissions(author, action)){
        const {subject, object, verb, context} = permission;
        const query = {
            // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
            text: 'INSERT INTO permissions (subject, object, verb, context) VALUES ($1, $2, $3, $4) RETURNING *;',
            values: [subject, object, verb, context]
        };
        const { rows } = await db.query(query);
        return rows[0];
    } else {
        console.log('User does not have permission they are trying to assign');
        return null;
    }
}

async function removePermission(author, permission){
    const deletePermission = JSON.parse(JSON.stringify(permission));
    deletePermission.verb='removePermission';
    const action = {permissions: [deletePermission]}

    if(validatePermissions(author, action)){
        const {subject, object, verb, context} = permission;
        const query = {
            // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
            text: 'delete from permissions where subject=$1 and object=$2 and verb=$3 and context=$4 returning *;',
            values: [subject, object, verb, context]
        };
        const { rows } = await db.query(query);
        return rows[0];
    } else {
        console.log('User does not have permission they are trying to remove');
        return null;
    }
}

async function getPermissions(user){
    const query = {
        // RETURNING is a Postgres-specific clause that returns a list of the inserted items.
        text: 'select subject, object, verb, context from permissions where subject=$1;',
        values: [user]
    };
    const { rows } = await db.query(query);
    return rows;
}

function matchContext(permission, context){
    let matches = true;
    if(!permission.context || permission.context == '*'){
        return true;
    }
    for(rule in permission.context){
        matches = matches && contextState.functions[rule](permission, context);
        if(!matches) break;   
    }
        
    return matches;
}
const contextState = {
    retries: {},
    last: {},
    functions: {
        tokenAuthed : function(permission, context){
            return true;
        },
        
        ipInCIDR: function(permission, context){
            return true;
        },
        retries: function(permission, context){
            const key = JSON.stringify(permission);
            const {retries, last} = contextState;
            const currentAttempts = retries[key]?retries[key]:0;
            if(currentAttempts <= permission.context.retries){
                delete retries[key];
                delete last[key];
                return true;
            } else { 
                retries[key]=retries[key]?retries[key]+1:1;
                last[key]= Date.now();
                return false;
            }
            
        }
    }
}
function expireRetries(){
    const {last, retries} = contextState;
    for(key in retries){
        if(last[key] < Date.now() - 24*60*60*1000){
            delete retries[key];
            delete last[key]
        }
    }
    setTimeout(expireRetries, 1000*60*60*2);
}
expireRetries();



function validatePermissions(user, action, context){
    const has_from_token = user.permissions;
    const has_from_db = await getPermissions(user);
    const global_from_db = await getPermissions('*');
    const has = has_from_token.concat(has_from_db).concat(global_from_db);
    const needs = action.permissions;
    const personal = has.filter((o)=>o.subject == user.id || o.subject == '*');
    const applicable = personal.filter((permission)=> matchContext(permission, context));
    console.log(personal);
    const match = needs.reduce((prev, need)=>{
        const relevant = applicable.filter((p)=>wildcardParser(need.object, p.object));
        console.log(relevant);
        const matches = relevant.filter((p)=>p.verb == need.verb || p.verb == '*');
        console.log(matches);
        return matches.length>0 && prev;
    }, true);
    return match;
}

function wildcardParser(target, grant){
    const targetPath = target.split('.');
    const grantPath = grant.split('.');
    const longer = grantPath.length > targetPath.length ? grantPath : targetPath;
    let matches = true;
    longer.forEach((p,i)=>{
        if(targetPath[i] == grantPath[i] || grantPath[i]=='*'){
            matches = matches && true;
        } else {
            if(i>=grantPath.length && grantPath[-1] == '*'){
                matches = matches && true;
            } else {
                matches = false;
            }

        }
    });
    return matches;
}

assert(wildcardParser('user:1.item:2', 'user:1.*'));
assert(!wildcardParser('user:2.item:2', 'user:1.*'));
assert(wildcardParser('user:1.item:2', 'user:1.item:2'));
assert(!wildcardParser('user:1.item:2', 'user:1.item:2.account:1'));
assert(wildcardParser('user:1.item:2', 'user:1.item:2.*.*'));
assert(!wildcardParser('user:1.item:2.account:1', 'user:1.item:2'));

const testGrant1 = {
    subject: '1',
    object: 'user:1.*',
    verb: 'update'
}
const testNeed1 = {
    subject: '1',
    object: 'user:1.item:2',
    verb: 'update'
}

assert(validatePermissions({id:1, permissions:[testGrant1]}, {permissions:[testNeed1]}));

module.exports={
    validatePermissions,
    addPermission,
    removePermission
};