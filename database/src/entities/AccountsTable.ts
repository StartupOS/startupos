import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ItemsTable } from "./ItemsTable";
import { TransactionsTable } from "./TransactionsTable";

@Index("accounts_table_pkey", ["id"], { unique: true })
@Index("accounts_table_plaid_account_id_key", ["plaidAccountId"], {
  unique: true,
})
@Entity("accounts_table", { schema: "public" })
export class AccountsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "plaid_account_id", unique: true })
  plaidAccountId: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "mask" })
  mask: string;

  @Column("text", { name: "official_name", nullable: true })
  officialName: string | null;

  @Column("numeric", {
    name: "current_balance",
    nullable: true,
    precision: 28,
    scale: 10,
  })
  currentBalance: string | null;

  @Column("numeric", {
    name: "available_balance",
    nullable: true,
    precision: 28,
    scale: 10,
  })
  availableBalance: string | null;

  @Column("text", { name: "iso_currency_code", nullable: true })
  isoCurrencyCode: string | null;

  @Column("text", { name: "unofficial_currency_code", nullable: true })
  unofficialCurrencyCode: string | null;

  @Column("text", { name: "type" })
  type: string;

  @Column("text", { name: "subtype" })
  subtype: string;

  @Column("boolean", {
    name: "deleted",
    nullable: true,
    default: () => "false",
  })
  deleted: boolean | null;

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

  @ManyToOne(() => ItemsTable, (itemsTable) => itemsTable.accountsTables, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "item_id", referencedColumnName: "id" }])
  item: ItemsTable;

  @OneToMany(
    () => TransactionsTable,
    (transactionsTable) => transactionsTable.account
  )
  transactionsTables: TransactionsTable[];
}
