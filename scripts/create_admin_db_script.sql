-- Database: postgres

-- DROP DATABASE postgres;

CREATE DATABASE postgres
    WITH 
    OWNER = azure_superuser
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

COMMENT ON DATABASE postgres
    IS 'default administrative connection database';

-- Table: public.clientTable
-- DROP TABLE public."clientTable";

CREATE TABLE public."clientTable"
(
    client_name text COLLATE pg_catalog."default" NOT NULL,
    client_permissions json,
    client_children integer[],
    client_id integer NOT NULL DEFAULT nextval('"clientTable_client_id_seq"'::regclass),
    CONSTRAINT "clientTable_pkey" PRIMARY KEY (client_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."clientTable"
    OWNER to "MO4Admin";

-- Table: public.userPermissionTable

-- DROP TABLE public."userPermissionTable";

CREATE TABLE public."userPermissionTable"
(
    user_id integer NOT NULL DEFAULT nextval('"userPermissionTable_user_id_seq"'::regclass),
    admin boolean NOT NULL,
    user_read boolean NOT NULL,
    demo boolean NOT NULL,
    user_manage boolean NOT NULL,
    twa json,
    dpr json,
    longterm json,
    user_type text COLLATE pg_catalog."default" NOT NULL,
    forecast json,
    user_see_all_vessels_client boolean,
    CONSTRAINT "userPermissionTable_pkey" PRIMARY KEY (user_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."userPermissionTable"
    OWNER to "MO4Admin";

-- Table: public.userSettingsTable

-- DROP TABLE public."userSettingsTable";

CREATE TABLE public."userSettingsTable"
(
    user_id integer NOT NULL DEFAULT nextval('usersettingstable_id_seq'::regclass),
    unit json,
    longterm json,
    weather_chart json,
    timezone json,
    dpr json,
    CONSTRAINT usersettingstable_pkey PRIMARY KEY (user_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."userSettingsTable"
    OWNER to "MO4Admin";
    
-- Table: public.userTable

-- DROP TABLE public."userTable";

CREATE TABLE public."userTable"
(
    username text COLLATE pg_catalog."default" NOT NULL,
    user_id integer NOT NULL DEFAULT nextval('"userTable_userID_seq"'::regclass),
    secret2fa text COLLATE pg_catalog."default",
    active boolean NOT NULL,
    vessel_ids integer[],
    password text COLLATE pg_catalog."default",
    requires2fa boolean NOT NULL,
    token text COLLATE pg_catalog."default",
    client_id integer NOT NULL,
    last_active text COLLATE pg_catalog."default",
    demo_project_id integer,
    demo_expiration_date text COLLATE pg_catalog."default",
    CONSTRAINT "userTable_pkey" PRIMARY KEY (user_id),
    CONSTRAINT "Unique usernames" UNIQUE (username)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."userTable"
    OWNER to "MO4Admin";
    
-- Table: public.vesselTable

-- DROP TABLE public."vesselTable";

CREATE TABLE public."vesselTable"
(
    vessel_id integer NOT NULL DEFAULT nextval('"userTable_userID_seq"'::regclass),
    operations_class text COLLATE pg_catalog."default" NOT NULL,
    mmsi integer NOT NULL,
    vessel_permissions json,
    client_ids integer[],
    nicename text COLLATE pg_catalog."default",
    start_date text COLLATE pg_catalog."default",
    stop_date text COLLATE pg_catalog."default",
    active boolean,
    CONSTRAINT "vesselTable_pkey" PRIMARY KEY (vessel_id),
    CONSTRAINT "mmsiShouldBeUnique" UNIQUE (mmsi)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."vesselTable"
    OWNER to "MO4Admin";