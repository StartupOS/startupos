import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { MergeTokensTable } from "./MergeTokensTable";
import { MessagesTable } from "./MessagesTable";
import { OrganizationMemberships } from "./OrganizationMemberships";
import { OrganizationsTable } from "./OrganizationsTable";

@Index("users_table_pkey", ["id"], { unique: true })
@Index("users_table_username_key", ["username"], { unique: true })
@Entity("users_table", { schema: "public" })
export class UsersTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "username", unique: true })
  username: string;

  @Column("text", { name: "given_name", default: () => "'John'" })
  givenName: string;

  @Column("text", { name: "family_name", default: () => "'Doe'" })
  familyName: string;

  @Column("text", { name: "email", default: () => "'doe@ayl.us'" })
  email: string;

  @Column("text", { name: "picture", nullable: true })
  picture: string | null;

  @Column("text", { name: "_json", nullable: true })
  json: string | null;

  @Column("boolean", { name: "verified_email", default: () => "false" })
  verifiedEmail: boolean;

  @Column("text", { name: "googleid", nullable: true })
  googleid: string | null;

  @Column("text", { name: "githubid", nullable: true })
  githubid: string | null;

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

  @Column("int4", { name: "organizations", nullable: true, array: true })
  organizations: number[] | null;

  @Column("int4", { name: "groups", nullable: true, array: true })
  groups: number[] | null;

  @OneToMany(
    () => MergeTokensTable,
    (mergeTokensTable) => mergeTokensTable.user
  )
  mergeTokensTables: MergeTokensTable[];

  @OneToMany(() => MessagesTable, (messagesTable) => messagesTable.receiverUser)
  messagesTables: MessagesTable[];

  @OneToMany(() => MessagesTable, (messagesTable) => messagesTable.senderUser)
  messagesTables2: MessagesTable[];

  @OneToMany(
    () => OrganizationMemberships,
    (organizationMemberships) => organizationMemberships.user
  )
  organizationMemberships: OrganizationMemberships[];

  @OneToMany(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.owner
  )
  organizationsTables: OrganizationsTable[];
}
