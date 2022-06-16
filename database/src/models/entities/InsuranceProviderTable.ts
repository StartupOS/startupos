import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { InsuranceTable } from "./InsuranceTable";

@Index("insurance_provider_table_pkey", ["id"], { unique: true })
@Index("insurance_provider_table_name_key", ["name"], { unique: true })
@Index("insurance_provider_table_url_key", ["url"], { unique: true })
@Entity("insurance_provider_table", { schema: "public" })
export class InsuranceProviderTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "name", unique: true })
  name: string;

  @Column("text", { name: "phone", nullable: true })
  phone: string | null;

  @Column("text", { name: "url", unique: true })
  url: string;

  @Column("text", { name: "address_1", nullable: true })
  address_1: string | null;

  @Column("text", { name: "address_2", nullable: true })
  address_2: string | null;

  @Column("text", { name: "city", nullable: true })
  city: string | null;

  @Column("text", { name: "state", nullable: true })
  state: string | null;

  @Column("text", { name: "zip", nullable: true })
  zip: string | null;

  @OneToMany(() => InsuranceTable, (insuranceTable) => insuranceTable.provider)
  insuranceTables: InsuranceTable[];
}
