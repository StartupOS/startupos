import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrganizationsTable } from "./OrganizationsTable";
import { SubcategoryEmployee } from "./SubcategoryEmployee";

@Index("employees_table_pkey", ["id"], { unique: true })
@Index("employees_table_merge_id_key", ["mergeId"], { unique: true })
@Entity("employees_table", { schema: "public" })
export class EmployeesTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "merge_id", unique: true })
  mergeId: string;

  @Column("text", { name: "employee_number", nullable: true })
  employeeNumber: string | null;

  @Column("text", { name: "first_name" })
  firstName: string;

  @Column("text", { name: "last_name" })
  lastName: string;

  @Column("text", { name: "display_full_name" })
  displayFullName: string;

  @Column("text", { name: "work_email" })
  workEmail: string;

  @Column("text", { name: "personal_email", nullable: true })
  personalEmail: string | null;

  @Column("text", { name: "mobile_phone_number", nullable: true })
  mobilePhoneNumber: string | null;

  @Column("text", { name: "hire_date" })
  hireDate: string;

  @Column("text", { name: "start_date" })
  startDate: string;

  @Column("text", { name: "employment_status" })
  employmentStatus: string;

  @Column("text", { name: "termination_date", nullable: true })
  terminationDate: string | null;

  @Column("text", { name: "avatar", nullable: true })
  avatar: string | null;

  @Column("text", { name: "rate", nullable: true })
  rate: string | null;

  @Column("text", { name: "period", nullable: true })
  period: string | null;

  @Column("text", { name: "frequency", nullable: true })
  frequency: string | null;

  @Column("text", { name: "job_title", nullable: true })
  jobTitle: string | null;

  @Column("boolean", {
    name: "deleted",
    nullable: true,
    default: () => "false",
  })
  deleted: boolean | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;

  @Column("timestamp with time zone", {
    name: "updated_at",
    nullable: true,
    default: () => "now()",
  })
  updatedAt: Date | null;

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.employeesTables,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: OrganizationsTable;

  @OneToOne(
    () => SubcategoryEmployee,
    (subcategoryEmployee) => subcategoryEmployee.employee
  )
  subcategoryEmployee: SubcategoryEmployee;
}
