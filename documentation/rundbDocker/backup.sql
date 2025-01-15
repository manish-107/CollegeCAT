DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS role_enum;

--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (Debian 16.3-1.pgdg120+1)
-- Dumped by pg_dump version 16.3 (Debian 16.3-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: role_enum; Type: TYPE; Schema: public; Owner: demouser
--

CREATE TYPE public.role_enum AS ENUM (
    'HOD',
    'Timetable Coordinator',
    'Lecturer'
);


ALTER TYPE public.role_enum OWNER TO demouser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: public; Owner: demouser
--

CREATE TABLE public.users (
    userid character varying(50) NOT NULL,
    user_name character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(100) NOT NULL,
    role public.role_enum NOT NULL,
    seniority_year integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO demouser;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: demouser
--

COPY public.users (userid, user_name, email, password, role, seniority_year, created_at) FROM stdin;
\.


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: demouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: demouser
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (userid);


--
-- PostgreSQL database dump complete
--

