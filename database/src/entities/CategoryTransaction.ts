import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { CategoriesTable } from "./CategoriesTable";
import { TransactionsTable } from "./TransactionsTable";

@Entity("category_transaction", { schema: "public" })
export class CategoryTransaction {
  @Column("integer", { name: "id", nullable: true })
  id: number | null;

  @ManyToOne(
    () => CategoriesTable,
    (categoriesTable) => categoriesTable.categoryTransactions,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "cat_id", referencedColumnName: "id" }])
  cat: CategoriesTable;

  @ManyToOne(
    () => TransactionsTable,
    (transactionsTable) => transactionsTable.categoryTransactions,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "tx_id", referencedColumnName: "id" }])
  tx: TransactionsTable;
}