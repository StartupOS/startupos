import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrganizationsTable } from "./OrganizationsTable";
import { UsersTable } from "./UsersTable";

@Index("merge_tokens_table_pkey", ["id"], { unique: true })
@Entity("merge_tokens_table", { schema: "public" })
export class MergeTokensTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "token", nullable: true })
  token: string | null;

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.mergeTokensTables,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: OrganizationsTable;

  @ManyToOne(() => UsersTable, (usersTable) => usersTable.mergeTokensTables, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: UsersTable;
}
