/**
 * @file Defines the queries for the assets table/view.
 */

 const db = require('../');
 function dis(a,b){
    const l = Math.max(a.length, b.length);
    const m = Math.min(a.length, b.length);
    let s = 0;
    for(let i=0; i<l; i++){
        if(a[i] && b[i]){
            if(a[i] === b[i]){
                s+=0;
            } else {
                s+=1;
            }
        } else {
            s+=1;
        }
    }
    return s/m;
}
function possibles(tx, fudge, threshold){
    // Casting and safe defaults
    fudge = +fudge;
    if(isFinite(fudge) && fudge < 1 && fudge >=0){
        // This is a good window
    } else {
        fudge = 0.2;
    }
    fudge = 1-fudge;

    threshold = +threshold;
    if(isFinite(threshold) && threshold >0){
        // This is a good window
    } else {
        threshold = 1;
    }

    const s = tx.name || "";
    const a = tx.amount;
    const inputLength = s.length;
    const vowels = ['a','e','i','o','u'];
    const counts = vowels.map(v=>{
        const reg = new RegExp('[^'+v+']', 'g');
        return s.replace(reg,'').length;
    });
    counts.push(a*fudge, a/fudge)
    const args = [inputLength/fudge, inputLength*fudge];

    const query = {
        text: `
        select * from transactions
        where 
            l <= $1 and
            l >= $2 and
            a - $3 < $2 and
            e - $4 < $2 and
            i - $5 < $2 and
            o - $6 < $2 and
            u - $7 < $2 and
            amount >= $8 and
            amount <= $9
        `,
        values:args.concat(counts)
    }
    const rows = await db.query(query);
    const matches = rows.filter(row=>dis(row.str, s)<threshold);
    return matches;

}

