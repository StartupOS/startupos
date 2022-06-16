import dataSource from './'
import { TransactionsTable } from '../models/entities/TransactionsTable';
import { MerchantsTable } from '../models/entities/MerchantsTable';
import { TransactionMerchant } from '../models/entities/TransactionMerchant';
import { CategoryMerchant } from '../models/entities/CategoryMerchant';
import { CategoriesTable } from '../models/entities/CategoriesTable';
import { SubcategoriesTable } from '../models/entities/SubcategoriesTable'

const categories = [
    "COGS",
    "SG&A",
    "CAPEX",
    "Assets",
    "Liabilities",
    "Income",
    "Equity",
    "Other"
]

async function main() {
    await dataSource.initialize();
    const merchantsQuery = await dataSource.manager.
        createQueryBuilder()
        .select('m.*')
        .from(MerchantsTable, 'm')
        .leftJoinAndSelect(CategoryMerchant, 'cm', 'm.id=cm.merchant_id')
        .where("cm.cat_id is null")
    console.log(await merchantsQuery.getQuery())
    const merchants = await merchantsQuery.execute();

    console.log(merchants[0]);
    // const categories = await dataSource.manager.find(CategoriesTable);
    // const relations = await dataSource.manager.find(CategoryMerchant);
    categories.forEach(async function(sub){
        const cat = new CategoriesTable();
        cat.name = sub
        try{
            await cat.save();
            console.log('Inserted', sub)
        } catch(ex){}
    });

}

main()