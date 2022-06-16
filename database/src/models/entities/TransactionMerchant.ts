import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { MerchantsTable } from "./MerchantsTable";
import { TransactionsTable } from "./TransactionsTable";

@Entity("transaction_merchant", { schema: "public" })
@Unique('MerchantTX', ['merchant', 'tx'])
export class TransactionMerchant {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number | null;

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
