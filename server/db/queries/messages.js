const db = require('../');

/*
 * create table if not exists messages(
 *   id SERIAL PRIMARY KEY,
 *   random_id int,
 *   sender_user int not null references users_table(id) on delete set null,
 *   sender_org int references organizations_table(id) on delete set null,
 *   message_body text,
 *   pending_permission text,
 *   receiver_user int references users_table(id) on delete cascade,
 *   receiver_org int references organizations_table(id) on delete cascade,
 *   is_read boolean default false,
 *   approved boolean,
 *   archived boolean default false,
 *   created_at timestamptz,
 *   updated_at timestamptz
 * );
*/

const getMessages = async(userId, companyId)=>{
    const query = {
        text: `
            select * 
            from messages m
            where receiver_user=$1
        `,
        values: [userId]
    }
    if(companyId){
        query.text+=`
            union
            select * 
            from messages 
            where receiver_org=$2
            `;
        query.values.push(companyId);
    }
    const rows = await db.q(query);
    return rows;
}

function parseField(message, fields, counter, required){
    const cols = [];
    const valsLabels = [];
    const vals = [];
    for(field of fields){
        if(message[field]){
            cols.push(field);
            valsLabels.push("$"+counter++);
            vals.push(message[field]);
        } else if(required) {
            throw new Error('Missing required field: ' + field);
        }
    }
    return {cols, vals, valsLabels, counter}
}

const createMessage = async(message)=>{
    const requiredFields = ['sender_user']
    const optionalFields = [
        'sender_org', 
        'message_body', 
        'pending_permission',
        'receiver_user',
        'receiver_org' 
    ];
    const {cols, vals, valsLabels, counter} = parseField(message, requiredFields, 1, true);
    const {cols:c2, vals:v2, valsLabels:l2, counter:counter2} = parseField(message, optionalFields,counter, false);
    const allCols = cols.concat(c2);
    const allVals = vals.concat(v2);
    const allLabels = valsLabels.concat(l2);
    const colString = allCols.join(', ');
    const valString = allLabels.join(', ');
    const query = {
        text: `
            insert into messages_table
            ( ${colString})
            values
            ( ${valString} )
        `,
        values: allVals
    }
    const rows = await db.q(query);
    return rows;
}

const retrieveMessage = async(messageId)=>{
    const query = {
        text:` select * from messages where id=$1`,
        values: [messageId]
    };
    const rows = await db.q(query)
    return rows[0];
}

const updateMessage = async(message)=>{
    const { id } = message;
    if(!id){
        throw new Error('Must update individual message by id');
    }
    const optionalFields = [
        'is_read',
        'approved',
        'message_body', 
        'pending_permission',
        'receiver_user',
        'receiver_org' 
    ];
    const {cols, vals, valsLabels} = parseField(message, optionalFields, 2, false);
    
    const setArr = ["Set"];
    cols.forEach((c,i)=>{
        setArr.push(c+"="+valsLabels[i]);
    });
    const setString = setArr.join(`
    `);
    const allVals = [id].concat(vals);
    const query = {
        text: `
            update messages_table
            ${setString}
            where
            id=$1
            returning *
        `,
        values: allVals
    }
    const rows = await db.q(query);
    return rows;
}

const deleteMessage = async(messageId)=>{
    const query = {
        text:`delete from messages_table where id=$1 returning *`,
        values: [messageId]
    };
    const rows = await db.q(query)
    return rows[0];
}

module.exports = {
    getMessages,
    createMessage,
    retrieveMessage,
    updateMessage,
    deleteMessage
}