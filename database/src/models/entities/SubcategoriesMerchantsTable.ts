import { 
  Column, 
  Entity, 
  JoinColumn, 
  ManyToOne, 
  OneToOne, 
  PrimaryGeneratedColumn, 
  Unique,
  BaseEntity
 } from "typeorm";
import { MerchantsTable } from "./MerchantsTable";
import { SubcategoriesTable } from "./SubcategoriesTable";

@Entity("subcategory_merchant", { schema: "public" })
@Unique('MerchantSC', ['merchant', 'sc'])
export class SubcategoryMerchantTable extends BaseEntity{
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number | null;

  @OneToOne(
    () => MerchantsTable,
    (merchantsTable) => merchantsTable.subcategoryMerchant,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "merchant_id", referencedColumnName: "id" }])
  merchant: MerchantsTable;

  @ManyToOne(
    () => SubcategoriesTable,
    (subcategories_table) => subcategories_table.subcategoryMerchants,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "sc_id", referencedColumnName: "id" }])
  sc: SubcategoriesTable;
}
