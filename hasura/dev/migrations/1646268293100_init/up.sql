SET check_function_bodies = false;
CREATE TABLE public.items (
    mint text NOT NULL,
    metadata json NOT NULL,
    is_listed boolean DEFAULT false NOT NULL,
    price double precision DEFAULT '0'::double precision,
    allow_offers boolean DEFAULT true NOT NULL,
    current_owner text,
    type text NOT NULL,
    in_rem boolean DEFAULT false NOT NULL
);
CREATE TABLE public.missions (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    reward double precision DEFAULT 0 NOT NULL,
    wallet text DEFAULT now() NOT NULL,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    extract_at timestamp without time zone DEFAULT now() NOT NULL,
    transactions json,
    mints json,
    status text DEFAULT 'staking'::text NOT NULL,
    type text
);
ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (mint);
ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_pkey PRIMARY KEY (id);
