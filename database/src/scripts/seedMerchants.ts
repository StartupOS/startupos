import dataSource from './'
import { TransactionsTable } from '../models/entities/TransactionsTable';
import { MerchantsTable } from '../models/entities/MerchantsTable';
import { TransactionMerchant } from '../models/entities/TransactionMerchant';


(async ()=>{
    await dataSource.initialize();
    const transactions = await dataSource.manager.find(TransactionsTable)
    type txMapType = {
        [key:string]:string
    }
    type merchantMapType = {
        [key:string]:Set<string>;
    }
    const txMap:txMapType = {}
    const merchantMap:merchantMapType = {}

    function dis(a:string, b:string):number{
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
    function longestCommonSubstring(str1:string, str2:string) {

        if (str1 === str2) return str2;
        if (!str2.split('').some(ele => str1.includes(ele))) return '';
        let commonSubStr = '';
        let storage = [];
        const strLength = str2.length;

        for (let i = 0; i < strLength; i++) {

            let ind = str1.indexOf(str2[i]);
            if (ind === -1) continue;

            for (let j = i, k = ind; j < strLength; j++, k++) {
                if (str2[j] === str1[k])
                    commonSubStr += str2[j];
                else {
                    storage.push(commonSubStr);
                    commonSubStr = '';
                }
            }
            storage.push(commonSubStr);
            commonSubStr = '';
        }

        return storage.sort((a, b) => b.length - a.length)[0];
    }
    // This value is tweaked to make sure 'Amazon.com*PY8DH5X33' matches 'Amazon.com*MJ5RB7NP1' 
    // but not 'Amazon.com'
    const MATCH = 0.451 // Values below this are considered "Same"

    for(const transaction of transactions){
        const memo = transaction.name;
        let merchant = [];
        let matched = false;
        let oldMerchants:string[] = [];

        // if memo known do nothing
        if(!(memo in txMap)){
            // check merchants
            for(const m in merchantMap){
                const d = dis(memo, m);
                if(d<MATCH){
                    merchant.push(longestCommonSubstring(memo, m))
                    matched = true;
                    oldMerchants.push(m);
                    break;
                }
            }

            // check transactions
            if(!matched){
                for(const memo2 in txMap){
                    const d = dis(memo, memo2);
                    if(d<MATCH){
                        merchant.push(longestCommonSubstring(memo, memo2))
                    }
                }
            }
            const newMerch = merchant.reduce((p,c,i,a)=>{
                return longestCommonSubstring(p,c)
            },memo) || memo;
            // update tx map
            txMap[memo] = newMerch;
            // update merchant map
            if(!(newMerch in merchantMap)){
                merchantMap[newMerch] = new Set();
            }
            merchantMap[newMerch].add(memo);
            merchant = [newMerch];
        } 
    }

    // console.log(merchantMap);
    const mIds:txMapType = {};

    // update db
    for(let m in merchantMap){
        await dataSource
            .createQueryBuilder()
            .insert()
            .into(MerchantsTable)
            .values({
                name: m
            })
            .orIgnore()
            .execute();
    }
    const rows = Object.keys(txMap).length;
    let progress = 0;
    let progressIncrement = rows/10;
    let lastUpdate = 0;
    for(let t in txMap){
        const mid = (await dataSource
            .createQueryBuilder()
            .select('id')
            .from(MerchantsTable, 'MerchantsTable')
            .where({name: txMap[t]})
            .execute())[0].id;
        const tidArr:tidType[] = await dataSource
            .createQueryBuilder()
            .select('id')
            .from(TransactionsTable, 'TransactionsTable')
            .where({name: t})
            .execute();
        type tidType = {id:string}
        
        for(const tid of tidArr){
            await dataSource
                .createQueryBuilder()
                .insert()
                .into(TransactionMerchant)
                .values({
                    tx: ()=>tid.id,
                    merchant: mid
                })
                .orIgnore()
                .execute();
        }
        progress++;
        if(progress > lastUpdate + progressIncrement){
            console.log('Rows Written', progress, 'out of', rows);
            lastUpdate+=progressIncrement;
        }

    }
    

})()
