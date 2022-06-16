import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrganizationsTable } from "./OrganizationsTable";

@Index("org_relations_pkey", ["id"], { unique: true })
@Entity("org_relations", { schema: "public" })
export class OrgRelations {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "type", nullable: true })
  type: string | null;

  @Column("timestamp with time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.orgRelations,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "object", referencedColumnName: "id" }])
  object: OrganizationsTable;

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.orgRelations2,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "subject", referencedColumnName: "id" }])
  subject: OrganizationsTable;
}
