-- Supabase Database Migration Schema for Tab-classifier
-- Execute this SQL script in your Supabase SQL Editor to set up tables and security policies.

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Tabs Table
CREATE TABLE IF NOT EXISTS tabs (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;

-- 4. Row Level Security Policies for Public Access (Personal App)
-- Projects Policies
CREATE POLICY "Allow public select on projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on projects" ON projects FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on projects" ON projects FOR DELETE USING (true);

-- Tabs Policies
CREATE POLICY "Allow public select on tabs" ON tabs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tabs" ON tabs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tabs" ON tabs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on tabs" ON tabs FOR DELETE USING (true);
