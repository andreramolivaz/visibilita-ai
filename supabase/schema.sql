-- Schema iniziale. Da eseguire nell'editor SQL di Supabase.
-- Gli utenti stanno in auth.users (accesso con link magico, niente password).

create extension if not exists "pgcrypto";

-- Abbonamenti, scritti dal webhook Stripe con la chiave di servizio.
create table if not exists abbonamenti (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  piano text not null check (piano in ('base', 'pro', 'agenzia')),
  periodo text not null check (periodo in ('mensile', 'annuale')),
  stato text not null,
  rinnovo_il timestamptz,
  report_id text,
  disdetto_il timestamptz,
  creato_il timestamptz not null default now(),
  aggiornato_il timestamptz not null default now()
);
create index if not exists abbonamenti_email_idx on abbonamenti (lower(email));

-- Attività seguite (una per Base e Pro, dieci per Agenzia).
create table if not exists attivita (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  nome text not null,
  citta text not null,
  google_place_id text,
  profilo jsonb not null default '{}'::jsonb,   -- ProfiloAttivita
  domande jsonb not null default '[]'::jsonb,   -- Domanda[]
  creato_il timestamptz not null default now()
);
create index if not exists attivita_email_idx on attivita (lower(email));

-- Report prodotti dalle scansioni. `dati` è il Report completo in JSON.
create table if not exists report (
  id text primary key,                          -- es. "scan-abc123", usato nel link
  attivita_id uuid references attivita (id) on delete cascade,
  email text,
  punteggio int not null,
  verdetto text not null,
  dati jsonb not null,
  creato_il timestamptz not null default now()
);
create index if not exists report_attivita_idx on report (attivita_id, creato_il desc);

-- Pesi dei motori: si aggiornano ogni trimestre senza rilascio.
create table if not exists motori (
  id text primary key,
  nome text not null,
  utenti_mln numeric not null,
  peso numeric not null,
  fase text not null check (fase in ('mvp', 'v2', 'v3')),
  attivo boolean not null default true
);
insert into motori (id, nome, utenti_mln, peso, fase) values
  ('chatgpt', 'ChatGPT', 9.6, 0.30, 'mvp'),
  ('gemini', 'Gemini', 9.4, 0.25, 'mvp'),
  ('google-ai', 'Google AI', 20, 0.20, 'mvp'),
  ('copilot', 'Copilot', 2.4, 0.08, 'v2'),
  ('claude', 'Claude', 1.8, 0.07, 'v2'),
  ('meta-ai', 'Meta AI', 1.6, 0.05, 'v3'),
  ('perplexity', 'Perplexity', 1.0, 0.04, 'v2'),
  ('grok', 'Grok', 0.5, 0.01, 'v3')
on conflict (id) do nothing;

-- Cache delle risposte: stessa domanda, città e motore per 7 giorni.
create table if not exists risposte_cache (
  chiave text primary key,                      -- hash(motore + domanda + città)
  risposta jsonb not null,
  creato_il timestamptz not null default now()
);

-- Test gratuiti: uno per attività ogni 30 giorni, massimo 100 al giorno.
create table if not exists test_gratuiti (
  id uuid primary key default gen_random_uuid(),
  google_place_id text,
  nome text not null,
  citta text not null,
  ip_hash text,
  scansione_id text,
  creato_il timestamptz not null default now()
);
create index if not exists test_gratuiti_giorno_idx on test_gratuiti (creato_il);
create index if not exists test_gratuiti_place_idx on test_gratuiti (google_place_id, creato_il desc);

-- La coda: una scansione e le sue celle (domanda × assistente × ripetizione).
-- `dati` è la Scansione senza le celle (profilo, domande, segnali, recensioni).
create table if not exists scansioni (
  id text primary key,
  stato text not null check (stato in ('in attesa di pagamento', 'in corso', 'in attesa', 'completata')),
  email text,
  dati jsonb not null,
  creata_il timestamptz not null default now(),
  aggiornata_il timestamptz not null default now()
);
create table if not exists celle (
  scansione_id text not null references scansioni (id) on delete cascade,
  domanda_id text not null,
  motore text not null,
  ripetizione int not null,
  esegui_dopo timestamptz not null,
  stato text not null check (stato in ('da fare', 'fatta', 'errore')),
  risposta jsonb,                               -- RispostaGrezza: modello, canale, orari, testo, fonti
  analisi jsonb,                                -- AnalisiCella: posizione, citati, fonti
  primary key (scansione_id, domanda_id, motore, ripetizione)
);
create index if not exists celle_da_fare_idx on celle (stato, esegui_dopo);

-- Sicurezza a livello di riga: ognuno vede solo le proprie righe (per email).
alter table abbonamenti enable row level security;
alter table attivita enable row level security;
alter table report enable row level security;

create policy "proprio abbonamento" on abbonamenti for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));
create policy "proprie attivita" on attivita for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));
create policy "propri report" on report for select
  using (lower(email) = lower(auth.jwt() ->> 'email'));
