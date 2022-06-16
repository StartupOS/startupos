import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EmployeesTable } from "./EmployeesTable";

@Index("subcategory_employee_employee_id_key", ["employeeId"], { unique: true })
@Index("subcategory_employee_pkey", ["id"], { unique: true })
@Entity("subcategory_employee", { schema: "public" })
export class SubcategoryEmployee {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "sc_id" })
  scId: number;

  @Column("integer", { name: "employee_id", unique: true })
  employeeId: number;

  @OneToOne(
    () => EmployeesTable,
    (employeesTable) => employeesTable.subcategoryEmployee,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "employee_id", referencedColumnName: "id" }])
  employee: EmployeesTable;
}
