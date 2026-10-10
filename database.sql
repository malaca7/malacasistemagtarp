-- ==============================================================================
-- MALACA SYSTEM GTARP — SCHEMA OFICIAL SUPABASE (POSTGRESQL)
-- Suporte completo para Discord OAuth2, Perfis, Logs de Acesso e Sistemas RP
-- ==============================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enums para categorias de locais e sugestões (criados se não existirem)
DO $$ BEGIN
    CREATE TYPE location_category AS ENUM (
        'hospital_ilegal',
        'mercado_ilegal',
        'lavanderia_ilegal',
        'desmanche',
        'andarilho',
        'local_possivel',
        'outros'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE suggestion_status AS ENUM (
        'nova',
        'em_analise',
        'aceita',
        'recusada',
        'implementada'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE suggestion_type AS ENUM (
        'novo_npc',
        'novo_local',
        'correcao_localizacao',
        'alteracao_informacao',
        'nova_funcionalidade',
        'outro'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA DE SERVIDORES / CIDADES
CREATE TABLE IF NOT EXISTS public.servers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    subtitle TEXT,
    description TEXT,
    banner_image_url TEXT,
    active BOOLEAN DEFAULT true,
    map_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.1. TABELA DE SISTEMAS DA PLATAFORMA
CREATE TABLE IF NOT EXISTS public.systems (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    tag VARCHAR(100),
    description TEXT,
    icon VARCHAR(100) DEFAULT 'fa-compass',
    image_url TEXT,
    link TEXT,
    city_ids JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE LOCAIS DO MAPA
CREATE TABLE IF NOT EXISTS public.map_locations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    server_id TEXT REFERENCES public.servers(id) ON DELETE CASCADE,
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

-- 5. CONFIRMAÇÕES DE ANDARILHO
CREATE TABLE IF NOT EXISTS public.wanderer_confirmations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    location_id TEXT REFERENCES public.map_locations(id) ON DELETE CASCADE,
    anonymous_user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(location_id, anonymous_user_id)
);

-- 6. CICLOS DO ANDARILHO
CREATE TABLE IF NOT EXISTS public.wanderer_cycles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    server_id TEXT REFERENCES public.servers(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active'
);

-- 7. COMENTÁRIOS E FEEDBACK
CREATE TABLE IF NOT EXISTS public.comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    server_id TEXT REFERENCES public.servers(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES public.map_locations(id) ON DELETE SET NULL,
    anonymous_user_id VARCHAR(255) NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SUGESTÕES DE LOCAIS E RECURSOS
CREATE TABLE IF NOT EXISTS public.suggestions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    server_id TEXT REFERENCES public.servers(id) ON DELETE CASCADE,
    location_id TEXT REFERENCES public.map_locations(id) ON DELETE SET NULL,
    anonymous_user_id VARCHAR(255) NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    type suggestion_type NOT NULL,
    content TEXT NOT NULL,
    status suggestion_status DEFAULT 'nova',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PERFIS DE USUÁRIOS AUTENTICADOS VIA DISCORD OAUTH2
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    discord_id TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    is_admin BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. REGISTRO DE SESSÕES / LOGS DE ACESSO
CREATE TABLE IF NOT EXISTS public.access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    discord_id TEXT,
    username TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT
);

-- 11. TRIGGER AUTOMÁTICO: CRIAÇÃO/ATUALIZAÇÃO DE PERFIL VIA DISCORD LOGIN
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_discord_id TEXT;
    v_username TEXT;
    v_full_name TEXT;
    v_avatar TEXT;
    v_is_admin BOOLEAN;
BEGIN
    v_discord_id := COALESCE(new.raw_user_meta_data->>'provider_id', new.raw_user_meta_data->>'sub', new.id::text);
    v_username := COALESCE(new.raw_user_meta_data->>'preferred_username', new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'name', 'Discord User');
    v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'global_name', new.raw_user_meta_data->>'name', v_username);
    v_avatar := COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://cdn.discordapp.com/embed/avatars/0.png');
    
    -- Verificação de Administrador (722320491767136346, 917826984778797087, malaca7, malaca, malaquias ou e-mails oficiais)
    v_is_admin := (
        v_discord_id IN ('722320491767136346', '917826984778797087')
        OR LOWER(v_username) IN ('malaca', 'malaquias', 'malaca7')
        OR LOWER(COALESCE(new.email, '')) IN ('rogeriomalaquiasjr@gmail.com', 'rogeriosantanajr@gmail.com')
        OR COALESCE(new.raw_user_meta_data->>'is_admin', 'false') = 'true'
    );

    INSERT INTO public.profiles (
        id,
        discord_id,
        username,
        full_name,
        avatar_url,
        email,
        is_admin,
        role,
        created_at,
        last_login_at
    )
    VALUES (
        new.id,
        v_discord_id,
        v_username,
        v_full_name,
        v_avatar,
        new.email,
        v_is_admin,
        CASE WHEN v_is_admin THEN 'admin' ELSE 'user' END,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        last_login_at = NOW(),
        avatar_url = EXCLUDED.avatar_url,
        full_name = EXCLUDED.full_name,
        username = EXCLUDED.username,
        is_admin = (public.profiles.is_admin OR EXCLUDED.is_admin),
        role = CASE WHEN (public.profiles.is_admin OR EXCLUDED.is_admin) THEN 'admin' ELSE public.profiles.role END;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderer_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderer_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas existentes para evitar conflitos na recriação
DROP POLICY IF EXISTS "Servidores visíveis para todos" ON public.servers;
DROP POLICY IF EXISTS "Permitir gestão de servidores" ON public.servers;
DROP POLICY IF EXISTS "Sistemas visíveis para todos" ON public.systems;
DROP POLICY IF EXISTS "Permitir gestão de sistemas" ON public.systems;
DROP POLICY IF EXISTS "Locais visíveis para todos" ON public.map_locations;
DROP POLICY IF EXISTS "Permitir gestão de locais" ON public.map_locations;
DROP POLICY IF EXISTS "Confirmações visíveis para todos" ON public.wanderer_confirmations;
DROP POLICY IF EXISTS "Visitantes podem adicionar confirmações" ON public.wanderer_confirmations;
DROP POLICY IF EXISTS "Permitir remoção de confirmações" ON public.wanderer_confirmations;
DROP POLICY IF EXISTS "Ciclos visíveis para todos" ON public.wanderer_cycles;
DROP POLICY IF EXISTS "Comentários visíveis para todos" ON public.comments;
DROP POLICY IF EXISTS "Visitantes podem criar comentários" ON public.comments;
DROP POLICY IF EXISTS "Permitir remoção de comentários" ON public.comments;
DROP POLICY IF EXISTS "Sugestões são inseríveis por visitantes" ON public.suggestions;
DROP POLICY IF EXISTS "Permitir moderação de sugestões" ON public.suggestions;
DROP POLICY IF EXISTS "Allow public select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert/update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert access_logs" ON public.access_logs;
DROP POLICY IF EXISTS "Allow public select access_logs" ON public.access_logs;

-- Políticas
CREATE POLICY "Servidores visíveis para todos" ON public.servers FOR SELECT USING (true);
CREATE POLICY "Permitir gestão de servidores" ON public.servers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Sistemas visíveis para todos" ON public.systems FOR SELECT USING (true);
CREATE POLICY "Permitir gestão de sistemas" ON public.systems FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Locais visíveis para todos" ON public.map_locations FOR SELECT USING (true);
CREATE POLICY "Permitir gestão de locais" ON public.map_locations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Confirmações visíveis para todos" ON public.wanderer_confirmations FOR SELECT USING (true);
CREATE POLICY "Visitantes podem adicionar confirmações" ON public.wanderer_confirmations FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir remoção de confirmações" ON public.wanderer_confirmations FOR DELETE USING (true);

CREATE POLICY "Ciclos visíveis para todos" ON public.wanderer_cycles FOR SELECT USING (true);

CREATE POLICY "Comentários visíveis para todos" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Visitantes podem criar comentários" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir remoção de comentários" ON public.comments FOR DELETE USING (true);

CREATE POLICY "Sugestões são inseríveis por visitantes" ON public.suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir moderação de sugestões" ON public.suggestions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow individual insert/update profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public select access_logs" ON public.access_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access_logs" ON public.access_logs FOR INSERT WITH CHECK (true);

-- 13. SEEDS INICIAIS (CIDADES E PONTOS)
INSERT INTO public.servers (id, name, slug, subtitle, description, banner_image_url, map_image_url, active) VALUES 
('cda-server-uuid', 'CIDADE ALTA RP', 'cda', 'SERVIDORES CDA & VALLEY', 'Mapa Interativo em tempo real para os servidores CDA e VALLEY com virada do Andarilho, além de Lockpick, Caixinha e Hacking.', '/images/hero_banner.jpg', '/images/mapa_cda_optimized.webp', true),
('valley-server-uuid', 'VALLEY RP', 'valley', 'VALLEY ROLEPLAY HUB', 'Servidor Valley com rastreamento de pontos ilegais, lavanderia e localizações do andarilho.', '/images/bg_wallpaper.jpg', '/images/mapa_cda_optimized.webp', true),
('los-santos-server-uuid', 'LOS SANTOS CENTRAL', 'los-santos', 'TREINAMENTO HEISTS & MINIJOGOS', 'Central de treinamento de reflexos para invasão de cofres de registradoras, fechaduras de 32 pinos e terminais de segurança.', '/images/gta_map_bg.webp', '/images/mapa_cda_optimized.webp', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.systems (id, name, slug, tag, description, icon, image_url, link, city_ids, is_active) VALUES
('sys-mapa', 'MAPA INTERATIVO RP', 'mapa-interativo', 'CDA & VALLEY REALTIME', 'Mapa interativo em tempo real com virada do Andarilho e pontos de interesse.', 'fa-compass', '/images/gta_map_bg.webp', '/cidades/cda/mapa/', '["cda-server-uuid","valley-server-uuid","cda","valley"]'::jsonb, true),
('sys-lockpick', 'LOCKPICK SIMULATOR', 'lockpick', 'FIVEM LOCKPICK KIT', 'Simulador oficial de arrombamento com travamento de pinos.', 'fa-key', '/images/lockpick.jpg', '/cidades/cda/lockpick/', '["cda-server-uuid","los-santos-server-uuid","cda","los-santos"]'::jsonb, true),
('sys-caixinha', 'CAIXINHA ELETRÔNICO', 'caixinha', 'SAFE & ATM HACK', 'Decodificador rápido de cofres e caixas eletrônicos.', 'fa-vault', '/images/caixinha.jpg', '/cidades/cda/caixinha/', '["cda-server-uuid","los-santos-server-uuid","cda","los-santos"]'::jsonb, true),
('sys-hacking', 'HACKING DEVICE', 'hacking', 'CYBER HACK TERMINAL', 'Terminal de hacking estilo Cayo Perico com matrizes de caracteres.', 'fa-microchip', '/images/hacking.jpg', '/cidades/cda/hacking/', '["cda-server-uuid","los-santos-server-uuid","cda","los-santos"]'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.map_locations (server_id, name, category, description, x, y, color) VALUES
('cda-server-uuid', 'Hospital Ilegal #1', 'hospital_ilegal', 'Localização fixa do Hospital Ilegal', 440, 550, '#ef4444'),
('cda-server-uuid', 'Hospital Ilegal Paleto', 'hospital_ilegal', 'Localização fixa do Hospital Ilegal Paleto', 421, 825, '#ef4444'),
('cda-server-uuid', 'Hospital Ilegal Leste', 'hospital_ilegal', 'Localização fixa do Hospital Ilegal Leste', 656, 269, '#ef4444'),
('cda-server-uuid', 'Mercado Ilegal Principal', 'mercado_ilegal', 'Localização fixa do Mercado Ilegal', 648, 431, '#f59e0b'),
('cda-server-uuid', 'Lavanderia Ilegal #1', 'lavanderia_ilegal', 'Localização fixa da Lavanderia Ilegal', 209, 384, '#3b82f6'),
('cda-server-uuid', 'Lavanderia Ilegal Paleto', 'lavanderia_ilegal', 'Localização fixa da Lavanderia Ilegal Norte', 451, 841, '#3b82f6'),
('cda-server-uuid', 'Desmanche Bennys', 'desmanche', 'Localização fixa do Desmanche', 421, 188, '#10b981'),
('cda-server-uuid', 'Desmanche Grapeseed', 'desmanche', 'Localização fixa do Desmanche', 631, 709, '#10b981'),
('cda-server-uuid', 'Andarilho - Grapeseed Norte', 'local_possivel', 'Possível localização do Andarilho em Grapeseed', 670, 700, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Grapeseed Centro', 'local_possivel', 'Possível localização do Andarilho em Grapeseed', 520, 660, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Grapeseed Leste', 'local_possivel', 'Possível localização do Andarilho em Grapeseed', 593, 723, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Grapeseed Sul', 'local_possivel', 'Possível localização do Andarilho em Grapeseed', 570, 680, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Grapeseed Oeste', 'local_possivel', 'Possível localização do Andarilho em Grapeseed', 568, 679, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Bennys', 'local_possivel', 'Possível localização do Andarilho em Bennys', 433, 214, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Bennys Pátio', 'local_possivel', 'Possível localização do Andarilho em Bennys', 535, 187, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Porto Mecânica', 'local_possivel', 'Possível localização do Andarilho no Porto', 483, 64, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Porto Galpão', 'local_possivel', 'Possível localização do Andarilho no Porto', 456, 109, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Praia Calçadão', 'local_possivel', 'Possível localização do Andarilho na Praia', 345, 244, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Praia Construção', 'local_possivel', 'Ao lado da lixeira, dentro da construção cercada de madeira na praia.', 333, 238, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Praia Pier', 'local_possivel', 'Possível localização do Andarilho na Praia', 413, 188, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Paleto Galinheiro', 'local_possivel', 'Possível localização do Andarilho no Galinheiro de Paleto', 448, 823, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Paleto Posto', 'local_possivel', 'Possível localização do Andarilho em Paleto (Posto)', 435, 828, '#a78bfa'),
('cda-server-uuid', 'Andarilho - Paleto Leste', 'local_possivel', 'Possível localização do Andarilho em Paleto Leste', 440, 840, '#a78bfa')
ON CONFLICT DO NOTHING;

INSERT INTO public.suggestions (server_id, nickname, type, content, status) VALUES
('cda-server-uuid', 'Jogador_CDA', 'novo_local', 'Adicionar marcação da oficina secundária perto do aeroporto', 'em_analise'),
('cda-server-uuid', 'FiveMFan', 'nova_funcionalidade', 'Adicionar rotação em tempo real e atalho de coordenadas', 'aceita'),
('cda-server-uuid', 'RP_Player', 'novo_npc', 'Andarilho avistado próximo ao posto de Paleto Bay no ciclo da noite', 'implementada')
ON CONFLICT DO NOTHING;

-- 14. ATIVAÇÃO DO REALTIME
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.servers;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.systems;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wanderer_confirmations;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.map_locations;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.suggestions;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
EXCEPTION WHEN others THEN null; END $$;

-- 15. TABELA DE CONFIGURAÇÕES GLOBAIS DA PLATAFORMA
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT DEFAULT 'Plataforma em manutenção programada para melhorias.',
    global_announcement TEXT DEFAULT '',
    announcement_active BOOLEAN DEFAULT false,
    announcement_type TEXT DEFAULT 'info',
    disabled_systems JSONB DEFAULT '[]'::jsonb,
    require_auth_for_interactive_map BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura de platform_settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Permitir edicao de platform_settings" ON public.platform_settings FOR ALL USING (true) WITH CHECK (true);

INSERT INTO public.platform_settings (id, maintenance_mode, global_announcement, announcement_active)
VALUES ('default', false, '', false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_settings;
EXCEPTION WHEN others THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.access_logs;
EXCEPTION WHEN others THEN null; END $$;

