import { createClient } from '@supabase/supabase-js';

// Read Supabase environment variables or use fallback placeholders
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isCloudConfigured = () => {
  return (
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_ANON_KEY &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch all projects and tabs from Supabase
 * @returns {Promise<{success: boolean, data?: Array, error?: any}>}
 */
export async function fetchProjectsFromCloud() {
  if (!isCloudConfigured()) {
    return { success: false, reason: 'not_configured' };
  }

  try {
    const { data: dbProjects, error: projErr } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: true });

    if (projErr) throw projErr;

    const { data: dbTabs, error: tabErr } = await supabase
      .from('tabs')
      .select('*')
      .order('number', { ascending: true });

    if (tabErr) throw tabErr;

    // Reconstruct full projects structure
    const formattedProjects = (dbProjects || []).map(p => ({
      id: p.id,
      title: p.title,
      tabs: (dbTabs || [])
        .filter(t => t.project_id === p.id)
        .map(t => ({
          id: t.id,
          number: t.number,
          name: t.name,
          url: t.url
        }))
    }));

    return { success: true, data: formattedProjects };
  } catch (err) {
    console.warn('Fetch cloud data error:', err.message || err);
    return { success: false, error: err };
  }
}

/**
 * Background sync helper to persist local projects and tabs to Supabase (with deletion cleanup)
 * @param {Array} projects 
 * @returns {Promise<{success: boolean, synced: boolean, reason?: string, error?: any}>}
 */
export async function syncProjectsToCloud(projects) {
  if (!isCloudConfigured()) {
    return { success: false, synced: false, reason: 'not_configured' };
  }

  try {
    // 1. Fetch current IDs in Cloud to perform deletion diffing
    const { data: existingCloudProjects } = await supabase.from('projects').select('id');
    const { data: existingCloudTabs } = await supabase.from('tabs').select('id');

    const localProjectIds = new Set((projects || []).map(p => p.id));
    const localTabIds = new Set((projects || []).flatMap(p => (p.tabs || []).map(t => t.id)));

    // 2. Delete cloud tabs that no longer exist locally
    if (existingCloudTabs && existingCloudTabs.length > 0) {
      const tabsToDelete = existingCloudTabs
        .filter(t => !localTabIds.has(t.id))
        .map(t => t.id);
      if (tabsToDelete.length > 0) {
        await supabase.from('tabs').delete().in('id', tabsToDelete);
      }
    }

    // 3. Delete cloud projects that no longer exist locally
    if (existingCloudProjects && existingCloudProjects.length > 0) {
      const projectsToDelete = existingCloudProjects
        .filter(p => !localProjectIds.has(p.id))
        .map(p => p.id);
      if (projectsToDelete.length > 0) {
        await supabase.from('projects').delete().in('id', projectsToDelete);
      }
    }

    if (!projects || projects.length === 0) {
      return { success: true, synced: true };
    }

    // 4. Format and upsert projects table rows
    const projectRows = projects.map(p => ({
      id: p.id,
      title: p.title
    }));

    const { error: projError } = await supabase
      .from('projects')
      .upsert(projectRows, { onConflict: 'id' });

    if (projError) throw projError;

    // 5. Format and upsert tabs table rows
    const tabRows = projects.flatMap(p =>
      (p.tabs || []).map(t => ({
        id: t.id,
        project_id: p.id,
        number: t.number,
        name: t.name,
        url: t.url
      }))
    );

    if (tabRows.length > 0) {
      const { error: tabError } = await supabase
        .from('tabs')
        .upsert(tabRows, { onConflict: 'id' });

      if (tabError) throw tabError;
    }

    return { success: true, synced: true };
  } catch (err) {
    console.warn('Background cloud sync error:', err.message || err);
    return { success: false, synced: false, error: err };
  }
}
