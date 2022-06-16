import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AccountsTable } from "./AccountsTable";
import { OrganizationsTable } from "./OrganizationsTable";

@Index("items_table_pkey", ["id"], { unique: true })
@Index("items_table_plaid_access_token_key", ["plaidAccessToken"], {
  unique: true,
})
@Index("items_table_plaid_item_id_key", ["plaidItemId"], { unique: true })
@Entity("items_table", { schema: "public" })
export class ItemsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "plaid_access_token", unique: true })
  plaidAccessToken: string;

  @Column("text", { name: "plaid_item_id", unique: true })
  plaidItemId: string;

  @Column("text", { name: "plaid_institution_id" })
  plaidInstitutionId: string;

  @Column("text", { name: "status" })
  status: string;

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

  @OneToMany(() => AccountsTable, (accountsTable) => accountsTable.item)
  accountsTables: AccountsTable[];

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.itemsTables,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: OrganizationsTable;
}
