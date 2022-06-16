import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AssetsTable } from "./AssetsTable";
import { EmployeesTable } from "./EmployeesTable";
import { InsuranceTable } from "./InsuranceTable";
import { ItemsTable } from "./ItemsTable";
import { LiabilitiesTable } from "./LiabilitiesTable";
import { MergeTokensTable } from "./MergeTokensTable";
import { MessagesTable } from "./MessagesTable";
import { OrgRelations } from "./OrgRelations";
import { OrganizationMemberships } from "./OrganizationMemberships";
import { UsersTable } from "./UsersTable";

@Index("organizations_table_ein_key", ["ein"], { unique: true })
@Index("organizations_table_pkey", ["id"], { unique: true })
@Index("organizations_table_name_key", ["name"], { unique: true })
@Entity("organizations_table", { schema: "public" })
export class OrganizationsTable {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("integer", { name: "random_id", nullable: true })
  randomId: number | null;

  @Column("text", { name: "name", nullable: true, unique: true })
  name: string | null;

  @Column("text", { name: "ein", nullable: true, unique: true })
  ein: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("text", { name: "logo", nullable: true })
  logo: string | null;

  @Column("text", { name: "street1", nullable: true })
  street1: string | null;

  @Column("text", { name: "street2", nullable: true })
  street2: string | null;

  @Column("text", { name: "city", nullable: true })
  city: string | null;

  @Column("text", { name: "state", nullable: true })
  state: string | null;

  @Column("text", { name: "country", nullable: true })
  country: string | null;

  @Column("boolean", {
    name: "is_funder",
    nullable: true,
    default: () => "false",
  })
  isFunder: boolean | null;

  @Column("smallint", {
    name: "risk_score",
    nullable: true,
    default: () => "0",
  })
  riskScore: number | null;

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

  @OneToMany(() => AssetsTable, (assetsTable) => assetsTable.organization)
  assetsTables: AssetsTable[];

  @OneToMany(
    () => EmployeesTable,
    (employeesTable) => employeesTable.organization
  )
  employeesTables: EmployeesTable[];

  @OneToMany(
    () => InsuranceTable,
    (insuranceTable) => insuranceTable.organization
  )
  insuranceTables: InsuranceTable[];

  @OneToMany(() => ItemsTable, (itemsTable) => itemsTable.organization)
  itemsTables: ItemsTable[];

  @OneToMany(
    () => LiabilitiesTable,
    (liabilitiesTable) => liabilitiesTable.organization
  )
  liabilitiesTables: LiabilitiesTable[];

  @OneToMany(
    () => MergeTokensTable,
    (mergeTokensTable) => mergeTokensTable.organization
  )
  mergeTokensTables: MergeTokensTable[];

  @OneToMany(() => MessagesTable, (messagesTable) => messagesTable.receiverOrg)
  messagesTables: MessagesTable[];

  @OneToMany(() => MessagesTable, (messagesTable) => messagesTable.senderOrg)
  messagesTables2: MessagesTable[];

  @OneToMany(() => OrgRelations, (orgRelations) => orgRelations.object)
  orgRelations: OrgRelations[];

  @OneToMany(() => OrgRelations, (orgRelations) => orgRelations.subject)
  orgRelations2: OrgRelations[];

  @OneToMany(
    () => OrganizationMemberships,
    (organizationMemberships) => organizationMemberships.organization
  )
  organizationMemberships: OrganizationMemberships[];

  @ManyToOne(() => UsersTable, (usersTable) => usersTable.organizationsTables, {
    onDelete: "CASCADE",
  })
  @JoinColumn([{ name: "owner", referencedColumnName: "id" }])
  owner: UsersTable;
}
