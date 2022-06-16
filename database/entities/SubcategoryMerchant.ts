import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MerchantsTable } from "./MerchantsTable";

@Index("subcategory_merchant_pkey", ["id"], { unique: true })
@Index("subcategory_merchant_merchant_id_key", ["merchantId"], { unique: true })
@Entity("subcategory_merchant", { schema: "public" })
export class SubcategoryMerchant {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "sc_id" })
  scId: number;

  @Column("integer", { name: "merchant_id", unique: true })
  merchantId: number;

  @OneToOne(
    () => MerchantsTable,
    (merchantsTable) => merchantsTable.subcategoryMerchant,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "merchant_id", referencedColumnName: "id" }])
  merchant: MerchantsTable;
}
