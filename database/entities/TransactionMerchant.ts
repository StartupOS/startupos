import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { MerchantsTable } from "./MerchantsTable";
import { TransactionsTable } from "./TransactionsTable";

@Index("tm", ["merchantId", "txId"], { unique: true })
@Entity("transaction_merchant", { schema: "public" })
export class TransactionMerchant {
  @Column("integer", { name: "id", nullable: true })
  id: number | null;

  @Column("integer", { name: "tx_id" })
  txId: number;

  @Column("integer", { name: "merchant_id" })
  merchantId: number;

  @ManyToOne(
    () => MerchantsTable,
    (merchantsTable) => merchantsTable.transactionMerchants,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "merchant_id", referencedColumnName: "id" }])
  merchant: MerchantsTable;

  @ManyToOne(
    () => TransactionsTable,
    (transactionsTable) => transactionsTable.transactionMerchants,
    { onDelete: "SET NULL" }
  )
  @JoinColumn([{ name: "tx_id", referencedColumnName: "id" }])
  tx: TransactionsTable;
}
