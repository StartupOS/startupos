import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CategoryMerchant } from "./CategoryMerchant";
import { CategoryTransaction } from "./CategoryTransaction";

@Index("categories_table_pkey", ["id"], { unique: true })
@Entity("categories_table", { schema: "public" })
export class CategoriesTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "name" })
  name: string;

  @OneToMany(() => CategoryMerchant, (categoryMerchant) => categoryMerchant.cat)
  categoryMerchants: CategoryMerchant[];

  @OneToMany(
    () => CategoryTransaction,
    (categoryTransaction) => categoryTransaction.cat
  )
  categoryTransactions: CategoryTransaction[];
}
