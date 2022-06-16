import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne
} from "typeorm";
import { SubcategoryEmployee } from "./SubcategoryEmployee";
import { SubcategoryMerchantTable } from "./SubcategoriesMerchantsTable";
import { CategorySubcategoryTable } from "./CategorySubcategoryTable"

@Index("subcategories_table_pkey", ["id"], { unique: true })
@Entity("subcategories_table", { schema: "public" })
export class SubcategoriesTable extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "name", unique: true })
  name: string;

  @OneToMany(
    () => SubcategoryEmployee,
    (subcategoryEmployee) => subcategoryEmployee.sc
  )
  subcategoryEmployees: SubcategoryEmployee[];

  @OneToOne(
    () => SubcategoryMerchantTable,
    (subcategoryMerchant) => subcategoryMerchant.sc
  )
  
  subcategoryMerchants: SubcategoryMerchantTable;

  @OneToOne(
    () => CategorySubcategoryTable,
    (categorySubcategoryTable) => categorySubcategoryTable.sc
  )
  categorySubcategoryTable: CategorySubcategoryTable;
}
