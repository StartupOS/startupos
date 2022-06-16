import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrganizationsTable } from "./OrganizationsTable";
import { InsuranceProviderTable } from "./InsuranceProviderTable";

@Index("insurance_table_pkey", ["id"], { unique: true })
@Entity("insurance_table", { schema: "public" })
export class InsuranceTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "identifier" })
  identifier: string;

  @Column("text", { name: "policy_type" })
  policyType: string;

  @Column("text", { name: "document" })
  document: string;

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.insuranceTables,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: OrganizationsTable;

  @ManyToOne(
    () => InsuranceProviderTable,
    (insuranceProviderTable) => insuranceProviderTable.insuranceTables,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "provider", referencedColumnName: "id" }])
  provider: InsuranceProviderTable;
}
