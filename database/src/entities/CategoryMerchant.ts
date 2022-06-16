import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CategoriesTable } from "./CategoriesTable";
import { MerchantsTable } from "./MerchantsTable";

@Entity("category_merchant", { schema: "public" })
export class CategoryMerchant {
  @Column("integer", { name: "id", nullable: true })
  id: number | null;

  @ManyToOne(
    () => CategoriesTable,
    (categoriesTable) => categoriesTable.categoryMerchants,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "cat_id", referencedColumnName: "id" }])
  cat: CategoriesTable;

  @ManyToOne(
    () => MerchantsTable,
    (merchantsTable) => merchantsTable.categoryMerchants,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "merchant_id", referencedColumnName: "id" }])
  merchant: MerchantsTable;
}
