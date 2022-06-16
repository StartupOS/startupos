import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrganizationsTable } from "./OrganizationsTable";

@Index("liabilities_table_pkey", ["id"], { unique: true })
@Entity("liabilities_table", { schema: "public" })
export class LiabilitiesTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("numeric", { name: "value", nullable: true, precision: 28, scale: 2 })
  value: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

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
    (organizationsTable) => organizationsTable.liabilitiesTables,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: OrganizationsTable;
}
