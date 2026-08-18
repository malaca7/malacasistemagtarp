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
CREATE POLICY "Permitir remoção de confirmações" ON wanderer_confirmations FOR DELETE USING (true);
CREATE POLICY "Ciclos visíveis para todos" ON wanderer_cycles FOR SELECT USING (true);
CREATE POLICY "Comentários visíveis para todos" ON comments FOR SELECT USING (true);
CREATE POLICY "Visitantes podem criar comentários" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir remoção de comentários" ON comments FOR DELETE USING (true);
CREATE POLICY "Sugestões são inseríveis por visitantes" ON suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir moderação de sugestões" ON suggestions FOR UPDATE USING (true);

-- Insert Inicial (Seeds)
INSERT INTO servers (id, name, slug, map_image_url) VALUES 
('cda-server-uuid', 'CDA', 'cda', '/images/gta_map_bg.webp'),
('valley-server-uuid', 'VALLEY', 'valley', '/images/gta_map_bg.webp')
ON CONFLICT (slug) DO NOTHING;

-- Seeds de Locais do CDA
INSERT INTO map_locations (server_id, name, category, description, x, y, color) VALUES
('cda-server-uuid', 'Hospital Ilegal #1', 'hospital_ilegal', 'Localização fixa do Hospital Ilegal', 440, 550, '#ef4444'),
('cda-server-uuid', 'Hospital Ilegal Paleto', 'hospital_ilegal', 'Localização fixa do Hospital Ilegal Paleto', 421, 825, '#ef4444'),
('cda-server-uuid', 'Hospital Ilegal Leste', 'hospital_ilegal', 'Localização fixa do Hospital Ilegal Leste', 656, 269, '#ef4444'),
('cda-server-uuid', 'Mercado Ilegal Principal', 'mercado_ilegal', 'Localização fixa do Mercado Ilegal', 648, 431, '#f59e0b'),
('cda-server-uuid', 'Lavanderia Ilegal #1', 'lavanderia_ilegal', 'Localização fixa da Lavanderia Ilegal', 209, 384, '#3b82f6'),
('cda-server-uuid', 'Lavanderia Ilegal Paleto', 'lavanderia_ilegal', 'Localização fixa da Lavanderia Ilegal Norte', 451, 841, '#3b82f6'),
('cda-server-uuid', 'Desmanche Bennys', 'desmanche', 'Localização fixa do Desmanche', 421, 188, '#10b981'),
('cda-server-uuid', 'Desmanche Grapeseed', 'desmanche', 'Localização fixa do Desmanche', 631, 709, '#10b981'),
('cda-server-uuid', 'Andarilho - Grapeseed', 'local_possivel', 'Possível localização do Andarilho em Grapeseed', 670, 700, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Bennys', 'local_possivel', 'Possível localização do Andarilho em Bennys', 433, 214, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Porto Mecânica', 'local_possivel', 'Possível localização do Andarilho no Porto', 483, 64, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Praia', 'local_possivel', 'Possível localização do Andarilho na Praia', 345, 244, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Paleto Galinheiro', 'local_possivel', 'Possível localização do Andarilho no Galinheiro de Paleto', 448, 823, '#a78bfa')
ON CONFLICT DO NOTHING;

-- Ativa o Realtime nas tabelas iterativas
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table wanderer_confirmations;
