--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0
-- Dumped by pg_dump version 17.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applications (
    application_id integer NOT NULL,
    job_id integer,
    user_id integer,
    cv character varying(255),
    cover_letter character varying(255),
    status character varying(50) NOT NULL,
    score integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    certificates text,
    CONSTRAINT applications_status_check CHECK (((status)::text = ANY ((ARRAY['reviewed'::character varying, 'invited_for_interview'::character varying, 'applied'::character varying, 'accepted'::character varying, 'rejected'::character varying, 'shortlisted'::character varying])::text[])))
);


ALTER TABLE public.applications OWNER TO postgres;

--
-- Name: applications_application_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applications_application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applications_application_id_seq OWNER TO postgres;

--
-- Name: applications_application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applications_application_id_seq OWNED BY public.applications.application_id;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    application_id integer NOT NULL,
    admin_id integer NOT NULL,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comments OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO postgres;

--
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id integer NOT NULL,
    application_id integer NOT NULL,
    date_time timestamp without time zone NOT NULL,
    location character varying(255),
    created_by integer NOT NULL,
    status character varying(255) DEFAULT 'pending'::character varying NOT NULL
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.interviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.interviews_id_seq OWNER TO postgres;

--
-- Name: interviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.interviews_id_seq OWNED BY public.interviews.id;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    job_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    requirements text,
    deadline date,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(20) NOT NULL,
    required_fields text,
    CONSTRAINT jobs_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'archived'::character varying])::text[])))
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- Name: jobs_job_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_job_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_job_id_seq OWNER TO postgres;

--
-- Name: jobs_job_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_job_id_seq OWNED BY public.jobs.job_id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    recipient_id integer NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_manual boolean DEFAULT true,
    sender_id integer,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['invited for interview'::character varying, 'rejected'::character varying, 'accepted'::character varying, 'applied for job'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: user_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_messages (
    id integer NOT NULL,
    user_id integer NOT NULL,
    text text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    recipient_id integer,
    is_read boolean DEFAULT false,
    sender_id integer
);


ALTER TABLE public.user_messages OWNER TO postgres;

--
-- Name: user_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_messages_id_seq OWNER TO postgres;

--
-- Name: user_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_messages_id_seq OWNED BY public.user_messages.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    experience text,
    education text,
    skills text,
    cv character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'user'::character varying, 'super_admin'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: applications application_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications ALTER COLUMN application_id SET DEFAULT nextval('public.applications_application_id_seq'::regclass);


--
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- Name: interviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews ALTER COLUMN id SET DEFAULT nextval('public.interviews_id_seq'::regclass);


--
-- Name: jobs job_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN job_id SET DEFAULT nextval('public.jobs_job_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: user_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages ALTER COLUMN id SET DEFAULT nextval('public.user_messages_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applications (application_id, job_id, user_id, cv, cover_letter, status, score, created_at, certificates) FROM stdin;
126	70	51	uploads/1735845357938.pdf	eaea	invited_for_interview	\N	2025-01-03 17:56:03.643686	\N
87	70	5	uploads/1735162596955.pdf	flsgspognsG	accepted	7	2024-12-28 12:41:58.30328	\N
110	49	51	\N	\N	rejected	\N	2025-01-02 20:15:27.356818	\N
161	85	69	uploads/1736518442972.pdf	pismo	accepted	7	2025-01-10 15:15:31.691338	1736518531657-2024-2025 Specifikacije za projekat Node.js - HRM.pdf
154	51	63	uploads/1736110446224.pdf	\N	applied	\N	2025-01-07 19:11:02.755687	\N
157	49	61	uploads/1736098530874.pdf	\N	applied	\N	2025-01-07 19:13:47.899666	\N
92	73	5	uploads/1735162596955.pdf	\N	invited_for_interview	5	2024-12-28 18:41:07.198144	\N
74	73	4	uploads/1735150171149.pdf	\N	rejected	8	2024-12-27 16:10:44.266004	\N
83	69	4	uploads/1735150171149.pdf	ovo je motivaciono pismo	accepted	4	2024-12-28 02:14:04.272471	587ab183e0814fd5b28ce1fb7ac8ace7
158	88	69	\N	\N	applied	\N	2025-01-10 15:13:20.289889	\N
141	63	4	uploads/1735150171149.pdf	\N	accepted	\N	2025-01-07 14:10:25.040158	\N
99	61	4	uploads/1735150171149.pdf	\N	accepted	\N	2025-01-02 18:32:34.606525	\N
84	74	4	uploads/1735150171149.pdf	kr4tjrogihrjhtrmbjkrtjnjtijobtnmlnkl	rejected	\N	2024-12-28 11:35:04.368836	9d734d6301b3a31098f36076bd13410e
159	87	69	uploads/1736518442972.pdf	\N	applied	\N	2025-01-10 15:14:33.087379	\N
160	86	69	uploads/1736518442972.pdf	ovo je motivaciono pismo	invited_for_interview	\N	2025-01-10 15:15:00.735662	\N
112	73	51	uploads/1735845357938.pdf	\N	rejected	10	2025-01-02 20:16:05.956817	\N
16	58	4	uploads/1734543508132.pdf	\N	accepted	3	2024-12-25 14:33:03.066325	\N
13	49	4	uploads/1734543508132.pdf	\N	accepted	3	2024-12-20 18:28:26.084441	\N
15	53	4	uploads/1734543508132.pdf	\N	rejected	\N	2024-12-25 14:05:56.658596	\N
72	71	4	uploads/1735150171149.pdf	\N	accepted	\N	2024-12-27 15:35:38.230097	\N
130	61	61	uploads/1735924060591.pdf	\N	applied	\N	2025-01-03 18:17:17.436878	\N
142	73	63	uploads/1736110446224.pdf	\N	applied	\N	2025-01-07 14:21:04.569355	\N
143	72	63	uploads/1736110446224.pdf	\N	applied	\N	2025-01-07 14:21:06.308946	\N
59	72	5	uploads/1735162596955.pdf	\N	accepted	7	2024-12-26 15:51:57.318275	\N
147	52	63	uploads/1736110446224.pdf	\N	accepted	\N	2025-01-07 14:21:16.460303	\N
82	72	4	uploads/1735150171149.pdf	\N	rejected	6	2024-12-28 02:06:54.047728	\N
135	80	4	uploads/1735150171149.pdf	\N	applied	\N	2025-01-05 21:54:33.61312	\N
138	71	63	uploads/1736110446224.pdf	\N	applied	\N	2025-01-07 10:56:08.683751	\N
111	53	51	\N	\N	rejected	\N	2025-01-02 20:15:32.903685	\N
145	61	63	uploads/1736110446224.pdf	\N	applied	4	2025-01-07 14:21:12.12432	\N
144	63	63	uploads/1736110446224.pdf	\N	accepted	10	2025-01-07 14:21:10.294638	\N
137	80	63	uploads/1736110446224.pdf	\N	rejected	\N	2025-01-05 22:10:17.519238	\N
146	53	63	uploads/1736110446224.pdf	\N	rejected	\N	2025-01-07 14:21:15.023568	\N
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comments (id, application_id, admin_id, comment, created_at) FROM stdin;
4	13	1	babara boba dagara	2024-12-20 23:13:03.777624
7	13	1	aidoad	2024-12-20 23:24:10.878998
9	13	6	titoooepaečkopd	2024-12-20 23:59:08.047941
14	13	1	abee	2024-12-21 11:17:18.756442
22	13	1	euauea	2024-12-24 12:32:57.039374
6	13	1	babarabobadagaraaa	2024-12-20 23:18:36.480736
24	83	1	eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeaaaaaaaaaaaaaaaaaaaaaaaaaaauuuuuuuuuuuuuuuu	2024-12-29 18:08:04.991926
25	16	1	komentar	2024-12-29 21:49:17.356189
27	16	1	ovo je komentar na tvoj posao	2024-12-30 22:27:28.428926
28	59	1	komentar	2025-01-02 20:01:57.711085
29	126	1	komentar. tacka.	2025-01-03 19:07:11.182024
21	13	6	dadafafsgsss	2024-12-21 11:38:22.643023
30	74	1	halid beslic	2025-01-03 19:33:22.530391
35	92	1	kjnzhjozmnmi	2025-01-05 16:45:23.057828
36	92	1		2025-01-05 16:45:24.072465
37	74	1	komentarrrr	2025-01-05 16:51:29.773142
38	82	1	CR7	2025-01-05 16:52:31.461528
40	83	1	zorq	2025-01-05 17:00:41.756038
44	74	1	probaaaaaa	2025-01-05 17:04:43.961913
47	161	1	komentar	2025-01-10 15:21:12.202268
\.


--
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, application_id, date_time, location, created_by, status) FROM stdin;
1	13	2024-12-24 08:55:00	Sarajevo	1	pending
4	72	2025-01-01 16:59:00	Bihać	1	pending
6	59	2024-12-27 17:29:00	Amsterdam	1	pending
57	92	2025-02-06 19:34:00	Visoko	1	pending
61	112	2025-02-05 19:43:00	Sarajevo	1	confirmed
60	110	2025-02-13 19:41:00	Sarajevo	1	confirmed
12	84	2025-01-11 12:45:00	Amsterdam	1	confirmed
2	82	2025-01-02 11:27:00	Travnik	1	confirmed
59	99	2025-02-05 19:40:00	Zenica	1	confirmed
46	141	2025-02-06 15:15:00	Sarajevo	1	confirmed
14	83	2025-01-11 16:39:00	Bihać	1	declined
15	82	2025-01-04 16:39:00	Amsterdam	1	confirmed
62	126	2025-02-28 13:01:00	Zenica	1	pending
16	74	2025-01-09 16:40:00	Visoko	1	declined
64	161	2025-02-05 15:23:00	Sarajevo	1	confirmed
34	111	2025-02-21 13:09:00	Zenica	1	pending
20	83	2024-12-25 18:36:00	Visoko	1	confirmed
17	74	2025-01-01 17:15:00	Zenica	1	confirmed
31	137	2025-02-20 12:53:00	Visoko	1	confirmed
32	137	2025-02-20 12:53:00	Visoko	1	confirmed
36	147	2025-02-05 14:22:00	Travnik	1	declined
63	160	2025-02-07 15:22:00	Visoko	1	declined
37	147	2025-01-22 14:26:00	Sarajevo	1	declined
39	144	2025-02-06 14:27:00	Travnik	1	declined
38	146	2025-01-30 14:27:00	Visoko	1	confirmed
40	144	2025-01-23 14:29:00	Bihać	1	declined
65	160	2025-02-12 15:31:00	Bihać	1	declined
41	144	2025-01-22 14:31:00	Visoko	1	declined
42	144	2025-03-05 14:32:00	Amsterdam	1	confirmed
43	147	2025-02-05 14:34:00	Sarajevo	1	pending
66	160	2025-02-04 15:33:00	Sarajevo	1	pending
25	110	2025-01-22 16:19:00	Zenica	1	declined
54	87	2025-01-22 19:15:00	Sarajevo	1	confirmed
53	87	2025-01-22 19:15:00	Sarajevo	1	declined
55	87	2025-02-13 19:16:00	Zenica	1	confirmed
\.


--
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (job_id, title, description, requirements, deadline, created_by, created_at, status, required_fields) FROM stdin;
87	HRM - kreiranje posla - samo cv	cc	cc	2025-02-05	1	2025-01-10 15:08:28.865863	active	cv
88	HRM - kreiranje posla bez uslova	cc	cc	2025-01-27	1	2025-01-10 15:08:45.048844	active	
12	Programer	programing	eaeaea	2024-12-16	\N	2024-12-15 15:24:26.028098	archived	\N
58	Posaoooooooooooooooooooooooo	rwjejeg	lkskgsjgsjgs	2024-12-31	1	2024-12-25 13:35:16.358683	archived	\N
49	automehanicar	mehanika	oprema	2024-12-20	1	2024-12-18 19:10:03.500834	active	\N
13	menadzer	mmmmmmmmmmmmmmmm	eeeeeeeeeeeeeeeeeeeeeeee	2024-12-16	\N	2024-12-15 15:29:23.438056	archived	\N
51	medicinska sestra	ekajoaajkfjo	agrafbsjhgfsbvdjf	2024-12-21	1	2024-12-18 19:41:00.685035	active	\N
52	Vodoinstalater	raraa	ewklrjfighegehg	2024-12-23	6	2024-12-20 23:40:16.496939	active	\N
53	bravar	rkajrjaofo	wijgjwgjogeoj	2024-12-25	1	2024-12-25 11:49:22.229359	active	\N
63	amsterdam	dkajdioadaf	fsmfslkjfshf	2024-12-22	1	2024-12-25 14:55:24.541376	active	\N
54	postar	gjahfsgsghei	fhsfsnfshfsj	2024-12-28	1	2024-12-25 11:57:11.188994	archived	\N
69	Vozac	voznja	volan	2024-12-27	1	2024-12-25 22:02:24.886279	active	cv,cover_letter,certificates
70	Dostavljac	dostavljanje	dostava	2025-01-02	1	2024-12-25 22:03:06.136305	active	cv,cover_letter
71	mjesalica	dada	dada	2025-01-08	1	2024-12-25 22:03:21.327374	active	
72	Pekar	sjgghdkgdhg	gdnbdjghdghdku	2024-12-31	1	2024-12-26 15:49:48.65971	active	cv
73	apotekar	afaf	gdhfhfhj	2025-05-14	1	2024-12-27 11:15:22.113275	active	cv
75	auto limar	limarija	lim	2025-02-06	1	2025-01-02 17:22:35.322052	active	cv,cover_letter,certificates
76	Vozac autobusa	vozac	autobusa	2025-02-08	1	2025-01-02 17:40:40.958508	active	cv,cover_letter,certificates
74	Veterinar	eaewrlwpfkpegkrgrlmrlfmbgfngjnkgk	slgjdrklgjidbkfkjbnfbjliugjugjibnmibjufkbfolmias	2025-03-04	1	2024-12-27 15:04:46.227452	archived	cv,cover_letter,certificates
61	sumar	alekpakfspofkčlsfkpokdf	nbfnbkfbjkfbkjfbfkj	2024-12-23	1	2024-12-25 14:10:38.52857	active	\N
80	Drvosjeca	drvo	motorka	2025-05-14	1	2025-01-05 14:52:19.914574	active	
77	Elektricar	ealkfiahgap	fwlfčkegkegpeb	2025-04-17	1	2025-01-02 18:27:34.386614	active	cv,cover_letter,certificates
82	HRM test kreiranja posla sa taženim uslovima	Opis posla	Opis posla	2025-02-25	1	2025-01-10 14:38:27.766415	active	cv,cover_letter,certificates
85	HRM - test kreiranja posla sa svim zahtjevima	deskripcija	req	2025-02-12	1	2025-01-10 15:07:05.794615	active	cv,cover_letter,certificates
86	HRM - kreiranje posla cv i motivacinoo pismo	uuu	ggg	2025-01-29	1	2025-01-10 15:08:05.198899	active	cv,cover_letter
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, recipient_id, message, type, created_at, is_manual, sender_id) FROM stdin;
24	4	ovo je test poruke	invited for interview	2024-12-31 00:11:04.446664	t	\N
25	4	testiranje poruke	invited for interview	2024-12-31 00:18:54.723029	t	\N
26	4	testiranje poruke	invited for interview	2024-12-31 00:19:18.29479	t	\N
27	4	probaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa	invited for interview	2024-12-31 00:24:39.370586	t	\N
28	4	aleleelelelleleleleelelelel	invited for interview	2024-12-31 11:43:32.401725	t	\N
29	4	tututututtutuutututuutut	invited for interview	2024-12-31 11:45:16.59479	t	\N
30	4	earstgtrhnhtjtn	invited for interview	2024-12-31 11:49:16.936731	t	\N
31	4	tutututututu	invited for interview	2024-12-31 11:53:12.373296	t	\N
32	4	tuturutu	invited for interview	2024-12-31 12:01:12.469699	t	\N
33	4	tuturututtu	invited for interview	2024-12-31 12:04:51.764487	t	\N
34	4	ronaldo	invited for interview	2024-12-31 13:17:53.449649	t	\N
35	4	messsi	invited for interview	2024-12-31 13:23:58.223655	t	\N
36	4	dzeko	invited for interview	2024-12-31 13:30:13.96847	t	\N
37	4	porukaaaaa	invited for interview	2024-12-31 14:11:08.439181	t	\N
39	4	eararara	invited for interview	2024-12-31 14:59:44.521239	t	\N
40	4	sta ima	invited for interview	2024-12-31 15:00:13.788564	t	\N
41	4	meeeeeeeeeeeeeeeeeeeeessssssssssssssssssssaaaaaaaaaaaaaaaaaaggggggggggggggggeeeeeeeeeeeeeeeeeeeee	invited for interview	2024-12-31 15:02:35.053273	t	\N
45	4	edin dzekoooOOOOO	accepted	2024-12-31 16:42:03.348587	t	\N
46	4	ovo je test	applied for job	2024-12-31 16:52:42.647754	t	\N
47	4	445454545554534	accepted	2024-12-31 16:59:14.91805	t	\N
48	4	abeecede	rejected	2024-12-31 17:09:22.235138	t	\N
49	4	testingggggggggggggggggggggggggggggg	invited for interview	2024-12-31 17:39:05.78252	t	\N
50	4	oo sta ima kako si	accepted	2024-12-31 17:54:44.792978	t	\N
51	4	olalalalalaal	invited for interview	2024-12-31 17:59:57.261272	t	6
58	69	ovo je test poruke	invited for interview	2025-01-10 15:26:06.06568	t	1
\.


--
-- Data for Name: user_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_messages (id, user_id, text, created_at, recipient_id, is_read, sender_id) FROM stdin;
1	1	eee sta mai	2025-01-04 16:48:09.277667	\N	f	\N
2	4	eee sta mai	2025-01-04 17:07:16.655376	\N	f	\N
3	1	ee djesi kako si	2025-01-04 17:08:11.920089	\N	f	\N
4	1	eee sta mai	2025-01-04 17:23:16.716111	\N	f	\N
5	1	kako ide	2025-01-04 17:23:48.091622	\N	f	\N
6	4	kako si, sta ima, sta se radi	2025-01-04 17:25:28.981518	\N	f	\N
11	1	Conversation started.	2025-01-04 18:11:52.425729	4	f	\N
12	1	Conversation started.	2025-01-04 18:12:04.060923	4	f	\N
13	1	Conversation started.	2025-01-04 18:15:11.69529	4	f	\N
14	1	sta ima kako ide	2025-01-04 18:15:21.344541	4	f	\N
15	4	evo dobro je	2025-01-04 18:15:51.78365	1	f	\N
16	4	kako kod tebe	2025-01-04 18:15:58.135881	1	f	\N
17	4	eee sta mai	2025-01-04 18:27:52.015195	1	f	\N
18	4	eaea	2025-01-04 18:34:58.354644	1	f	\N
19	4	Conversation started.	2025-01-04 18:36:02.569143	5	f	\N
20	4	poruka	2025-01-04 18:36:09.556411	5	f	\N
21	4	dobro je kako si	2025-01-04 18:39:51.399429	5	f	\N
22	1	Conversation started.	2025-01-04 18:40:24.960879	5	f	\N
23	1	dje si	2025-01-04 18:40:31.926042	5	f	\N
24	5	roki	2025-01-04 18:45:11.613247	4	f	5
27	4	dje si, potjeraj onog golfa svog	2025-01-04 18:53:59.119644	1	f	4
28	4	kako si	2025-01-04 18:54:30.930093	5	f	4
33	1	Conversation started.	2025-01-04 19:03:15.053767	51	f	\N
37	51	Conversation started.	2025-01-04 19:22:41.719807	1	f	\N
38	51	Conversation started.	2025-01-04 19:22:57.39335	4	f	\N
39	51	aaaaaaaaaaaaaa	2025-01-04 19:23:04.459146	4	f	51
40	51	ooo	2025-01-04 19:23:23.169447	4	f	51
41	1	Conversation started.	2025-01-04 19:38:57.209366	61	f	\N
48	1	Conversation started.	2025-01-04 19:40:18.589214	4	f	\N
49	1	Conversation started.	2025-01-04 19:47:55.873325	6	f	\N
51	1	oo	2025-01-04 20:12:05.806882	4	f	1
52	1	You have started a conversation with this user.	2025-01-04 20:15:37.472373	48	f	1
53	48	This user has started a conversation with you.	2025-01-04 20:15:37.472373	1	f	1
54	5	šta ima kako si	2025-01-04 20:28:31.676221	1	f	5
56	63	Conversation started.	2025-01-07 12:32:33.446032	4	f	\N
57	69	Conversation started.	2025-01-10 15:27:36.008567	1	f	\N
58	69	Šta ima kako si	2025-01-10 15:27:44.037816	1	f	69
59	69	Conversation started.	2025-01-10 15:27:53.406554	4	f	\N
61	1	Evo me, šta ima kod tebe	2025-01-10 15:28:30.32728	69	f	1
29	1	Conversation started.	2025-01-04 18:59:26.410703	\N	f	\N
30	1	Kaš doć za ona drva?	2025-01-04 18:59:41.625772	\N	f	1
31	1	Jesam ti plOtio?	2025-01-04 18:59:52.205161	\N	f	1
34	1	JESAM TI PLOOOOOOTIOOOOO?	2025-01-04 19:09:25.053415	\N	f	1
43	1	e	2025-01-04 19:39:58.311236	\N	f	1
44	1	e	2025-01-04 19:39:59.030347	\N	f	1
45	1	e	2025-01-04 19:39:59.333438	\N	f	1
46	1	e	2025-01-04 19:39:59.594799	\N	f	1
47	1	e	2025-01-04 19:40:00.862699	\N	f	1
50	1	Conversation started.	2025-01-04 19:50:01.162522	\N	f	\N
55	1	eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee	2025-01-04 21:14:30.672102	\N	f	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password, first_name, last_name, role, created_at, experience, education, skills, cv) FROM stdin;
1	harun@example.com	$2b$10$0f7QHAWE9dAuVo938iZGk.hMGkkyblBDIeCkY3QKtEzjt.isrVnqe	Harun	Hasagić	super_admin	2024-12-12 09:56:20.669108	\N	\N	\N	\N
61	merso@example.com	$2b$10$WcC7dIoNikX2G42gGG4b9O2He6xAWR1xCjpTF4JNeI2SkSlGDm81e	Merso	Mersooo	user	2025-01-03 18:05:58.589526	ovo je moj expirinece	rehrjjz	sgdh	uploads/1736098530874.pdf
69	test@example.com	$2b$10$cfsvndK1nLqyIEjdYWwmCOIGrvxLY0S/aDC3kDhzWxI2DDeDecRp6	test	testt	user	2025-01-10 15:03:03.268291	my expirience	my education	my skills	uploads/1736518442972.pdf
4	proba@example.com	$2b$10$f7p9v9oJOuFofhfHEcVcXe3a6mQO2jIsW87y96tQxZGVfBDM0T3B2	Proba	Probaa	user	2024-12-13 16:07:27.953086	no exp	testing	testing	uploads/1735150171149.pdf
5	hrmuser@example.com	$2b$10$S.yx51RjYBlKrY6cOQEjpeRnOtqnVvcUtmSKSxFbVE4oBOxKqKaZe	hrmuser	hrmuserr	user	2024-12-13 16:08:17.720515	rerfwrw	rewrwrw	rwrwrrwrw	uploads/1735162596955.pdf
48	example@example.com	$2b$10$6cYwnDNG4vEkFbsTnmITVu.WSqcr3NvPjh5HX.USSyWMtJbnRIqzm	Example	Example	user	2024-12-26 11:05:08.185043	\N	\N	\N	\N
6	korisnik@example.com	$2b$10$KYQU68nOCJeso14DvX3W6eXQqV50MszslH43sU3tjiJ1PbXZwdF02	Korisnik	Korisnikk	admin	2024-12-13 16:45:53.08158	\N	\N	\N	\N
51	mirso@example.com	$2b$10$Up8kbXrKJr0Z/3hT.DLJKujptd25snHjXHI8.2d/RLhOtYz2ao13u	Mirsad	Mirso	user	2025-01-01 20:40:38.261227	eeedddflwopkf	eatč,atlm	tatatasta	uploads/1735845357938.pdf
63	proba2620@gmail.com	Google_OAuth	Proba	Unknown	user	2025-01-05 21:11:15.417217	exp	edu	skills	uploads/1736110446224.pdf
\.


--
-- Name: applications_application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applications_application_id_seq', 161, true);


--
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.comments_id_seq', 47, true);


--
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interviews_id_seq', 66, true);


--
-- Name: jobs_job_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_job_id_seq', 88, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 58, true);


--
-- Name: user_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_messages_id_seq', 61, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 69, true);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (application_id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (job_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: user_messages user_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT user_messages_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: applications applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(job_id) ON DELETE CASCADE;


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: comments comments_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id);


--
-- Name: comments comments_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(application_id) ON DELETE CASCADE;


--
-- Name: interviews interviews_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_application_id_fkey FOREIGN KEY (application_id) REFERENCES public.applications(application_id) ON DELETE CASCADE;


--
-- Name: interviews interviews_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: jobs jobs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: notifications notifications_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(user_id);


--
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: user_messages user_messages_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT user_messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(user_id) ON DELETE SET NULL;


--
-- Name: user_messages user_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT user_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: user_messages user_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_messages
    ADD CONSTRAINT user_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

