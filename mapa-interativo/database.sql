-- SQL Schema para Cidade Alta RP Mapa Interativo

-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum para categorias de locais
CREATE TYPE location_category AS ENUM (
    'hospital_ilegal',
    'mercado_ilegal',
    'lavanderia_ilegal',
    'desmanche',
    'andarilho',
    'local_possivel',
    'outros'
);

-- Enum para status de sugestões
CREATE TYPE suggestion_status AS ENUM (
    'nova',
    'em_analise',
    'aceita',
    'recusada',
    'implementada'
);

-- Enum para tipos de sugestões
CREATE TYPE suggestion_type AS ENUM (
    'novo_npc',
    'novo_local',
    'correcao_localizacao',
    'alteracao_informacao',
    'nova_funcionalidade',
    'outro'
);

-- Tabelas

CREATE TABLE servers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    map_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE map_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category location_category NOT NULL,
    description TEXT,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    icon VARCHAR(255),
    color VARCHAR(50),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE wanderer_confirmations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID REFERENCES map_locations(id) ON DELETE CASCADE,
    anonymous_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, anonymous_user_id) -- Previne flood do mesmo user no mesmo ponto
);

CREATE TABLE wanderer_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    location_id UUID REFERENCES map_locations(id) ON DELETE SET NULL,
    anonymous_user_id VARCHAR(255) NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
    location_id UUID REFERENCES map_locations(id) ON DELETE SET NULL,
    anonymous_user_id VARCHAR(255) NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    type suggestion_type NOT NULL,
    content TEXT NOT NULL,
    status suggestion_status DEFAULT 'nova',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)

-- Visitantes
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wanderer_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wanderer_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Servidores são visíveis para todos" ON servers FOR SELECT USING (true);
CREATE POLICY "Locais são visíveis para todos" ON map_locations FOR SELECT USING (true);
CREATE POLICY "Confirmações do andarilho visíveis para todos" ON wanderer_confirmations FOR SELECT USING (true);
CREATE POLICY "Visitantes podem adicionar confirmações" ON wanderer_confirmations FOR INSERT WITH CHECK (true);
CREATE POLICY "Visitantes podem remover próprias confirmações" ON wanderer_confirmations FOR DELETE USING (true);
CREATE POLICY "Ciclos visíveis para todos" ON wanderer_cycles FOR SELECT USING (true);
CREATE POLICY "Comentários visíveis para todos" ON comments FOR SELECT USING (true);
CREATE POLICY "Visitantes podem criar comentários" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Sugestões são inseríveis por visitantes" ON suggestions FOR INSERT WITH CHECK (true);

-- Insert Inicial (Seeds)
INSERT INTO servers (name, slug, map_image_url) VALUES 
('CDA', 'cda', 'https://via.placeholder.com/2000x2000?text=Mapa+CDA'),
('VALLEY', 'valley', 'https://via.placeholder.com/2000x2000?text=Mapa+VALLEY');

-- Ativa o Realtime nas tabelas iterativas
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table wanderer_confirmations;
