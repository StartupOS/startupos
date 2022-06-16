import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CategoriesTable } from "./CategoriesTable";
import { MerchantsTable } from "./MerchantsTable";

@Index("category_merchant_pkey", ["id"], { unique: true })
@Index("category_merchant_merchant_id_key", ["merchantId"], { unique: true })
@Entity("category_merchant", { schema: "public" })
export class CategoryMerchant {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "merchant_id", unique: true })
  merchantId: number;

  @ManyToOne(
    () => CategoriesTable,
    (categoriesTable) => categoriesTable.categoryMerchants,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "cat_id", referencedColumnName: "id" }])
  cat: CategoriesTable;

  @OneToOne(
    () => MerchantsTable,
    (merchantsTable) => merchantsTable.categoryMerchant,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "merchant_id", referencedColumnName: "id" }])
  merchant: MerchantsTable;
}
