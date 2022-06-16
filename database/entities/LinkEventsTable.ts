import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("link_events_table_pkey", ["id"], { unique: true })
@Index("link_events_table_request_id_key", ["requestId"], { unique: true })
@Entity("link_events_table", { schema: "public" })
export class LinkEventsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "type" })
  type: string;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("text", { name: "link_session_id", nullable: true })
  linkSessionId: string | null;

  @Column("text", { name: "request_id", nullable: true, unique: true })
  requestId: string | null;

  @Column("text", { name: "error_type", nullable: true })
  errorType: string | null;

  @Column("text", { name: "error_code", nullable: true })
  errorCode: string | null;

  @Column("text", { name: "status", nullable: true })
  status: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;
}
