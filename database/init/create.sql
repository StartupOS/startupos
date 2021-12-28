-- This trigger updates the value in the updated_at column. It is used in the tables below to log
-- when a row was last updated.

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.random_id = bounded_pseudo_encrypt(NEW.id, 16777215, 1024);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Shamelessly stolen from here:
-- https://medium.com/@emerson_lackey/postgres-randomized-primary-keys-123cb8fcdeaf
CREATE or REPLACE FUNCTION pseudo_encrypt_24(VALUE int) returns int AS $$
DECLARE
l1 int;
l2 int;
r1 int;
r2 int;
i int:=0;
BEGIN
  l1:= (VALUE >> 12) & (4096-1);
  r1:= VALUE & (4096-1);
  WHILE i < 3 LOOP
    l2 := r1;
    r2 := l1 # ((((1366 * r1 + 150889) % 714025) / 714025.0) * (4096-1))::int;
  l1 := l2;
  r1 := r2;
  i := i + 1;
  END LOOP;
  RETURN ((l1 << 12) + r1);
END;
$$ LANGUAGE plpgsql strict immutable;

CREATE or REPLACE FUNCTION bounded_pseudo_encrypt(VALUE int, MAX int, MIN int) returns int AS $$
BEGIN
  LOOP
    VALUE := pseudo_encrypt_24(VALUE);
    EXIT WHEN VALUE <= MAX AND VALUE >= MIN;
  END LOOP;
  RETURN VALUE;
END
$$ LANGUAGE plpgsql strict immutable;


-- TODO
-- CREATE OR REPLACE FUNCTION trigger_add_subject()
-- RETURNS void AS $$
-- BEGIN
--   NEW.updated_at = NOW();
--   insert into subjects(type) values (TG_TABLE_NAME, OLD.id)
-- END;
-- $$ LANGUAGE plpgsql;

-- create trigger add_subject before insert on users_table
--     for each row EXECUTE PROCEDURE

-- USERS
-- This table is used to store the users of our application. The view returns the same data as the
-- table, we're just creating it to follow the pattern used in other tables.

CREATE TABLE if not exists users_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  username text UNIQUE NOT NULL,
  given_name text NOT NULL default 'John',
  family_name text NOT NULL default 'Doe',
  email text NOT NULL default 'doe@ayl.us',
  picture text,
  _json text,
  verified_email boolean NOT NULL default false,
  googleId text,
  githubId text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  organizations integer[],
  groups integer[]
  -- subject_id integer,
  -- constraint fk_subjects
  --   foreign key(subject_id)
  --     references subjects(id)
);

CREATE TRIGGER users_updated_at_timestamp
BEFORE UPDATE ON users_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

drop view users cascade;
CREATE VIEW users
AS
  SELECT
    id,
    random_id,
    username,
    picture,
    organizations,
    given_name,
    family_name,
    created_at,
    updated_at
  FROM
    users_table;


CREATE TABLE if not exists organizations_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  name text UNIQUE,
  ein text UNIQUE,
  description text,
  logo text,
  street1 text,
  street2 text,
  city text,
  state text,
  country text,
  owner integer NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
  -- TODO re:Subjects
  -- subject_id integer,
  -- constraint fk_subjects
  --   foreign key(subject_id)
  --     references subjects(id)
);
CREATE TRIGGER organizations_updated_at_timestamp
BEFORE UPDATE ON organizations_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


-- ITEMS
-- This table is used to store the items associated with each organization. The view returns the same data
-- as the table, we're just using both to maintain consistency with our other tables. For more info
-- on the Plaid Item schema, see the docs page: https://plaid.com/docs/#item-schema

CREATE TABLE if not exists items_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  organization_id integer REFERENCES organizations_table(id) ON DELETE CASCADE,
  plaid_access_token text UNIQUE NOT NULL,
  plaid_item_id text UNIQUE NOT NULL,
  plaid_institution_id text NOT NULL,
  status text NOT NULL,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TRIGGER items_updated_at_timestamp
BEFORE UPDATE ON items_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

drop view items cascade;
CREATE VIEW items
AS
  SELECT
    id,
    random_id,
    plaid_item_id,
    organization_id,
    plaid_access_token,
    plaid_institution_id,
    status,
    created_at,
    updated_at
  FROM
    items_table;


-- -- ASSETS
-- -- This table is used to store the assets associated with each user. The view returns the same data
-- -- as the table, we're just using both to maintain consistency with our other tables.

CREATE TABLE if not exists assets_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  organization_id integer REFERENCES organizations_table(id) ON DELETE CASCADE,
  value numeric(28,2),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TRIGGER assets_updated_at_timestamp
BEFORE UPDATE ON assets_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE VIEW assets
AS
  SELECT
    id,
    random_id,
    organization_id,
    value,
    description,
    created_at,
    updated_at
  FROM
    assets_table;

CREATE TABLE if not exists liabilities_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  organization_id integer REFERENCES organizations_table(id) ON DELETE CASCADE,
  value numeric(28,2),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TRIGGER liabilities_updated_at_timestamp
BEFORE UPDATE ON liabilities_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE VIEW liabilities
AS
  SELECT
    id,
    random_id,
    organization_id,
    value,
    description,
    created_at,
    updated_at
  FROM
    liabilities_table;




-- ACCOUNTS
-- This table is used to store the accounts associated with each item. The view returns all the
-- data from the accounts table and some data from the items view. For more info on the Plaid
-- Accounts schema, see the docs page:  https://plaid.com/docs/#account-schema

CREATE TABLE if not exists accounts_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  item_id integer REFERENCES items_table(id) ON DELETE CASCADE,
  plaid_account_id text UNIQUE NOT NULL,
  name text NOT NULL,
  mask text NOT NULL,
  official_name text,
  current_balance numeric(28,10),
  available_balance numeric(28,10),
  iso_currency_code text,
  unofficial_currency_code text,
  type text NOT NULL,
  subtype text NOT NULL,
  deleted boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TRIGGER accounts_updated_at_timestamp
BEFORE UPDATE ON accounts_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

drop view accounts cascade;
CREATE VIEW accounts AS 
  SELECT a.id,
    a.random_id,
    a.plaid_account_id,
    a.item_id,
    i.plaid_item_id,
    i.plaid_institution_id,
    i.organization_id,
    a.name,
    a.mask,
    a.official_name,
    a.current_balance,
    a.available_balance,
    a.iso_currency_code,
    a.unofficial_currency_code,
    a.type,
    a.subtype,
    a.created_at,
    a.updated_at,
    ins.logo,
    ins.primary_color,
    a.deleted
  FROM accounts_table a
    LEFT JOIN items_table i ON i.id = a.item_id
    LEFT JOIN institutions_table ins on ins.plaid_institution_id=i.plaid_institution_id;


-- TRANSACTIONS
-- This table is used to store the transactions associated with each account. The view returns all
-- the data from the transactions table and some data from the accounts view. For more info on the
-- Plaid Transactions schema, see the docs page: https://plaid.com/docs/#transaction-schema

CREATE TABLE if not exists transactions_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  account_id integer REFERENCES accounts_table(id) ON DELETE CASCADE,
  plaid_transaction_id text UNIQUE NOT NULL,
  plaid_category_id text,
  category text,
  subcategory text,
  type text NOT NULL,
  name text NOT NULL,
  amount numeric(28,10) NOT NULL,
  iso_currency_code text,
  unofficial_currency_code text,
  date date NOT NULL,
  pending boolean NOT NULL,
  account_owner text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TRIGGER transactions_updated_at_timestamp
BEFORE UPDATE ON transactions_table
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

drop view transactions cascade;
CREATE VIEW transactions
AS
  SELECT
    t.id,
    t.random_id,
    t.plaid_transaction_id,
    t.account_id,
    a.plaid_account_id,
    a.item_id,
    a.plaid_item_id,
    a.organization_id,
    t.category,
    t.subcategory,
    t.type,
    t.name,
    t.amount,
    t.iso_currency_code,
    t.unofficial_currency_code,
    t.date,
    t.pending,
    t.account_owner,
    t.created_at,
    t.updated_at
  FROM
    transactions_table t
    LEFT JOIN accounts a ON t.account_id = a.id;


-- The link_events_table is used to log responses from the Plaid API for client requests to the
-- Plaid Link client. This information is useful for troubleshooting.

CREATE TABLE if not exists link_events_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  type text NOT NULL,
  user_id integer,
  link_session_id text,
  request_id text UNIQUE,
  error_type text,
  error_code text,
  status text,
  created_at timestamptz default now()
);


-- The plaid_api_events_table is used to log responses from the Plaid API for server requests to
-- the Plaid client. This information is useful for troubleshooting.

CREATE TABLE if not exists plaid_api_events_table
(
  id SERIAL PRIMARY KEY,
  random_id integer,
  item_id integer,
  user_id integer,
  plaid_method text NOT NULL,
  arguments text,
  request_id text UNIQUE,
  error_type text,
  error_code text,
  created_at timestamptz default now()
);




-- CREATE TABLE groups
-- (
--   id SERIAL PRIMARY KEY,
--   name text UNIQUE,
--   owner integer NOT NULL,
--   organization integer.
--   subject_id integer,
--   constraint fk_subjects
--     foreign key(subject_id)
--       references subjects(id)
-- )

-- CREATE TABLE permissions
-- (
--   id SERIAL PRIMARY KEY,
--   subject text NOT NULL, 
--   object text NOT NULL, 
--   verb text NOT NULL, 
--   context text,
--   constraint fk_subject_id
--     foreign key(subject)
--     references subjects(id)
-- )

-- create table subjects
-- (
--   id SERIAL PRIMARY KEY,
--   type text NOT NULL,
--   host_id int
-- )

-- create table group_memberships
-- (
--   user_id int,
--   group_id int,
--   constraint fk_user_id
--     foreign key(user_id)
--     references users_table(id)
--   constraint fk_group_id
--     foreign key(group_id)
--     references groups(id)
-- )

create table organization_memberships
(
  id SERIAL PRIMARY KEY,
  user_id int not null references users_table(id) on DELETE CASCADE,
  organization_id int not null references organizations_table(id) on DELETE CASCADE,
  membership_type text
);

create table if not exists institutions_table
(
  id SERIAL PRIMARY KEY,
  plaid_institution_id text unique not null,
  name text not null,
  products text,
  country_codes text,
  url text,
  logo bytea,
  primary_color text,
  routing_numbers text,
  status text
);