import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CategoryMerchant } from "./CategoryMerchant";
import { TransactionMerchant } from "./TransactionMerchant";
import { SubcategoryMerchantTable } from "./SubcategoriesMerchantsTable";

@Index("merchants_table_pkey", ["id"], { unique: true })
@Entity("merchants_table", { schema: "public" })
export class MerchantsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "name", unique: true })
  name: string;

  @Column("text", { name: "memo", nullable: true })
  memo: string | null;

  @OneToMany(
    () => CategoryMerchant,
    (categoryMerchant) => categoryMerchant.merchant
  )
  categoryMerchants: CategoryMerchant[];

  @OneToMany(
    () => TransactionMerchant,
    (transactionMerchant) => transactionMerchant.merchant
  )
  transactionMerchants: TransactionMerchant[];

  @OneToMany(
    () => SubcategoryMerchantTable,
    (subcategoryMerchant) => subcategoryMerchant.merchant
  )
  subcategoryMerchant: SubcategoryMerchantTable;
}
