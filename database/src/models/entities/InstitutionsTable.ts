import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Index("institutions_table_pkey", ["id"], { unique: true })
@Index("institutions_table_plaid_institution_id_key", ["plaidInstitutionId"], {
  unique: true,
})
@Entity("institutions_table", { schema: "public" })
export class InstitutionsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "plaid_institution_id", unique: true })
  plaidInstitutionId: string;

  @Column("text", { name: "name" })
  name: string;

  @Column("text", { name: "products", nullable: true })
  products: string | null;

  @Column("text", { name: "country_codes", nullable: true })
  countryCodes: string | null;

  @Column("text", { name: "url", nullable: true })
  url: string | null;

  @Column("bytea", { name: "logo", nullable: true })
  logo: Buffer | null;

  @Column("text", { name: "primary_color", nullable: true })
  primaryColor: string | null;

  @Column("text", { name: "routing_numbers", nullable: true })
  routingNumbers: string | null;

  @Column("text", { name: "status", nullable: true })
  status: string | null;
}
