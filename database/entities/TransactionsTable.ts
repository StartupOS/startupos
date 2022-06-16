import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CategoryTransaction } from "./CategoryTransaction";
import { TransactionMerchant } from "./TransactionMerchant";
import { AccountsTable } from "./AccountsTable";

@Index("transactions_table_pkey", ["id"], { unique: true })
@Index("transactions_table_plaid_transaction_id_key", ["plaidTransactionId"], {
  unique: true,
})
@Entity("transactions_table", { schema: "public" })
export class TransactionsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "plaid_transaction_id", unique: true })
  plaidTransactionId: string;

  @Column("text", { name: "plaid_category_id", nullable: true })
  plaidCategoryId: string | null;

  @Column("text", { name: "category", nullable: true })
  category: string | null;

  @Column("text", { name: "subcategory", nullable: true })
  subcategory: string | null;

  @Column("text", { name: "type" })
  type: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("numeric", { name: "amount", precision: 28, scale: 10 })
  amount: string;

  @Column("text", { name: "iso_currency_code", nullable: true })
  isoCurrencyCode: string | null;

  @Column("text", { name: "unofficial_currency_code", nullable: true })
  unofficialCurrencyCode: string | null;

  @Column("date", { name: "date" })
  date: string;

  @Column("boolean", { name: "pending" })
  pending: boolean;

  @Column("text", { name: "account_owner", nullable: true })
  accountOwner: string | null;

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

  @Column("integer", { name: "l", default: () => "0" })
  l: number;

  @Column("integer", { name: "a", default: () => "0" })
  a: number;

  @Column("integer", { name: "e", default: () => "0" })
  e: number;

  @Column("integer", { name: "i", default: () => "0" })
  i: number;

  @Column("integer", { name: "o", default: () => "0" })
  o: number;

  @Column("integer", { name: "u", default: () => "0" })
  u: number;

  @OneToMany(
    () => CategoryTransaction,
    (categoryTransaction) => categoryTransaction.tx
  )
  categoryTransactions: CategoryTransaction[];

  @OneToMany(
    () => TransactionMerchant,
    (transactionMerchant) => transactionMerchant.tx
  )
  transactionMerchants: TransactionMerchant[];

  @ManyToOne(
    () => AccountsTable,
    (accountsTable) => accountsTable.transactionsTables,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "account_id", referencedColumnName: "id" }])
  account: AccountsTable;
}
