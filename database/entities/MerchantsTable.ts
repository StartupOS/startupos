import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CategoryMerchant } from "./CategoryMerchant";
import { SubcategoryMerchant } from "./SubcategoryMerchant";
import { TransactionMerchant } from "./TransactionMerchant";

@Index("merchants_table_pkey", ["id"], { unique: true })
@Index("merchant_name", ["name"], { unique: true })
@Entity("merchants_table", { schema: "public" })
export class MerchantsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "memo", nullable: true })
  memo: string | null;

  @OneToOne(
    () => CategoryMerchant,
    (categoryMerchant) => categoryMerchant.merchant
  )
  categoryMerchant: CategoryMerchant;

  @OneToOne(
    () => SubcategoryMerchant,
    (subcategoryMerchant) => subcategoryMerchant.merchant
  )
  subcategoryMerchant: SubcategoryMerchant;

  @OneToMany(
    () => TransactionMerchant,
    (transactionMerchant) => transactionMerchant.merchant
  )
  transactionMerchants: TransactionMerchant[];
}
