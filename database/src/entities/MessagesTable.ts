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

@Index("messages_table_pkey", ["id"], { unique: true })
@Entity("messages_table", { schema: "public" })
export class MessagesTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "message_body", nullable: true })
  messageBody: string | null;

  @Column("text", { name: "pending_permission", nullable: true })
  pendingPermission: string | null;

  @Column("boolean", {
    name: "is_read",
    nullable: true,
    default: () => "false",
  })
  isRead: boolean | null;

  @Column("boolean", { name: "approved", nullable: true })
  approved: boolean | null;

  @Column("timestamp with time zone", { name: "created_at", nullable: true })
  createdAt: Date | null;

  @Column("timestamp with time zone", { name: "updated_at", nullable: true })
  updatedAt: Date | null;

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.messagesTables,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "receiver_org", referencedColumnName: "id" }])
  receiverOrg: OrganizationsTable;

  @ManyToOne(() => UsersTable, (usersTable) => usersTable.messagesTables, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "receiver_user", referencedColumnName: "id" }])
  receiverUser: UsersTable;

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.messagesTables2,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "sender_org", referencedColumnName: "id" }])
  senderOrg: OrganizationsTable;

  @ManyToOne(() => UsersTable, (usersTable) => usersTable.messagesTables2, {
    onDelete: "SET NULL",
  })
  @JoinColumn([{ name: "sender_user", referencedColumnName: "id" }])
  senderUser: UsersTable;
}
