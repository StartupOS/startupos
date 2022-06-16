import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CategorySubcategoryTable } from "./CategorySubcategoryTable";

@Index("subcategories_table_pkey", ["id"], { unique: true })
@Index("subcategories_table_name_key", ["name"], { unique: true })
@Entity("subcategories_table", { schema: "public" })
export class SubcategoriesTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "name", unique: true })
  name: string;

  @OneToMany(
    () => CategorySubcategoryTable,
    (categorySubcategoryTable) => categorySubcategoryTable.sc
  )
  categorySubcategoryTables: CategorySubcategoryTable[];
}
