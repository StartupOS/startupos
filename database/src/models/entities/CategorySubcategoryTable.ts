import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity
} from "typeorm";
import { CategoriesTable } from "./CategoriesTable";
import { SubcategoriesTable } from "./SubcategoriesTable";

@Index("un_cat_subcat_pair", ["catId", "scId"], { unique: true })
@Index("category_subcategory_table_pkey", ["id"], { unique: true })
@Entity("category_subcategory_table", { schema: "public" })
export class CategorySubcategoryTable extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "sc_id", unique: true })
  scId: number;

  @Column("integer", { name: "cat_id", unique: true })
  catId: number;

  @ManyToOne(
    () => CategoriesTable,
    (categoriesTable) => categoriesTable.categorySubcategoryTables,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "cat_id", referencedColumnName: "id" }])
  cat: CategoriesTable;

  @ManyToOne(
    () => SubcategoriesTable,
    (subcategoriesTable) => subcategoriesTable.categorySubcategoryTable,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "sc_id", referencedColumnName: "id" }])
  sc: SubcategoriesTable;
}
