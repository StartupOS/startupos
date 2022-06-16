import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrganizationsTable } from "./OrganizationsTable";
import { UsersTable } from "./UsersTable";

@Index("organization_memberships_pkey", ["id"], { unique: true })
@Entity("organization_memberships", { schema: "public" })
export class OrganizationMemberships {
  @PrimaryGeneratedColumn({ type: "integer", name: "id" })
  id: number;

  @Column("text", { name: "membership_type", nullable: true })
  membershipType: string | null;

  @ManyToOne(
    () => OrganizationsTable,
    (organizationsTable) => organizationsTable.organizationMemberships,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "organization_id", referencedColumnName: "id" }])
  organization: OrganizationsTable;

  @ManyToOne(
    () => UsersTable,
    (usersTable) => usersTable.organizationMemberships,
    { onDelete: "CASCADE" }
  )
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: UsersTable;
}
