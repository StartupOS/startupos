import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity
} from "typeorm";
import { OrganizationsTable } from "./OrganizationsTable";

@Index("assets_table_pkey", ["id"], { unique: true })
@Entity("assets_table", { schema: "public" })
export class AssetsTable extends BaseEntity{
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "object_key", nullable: true })
  objectKey: string | null;

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
    (organizationsTable) => organizationsTable.assetsTables,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: OrganizationsTable;
}
