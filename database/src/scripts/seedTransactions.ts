import dataSource from './'
import { TransactionsTable } from '../models/entities/TransactionsTable';
import { MerchantsTable } from '../models/entities/MerchantsTable';
import { TransactionMerchant } from '../models/entities/TransactionMerchant';
import { CategoryMerchant } from '../models/entities/CategoryMerchant';
import { CategoriesTable } from '../models/entities/CategoriesTable';
import { CategorySubcategoryTable } from '../models/entities/CategorySubcategoryTable';
import { SubcategoriesTable } from '../models/entities/SubcategoriesTable'
import { SubcategoryMerchantTable } from '../models/entities/SubcategoriesMerchantsTable'

type MappingType = {
    [merchant:string] : string
}

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

const initialSubCategories = [
    "Gross Sales",
    "Bank Charges",
    "Employee Vacation Expense",
    "Contractors",
    "Office Expenses",
    "Rent",
    "Referral Fees",
    "Education Expense",
    "Salaries",
    "Marketing",
    "Miscellaneous Expenses",
    "Shipping and delivery expense",
    "Credit Card Processing Fees",
    "Licenses & Fees",
    "Hosting Costs",
    "Travel",
    "Forgiveness of Debt Income - PPP",
    "Travel Meals",
    "Corporate Tax Expense",
    "Penalties",
    "Meals",
    "Dues & Subscriptions",
    "Entertainment",
    "Insurance",
    "Legal & Professional Fees",
    "SaaS Tools",
    "State Filing Fees",
    "Interest Income",
    "Credit Card Rewards",
    "Interest Expense",
    "Amortization - Bonds",
    "Amortization - Loan Fees",
    "Amortization - Revolving Credit",
    "Depreciation"
]

const mappings:MappingType = {
    'Remitly':'Contractors',
    'Colony work places': 'rent',
    'SVB Credit Card payment': 'Amortization - Revolving Credit',
    'Webflow.com': 'Hosting',
    'Legalzoom' : 'Legal',
    'Pollfish': 'Marketing',
    'DIGITALOCEAN.COM' : 'Hosting',
    '^AWS': 'Hosting',
    'Figma': 'SaaS Tools',
    'Canva\\*' : 'SaaS Tools',
    'WASABI Technologies' : 'Hosting',
    'Foundersuite.com': 'SaaS Tools',
    'Dreamhost': 'Hosting',
    'unbounce' : 'marketing',
    'DE ecorp Tax' : 'State Filing',
    'Balsamiq': 'SaaS Tools',
    'Slack': 'SaaS Tools',
    'Zoom.us': 'SaaS Tools',
    'Calendly' : 'SaaS Tools',
    'MAILGUN' : 'Marketing'
};

const catMap = {
    "Gross Sales" : "Income",
    "Bank Charges": "SG&A",
    "Employee Vacation Expense": "SG&A",
    "Contractors": "SG&A",
    "Office Expenses": "SG&A",
    "Rent": "SG&A",
    // "Referral Fees",
    "Education Expense": "SG&A",
    // "Salaries",
    "Marketing": "SG&A",
    "Miscellaneous Expenses": "Other",
    "Shipping and delivery expense": "SG&A",
    "Credit Card Processing Fees": "SG&A",
    "Licenses & Fees": "SG&A",
    "Hosting Costs": "COGS",
    "Travel": "SG&A",
    // "Forgiveness of Debt Income - PPP",
    "Travel Meals": "SG&A",
    "Corporate Tax Expense": "SG&A",
    "Penalties": "SG&A",
    "Meals": "SG&A",
    "Dues & Subscriptions": "SG&A",
    "Entertainment": "SG&A",
    "Insurance": "SG&A",
    "Legal & Professional Fees": "SG&A",
    "SaaS Tools": "SG&A",
    "State Filing Fees": "SG&A",
    "Interest Income": "Income",
    "Credit Card Rewards": "Income",
    "Interest Expense": "Other",
    "Amortization - Bonds": "Other",
    "Amortization - Loan Fees": "Other",
    "Amortization - Revolving Credit": "Other",
    "Depreciation": "Other"
};

(async function main(){
    await dataSource.initialize();
    const c = await dataSource.manager.find(CategoriesTable);
    const relations = await dataSource.manager.find(SubcategoryMerchantTable);
    const subcategories = await dataSource.manager.find(SubcategoriesTable);
    const transactions = await dataSource.manager.find(TransactionsTable);
    const merchants = await dataSource.manager.find(MerchantsTable);
    
    // For Debugging and shit
    // console.log(transactions);
    // console.log(merchants);
    // console.log(subcategories);
    // console.log(relations);
    let logged = 0;

    for(const subcategory of initialSubCategories){
        const sc = new SubcategoriesTable()
        sc.name = subcategory;
        try {
            await sc.save();
            console.log('Inserted: ', subcategory)
        } catch (ex) {
            // Ignore duplicates
            // console.log('Failed on:', subcategory, '. Ignoring.');
            // console.error(ex);
            // throw new Error(ex);
        }
    }

    for(const key in catMap){
        // const re = new RegExp(key, 'i');
        const v = catMap[key];
        const re2 = new RegExp(v, 'i');
        for(const cat of c){
            if(re2.test(cat.name)){
                const scc = new CategorySubcategoryTable();
                scc.cat=cat;
                const sc = new SubcategoriesTable();
                sc.name=key;
                scc.sc = await SubcategoriesTable.findOne({ where:{ name: key} });
                // console.log(scc);
                try{   
                    await scc.save()
                    console.log('Associated', scc.sc.name, 'with', scc.cat.name);
                } catch (ex) {
                    console.log(ex);
                }
            }
        }
    }
    // return 1;
    for(const merchant of merchants){
        if(merchant.subcategoryMerchant)
            console.log(merchant.subcategoryMerchant)
        else if(logged < 10){
            for(const key in mappings){
                const re = new RegExp(key, 'i');
                const v = mappings[key];
                const re2 = new RegExp(v, 'i');
                // console.log(merchant.name, ':', key, re.test(merchant.name));
                const match = re.test(merchant.name);
                if(match){
                    console.log(merchant.name, ':', key, re.test(merchant.name));
                    for(const subcat of subcategories){
                        const match2 = re2.test(subcat.name);
                        if(match2){
                            console.log(subcat.name, ':', key, re2.test(subcat.name));
                            const scm = new SubcategoryMerchantTable();
                            scm.merchant = merchant;
                            scm.sc = subcat;
                            console.log(scm);
                            try {
                                await scm.save();
                                console.log('Associating', scm.merchant.name, 'with', scm.sc.name);
                            } catch (ex) {
                                console.log(scm.merchant.name, 'was already associated with', scm.sc.name);
                            } finally {
                                break;
                            }
                        }
                    }
                    logged++;
                    break;
                }
            }
        }
    }
})()