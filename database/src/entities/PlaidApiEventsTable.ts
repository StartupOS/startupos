import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("plaid_api_events_table_pkey", ["id"], { unique: true })
@Index("plaid_api_events_table_request_id_key", ["requestId"], { unique: true })
@Entity("plaid_api_events_table", { schema: "public" })
export class PlaidApiEventsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("integer", { name: "item_id", nullable: true })
  itemId: number | null;

  @Column("integer", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("text", { name: "plaid_method" })
  plaidMethod: string;

  @Column("text", { name: "arguments", nullable: true })
  arguments: string | null;

  @Column("text", { name: "request_id", nullable: true, unique: true })
  requestId: string | null;

  @Column("text", { name: "error_type", nullable: true })
  errorType: string | null;

  @Column("text", { name: "error_code", nullable: true })
  errorCode: string | null;

  @Column("timestamp with time zone", {
    name: "created_at",
    nullable: true,
    default: () => "now()",
  })
  createdAt: Date | null;
}
