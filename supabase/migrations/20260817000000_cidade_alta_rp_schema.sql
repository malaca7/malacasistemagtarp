-- Migration SQL for CIDADE ALTA RP Interactive Map System
-- Supports servers (CDA & VALLEY), Map Locations, Wanderer confirmations/cycles, Comments, Suggestions

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SERVERS TABLE
CREATE TABLE IF NOT EXISTS public.servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT TRUE,
    map_image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MAP LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS public.map_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    x NUMERIC(10, 4) NOT NULL,
    y NUMERIC(10, 4) NOT NULL,
    icon VARCHAR(50) DEFAULT 'MapPin',
    color VARCHAR(20) DEFAULT '#f43f5e',
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. WANDERER CONFIRMATIONS TABLE
CREATE TABLE IF NOT EXISTS public.wanderer_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES public.map_locations(id) ON DELETE CASCADE,
    anonymous_user_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_per_location UNIQUE(location_id, anonymous_user_id)
);

-- 4. WANDERER CYCLES TABLE
CREATE TABLE IF NOT EXISTS public.wanderer_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 5. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.map_locations(id) ON DELETE CASCADE,
    anonymous_user_id VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    content VARCHAR(280) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    server_id UUID NOT NULL REFERENCES public.servers(id) ON DELETE CASCADE,
    location_id UUID REFERENCES public.map_locations(id) ON DELETE SET NULL,
    anonymous_user_id VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'Nova',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_map_locations_server ON public.map_locations(server_id);
CREATE INDEX IF NOT EXISTS idx_map_locations_category ON public.map_locations(category);
CREATE INDEX IF NOT EXISTS idx_wanderer_confirmations_location ON public.wanderer_confirmations(location_id);
CREATE INDEX IF NOT EXISTS idx_comments_server ON public.comments(server_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_server ON public.suggestions(server_id);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_map_locations_updated_at BEFORE UPDATE ON public.map_locations FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
CREATE TRIGGER update_suggestions_updated_at BEFORE UPDATE ON public.suggestions FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.map_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderer_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wanderer_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to servers and locations
CREATE POLICY "Public Read Servers" ON public.servers FOR SELECT USING (true);
CREATE POLICY "Public Read Locations" ON public.map_locations FOR SELECT USING (true);
CREATE POLICY "Public Read Confirmations" ON public.wanderer_confirmations FOR SELECT USING (true);
CREATE POLICY "Public Read Cycles" ON public.wanderer_cycles FOR SELECT USING (true);
CREATE POLICY "Public Read Comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public Read Suggestions" ON public.suggestions FOR SELECT USING (true);

-- Allow anonymous users to insert confirmations, comments, suggestions
CREATE POLICY "Public Insert Confirmations" ON public.wanderer_confirmations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Own Confirmation" ON public.wanderer_confirmations FOR DELETE USING (true);
CREATE POLICY "Public Insert Comments" ON public.comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Suggestions" ON public.suggestions FOR INSERT WITH CHECK (true);

-- Admin Full Access Policies (Authenticated admins)
CREATE POLICY "Admin All Servers" ON public.servers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Locations" ON public.map_locations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Comments" ON public.comments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin All Suggestions" ON public.suggestions FOR ALL USING (auth.role() = 'authenticated');

-- SEED INITIAL DATA WITH REAL GTA MAP URL
INSERT INTO public.servers (id, name, slug, active, map_image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Cidade Alta (CDA)', 'cda', true, '/images/gta_map_hd.jpg'),
('22222222-2222-2222-2222-222222222222', 'Valley RP', 'valley', true, '/images/gta_map_hd.jpg')
ON CONFLICT (slug) DO UPDATE SET map_image_url = EXCLUDED.map_image_url;
