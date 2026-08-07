import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Settings,
  Eye, 
  EyeOff, 
  Search, 
  FolderPlus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  X, 
  Globe,
  Check,
  Maximize2,
  Minimize2,
  FolderOutput,
  ChevronUp,
  ChevronDown,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { syncProjectsToCloud, fetchProjectsFromCloud, isCloudConfigured } from './supabaseClient';

// Initial sample data if local storage is empty
const INITIAL_DATA = [
  {
    id: 'proj-1',
    title: 'React & Frontend Core',
    tabs: [
      {
        id: 'tab-1',
        number: 1,
        name: 'React Official Documentation',
        url: 'https://react.dev'
      },
      {
        id: 'tab-2',
        number: 2,
        name: 'Vite Build Tool Guide',
        url: 'https://vitejs.dev'
      },
      {
        id: 'tab-3',
        number: 3,
        name: 'MDN Web Docs - JavaScript',
        url: 'https://developer.mozilla.org'
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'Design & Icons',
    tabs: [
      {
        id: 'tab-4',
        number: 1,
        name: 'Lucide Icons Library',
        url: 'https://lucide.dev'
      },
      {
        id: 'tab-5',
        number: 2,
        name: 'Google Fonts Collection',
        url: 'https://fonts.google.com'
      }
    ]
  }
];

// Helper to sanitize & format URL to ensure valid http/https formatting
const sanitizeUrl = (rawUrl) => {
  if (!rawUrl) return '#';
  let formattedUrl = rawUrl.trim();
  if (!formattedUrl) return '#';
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }
  try {
    const parsed = new URL(formattedUrl);
    return parsed.href;
  } catch (e) {
    return '#';
  }
};

// Helper to extract favicon from URL
const getFaviconUrl = (rawUrl) => {
  if (!rawUrl) return null;
  try {
    const formattedUrl = sanitizeUrl(rawUrl);
    if (formattedUrl === '#') return null;
    const domain = new URL(formattedUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (e) {
    return null;
  }
};

export default function App() {
  // Load from localStorage or use INITIAL_DATA
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('tab_classifier_projects');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isPlusHidden, setIsPlusHidden] = useState(() => {
    const saved = localStorage.getItem('tab_classifier_plus_hidden');
    return saved ? JSON.parse(saved) : false;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef(null);
  const fileInputRef = useRef(null);

  // Focus Preview Mode state
  const [focusedProjectId, setFocusedProjectId] = useState(null);

  // Inline Project Title Editing
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectTitle, setEditingProjectTitle] = useState('');

  // Modals state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [activeTabEdit, setActiveTabEdit] = useState(null); // { projectId, tab: {...} } or { projectId, isNew: true }
  const [tabFormName, setTabFormName] = useState('');
  const [tabFormUrl, setTabFormUrl] = useState('');

  // Toast notification feedback system state
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cloud Sync Status State
  const [syncStatus, setSyncStatus] = useState(() => isCloudConfigured() ? 'synced' : 'local');

  // Initial load: Fetch from Supabase cloud if configured
  useEffect(() => {
    if (isCloudConfigured()) {
      fetchProjectsFromCloud().then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setProjects(res.data);
          setSyncStatus('synced');
        }
      });
    }
  }, []);

  // Save to localStorage on change & debounced sync to cloud
  useEffect(() => {
    localStorage.setItem('tab_classifier_projects', JSON.stringify(projects));
    if (isCloudConfigured()) {
      setSyncStatus('syncing');
      const syncTimer = setTimeout(() => {
        syncProjectsToCloud(projects).then((res) => {
          if (res.synced) {
            setSyncStatus('synced');
          } else {
            setSyncStatus('local');
          }
        });
      }, 1500);

      return () => clearTimeout(syncTimer);
    } else {
      setSyncStatus('local');
    }
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('tab_classifier_plus_hidden', JSON.stringify(isPlusHidden));
  }, [isPlusHidden]);

  // Close Settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Project Handlers
  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const title = newProjectTitle.trim();
    const newProj = {
      id: 'proj-' + Date.now(),
      title: title,
      tabs: []
    };
    setProjects([...projects, newProj]);
    setNewProjectTitle('');
    setIsProjectModalOpen(false);
    showToast(`Created project "${title}"`, 'success');
  };

  const handleDeleteProject = (projectId, e) => {
    e.stopPropagation();
    const targetProj = projects.find(p => p.id === projectId);
    if (window.confirm('Are you sure you want to delete this project and all its tabs?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      if (focusedProjectId === projectId) setFocusedProjectId(null);
      showToast(`Deleted project "${targetProj ? targetProj.title : ''}"`, 'info');
    }
  };

  const startEditProjectTitle = (project, e) => {
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditingProjectTitle(project.title);
  };

  const saveProjectTitle = (projectId) => {
    if (editingProjectTitle.trim()) {
      setProjects(projects.map(p => p.id === projectId ? { ...p, title: editingProjectTitle.trim() } : p));
      showToast('Project title updated', 'success');
    }
    setEditingProjectId(null);
  };

  // Batch Open All Tabs in Project
  const handleOpenAllTabs = (project, e) => {
    if (e) e.stopPropagation();
    if (!project.tabs || project.tabs.length === 0) {
      showToast(`No tabs in "${project.title}" to open`, 'info');
      return;
    }
    project.tabs.forEach(tab => {
      const validUrl = sanitizeUrl(tab.url);
      if (validUrl !== '#') {
        window.open(validUrl, '_blank');
      }
    });
    showToast(`Opened ${project.tabs.length} tab${project.tabs.length > 1 ? 's' : ''} for "${project.title}"`, 'success');
  };

  // Tab Reordering (Move Up / Move Down)
  const handleMoveTab = (projectId, index, direction, e) => {
    if (e) e.stopPropagation();
    setProjects(prevProjects => prevProjects.map(proj => {
      if (proj.id !== projectId) return proj;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= proj.tabs.length) return proj;

      const newTabs = [...proj.tabs];
      const temp = newTabs[index];
      newTabs[index] = newTabs[targetIndex];
      newTabs[targetIndex] = temp;

      const renumberedTabs = newTabs.map((t, idx) => ({
        ...t,
        number: idx + 1
      }));
      return { ...proj, tabs: renumberedTabs };
    }));
    showToast(`Tab moved ${direction === -1 ? 'up' : 'down'}`, 'info');
  };

  // Open Edit/Add Tab Modal
  const openTabModal = (projectId, tab = null, e = null) => {
    if (e) e.stopPropagation();
    if (tab) {
      setActiveTabEdit({ projectId, tab, isNew: false });
      setTabFormName(tab.name);
      setTabFormUrl(tab.url);
    } else {
      const targetProj = projects.find(p => p.id === projectId);
      const nextNumber = targetProj ? targetProj.tabs.length + 1 : 1;
      setActiveTabEdit({ projectId, isNew: true, nextNumber });
      setTabFormName('');
      setTabFormUrl('');
    }
  };

  // Save Tab (Create or Edit)
  const handleSaveTab = (e) => {
    e.preventDefault();
    if (!activeTabEdit) return;

    const { projectId, tab, isNew } = activeTabEdit;
    const sanitizedInputUrl = sanitizeUrl(tabFormUrl.trim());

    setProjects(projects.map(proj => {
      if (proj.id !== projectId) return proj;

      if (isNew) {
        const newTabItem = {
          id: 'tab-' + Date.now(),
          number: proj.tabs.length + 1,
          name: tabFormName.trim() || 'Untitled Tab',
          url: sanitizedInputUrl
        };
        return { ...proj, tabs: [...proj.tabs, newTabItem] };
      } else {
        const updatedTabs = proj.tabs.map(t => {
          if (t.id === tab.id) {
            return {
              ...t,
              name: tabFormName.trim() || 'Untitled Tab',
              url: sanitizedInputUrl
            };
          }
          return t;
        });
        return { ...proj, tabs: updatedTabs };
      }
    }));

    showToast(isNew ? 'Added new tab' : 'Updated tab details', 'success');
    setActiveTabEdit(null);
  };

  // Delete Tab
  const handleDeleteTab = () => {
    if (!activeTabEdit || activeTabEdit.isNew) return;
    const { projectId, tab } = activeTabEdit;

    setProjects(projects.map(proj => {
      if (proj.id !== projectId) return proj;
      const filteredTabs = proj.tabs
        .filter(t => t.id !== tab.id)
        .map((t, idx) => ({ ...t, number: idx + 1 })); // Re-number tabs 1, 2, 3...
      return { ...proj, tabs: filteredTabs };
    }));

    showToast('Deleted tab', 'info');
    setActiveTabEdit(null);
  };

  // Workspace Data Backup (Export JSON)
  const handleExportWorkspace = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tab_classifier_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsSettingsOpen(false);
    showToast("Exported backup JSON file", "success");
  };

  // Workspace Data Restore (Import JSON)
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportWorkspace = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          const isValid = importedData.every(
            p => p && typeof p === 'object' && p.id && typeof p.title === 'string' && Array.isArray(p.tabs)
          );
          if (isValid) {
            setProjects(importedData);
            showToast(`Imported workspace (${importedData.length} projects)`, 'success');
          } else {
            showToast('Invalid workspace backup file structure', 'danger');
          }
        } else {
          showToast('Invalid backup file format (must be JSON array)', 'danger');
        }
      } catch (err) {
        showToast('Failed to parse backup JSON file', 'danger');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setIsSettingsOpen(false);
  };

  // Reset Workspace Trigger
  const confirmResetWorkspace = () => {
    setProjects(INITIAL_DATA);
    setIsResetModalOpen(false);
    setIsSettingsOpen(false);
    showToast("Workspace reset to initial defaults", "info");
  };

  // Filtered Projects for Search
  const filteredProjects = projects.filter(proj => {
    const matchesProjTitle = proj.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTabs = proj.tabs.some(
      t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           t.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesProjTitle || matchesTabs;
  });

  const focusedProject = projects.find(p => p.id === focusedProjectId);

  // Helper render for single Project Card
  const renderProjectCard = (project, isFocusedView = false) => (
    <div key={project.id} className="project-card">
      {/* Project Header */}
      <div className="project-header">
        <div className="project-title-group">
          {editingProjectId === project.id ? (
            <input 
              type="text" 
              className="project-title-input"
              value={editingProjectTitle}
              onChange={(e) => setEditingProjectTitle(e.target.value)}
              onBlur={() => saveProjectTitle(project.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveProjectTitle(project.id); }}
              autoFocus
            />
          ) : (
            <h2 className="project-title" onClick={(e) => startEditProjectTitle(project, e)}>
              {project.title}
            </h2>
          )}
          <span className="tab-count-badge">{project.tabs.length} Tabs</span>
        </div>

        <div className="project-actions">
          {/* Batch Open All Tabs in Project (Hidden as requested) */}
          <button 
            className="icon-btn" 
            title={`Open all ${project.tabs.length} tabs in browser`}
            onClick={(e) => handleOpenAllTabs(project, e)}
            style={{ display: 'none' }}
          >
            <FolderOutput size={15} />
          </button>

          {/* Edit Project Name */}
          <button 
            className="icon-btn" 
            title="Edit Project Title"
            onClick={(e) => startEditProjectTitle(project, e)}
          >
            <Edit3 size={15} />
          </button>

          {/* Full Preview / Focus Mode Button */}
          {!isFocusedView && (
            <button 
              className="icon-btn" 
              title="Focus Preview Mode"
              onClick={() => setFocusedProjectId(project.id)}
            >
              <Maximize2 size={15} />
            </button>
          )}

          {/* Delete Project */}
          <button 
            className="icon-btn" 
            title="Delete Project"
            onClick={(e) => handleDeleteProject(project.id, e)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Vertical Tab List (Top to Bottom) */}
      <div className="vertical-tab-list">
        {project.tabs.map((tab, index) => {
          const formattedUrl = sanitizeUrl(tab.url);
          const faviconUrl = getFaviconUrl(formattedUrl);
          return (
            <div 
              key={tab.id} 
              className="tab-row-item"
              onClick={(e) => openTabModal(project.id, tab, e)}
              title="Click to edit tab details"
            >
              {/* Tab Reordering (Move Up / Move Down) */}
              <div className="tab-reorder-buttons" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="icon-btn-sm" 
                  title="Move Up"
                  disabled={index === 0}
                  onClick={(e) => handleMoveTab(project.id, index, -1, e)}
                >
                  <ChevronUp size={13} />
                </button>
                <button 
                  className="icon-btn-sm" 
                  title="Move Down"
                  disabled={index === project.tabs.length - 1}
                  onClick={(e) => handleMoveTab(project.id, index, 1, e)}
                >
                  <ChevronDown size={13} />
                </button>
              </div>

              {/* Number Badge (#1, #2, #3) */}
              <div className="tab-number-badge">
                #{tab.number}
              </div>

              {/* Square Favicon Box */}
              <div className="favicon-square-box">
                {faviconUrl ? (
                  <img 
                    src={faviconUrl} 
                    alt="favicon" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <Globe size={18} style={{ opacity: 0.5 }} />
                )}
              </div>

              {/* Small Connecting Line Segment */}
              <div className="connecting-line-segment" />

              {/* Tab Name ONLY (URL Hidden from main list) */}
              <div className="tab-info-name-only">
                {tab.name}
              </div>

              {/* Tab Actions */}
              <div className="tab-row-actions">
                <a 
                  href={formattedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="icon-btn"
                  title={`Open link: ${formattedUrl}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={16} />
                </a>
                <button className="icon-btn" title="Edit tab">
                  <Edit3 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic '+' Add Button inside Project */}
      {!isPlusHidden && (
        <button 
          className="add-tab-btn"
          onClick={() => openTabModal(project.id)}
        >
          <Plus size={16} />
          <span>Add Tab #{project.tabs.length + 1}</span>
        </button>
      )}
    </div>
  );

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept=".json" 
        onChange={handleImportWorkspace} 
      />

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            {toast.type === 'success' && <CheckCircle2 size={18} className="toast-icon" />}
            {toast.type === 'danger' && <AlertCircle size={18} className="toast-icon" />}
            {toast.type === 'info' && <Info size={18} className="toast-icon" />}
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className={`app-container ${focusedProjectId ? 'blurred' : ''}`}>
        {/* Header */}
        <header className="app-header">
          <div className="brand-section">
            <img src="/favicon.svg" alt="Tab Classifier Logo" className="brand-svg-logo" />
            <div>
              <h1 className="brand-title">Tab-classifier</h1>
            </div>
          </div>

          <div className="header-actions">
            {/* Cloud Sync Status Indicator */}
            {syncStatus === 'synced' ? (
              <div className="cloud-sync-badge cloud-synced" title="Cloud database active (Supabase)">
                <span className="status-dot green"></span>
                <span>Cloud Synced</span> 🟢
              </div>
            ) : syncStatus === 'syncing' ? (
              <div className="cloud-sync-badge syncing" title="Syncing changes to cloud...">
                <span className="status-dot orange pulse"></span>
                <span>Syncing...</span> ⏳
              </div>
            ) : (
              <div className="cloud-sync-badge local-storage" title="Saved locally in browser localStorage">
                <span className="status-dot blue"></span>
                <span>Local Storage</span>
              </div>
            )}

            {/* Search Box */}
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search projects or tabs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Settings Gear Dropdown Menu */}
            <div className="settings-menu-wrapper" ref={settingsRef}>
              <button 
                className={`btn btn-icon-only ${isSettingsOpen ? 'active' : ''}`}
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                title="Settings"
              >
                <Settings size={18} />
              </button>

              {isSettingsOpen && (
                <div className="settings-dropdown">
                  <div className="settings-dropdown-header">Workspace Options</div>
                  
                  <div 
                    className="setting-toggle-item"
                    onClick={() => setIsPlusHidden(!isPlusHidden)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isPlusHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span>Hide '+' Add Buttons</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isPlusHidden} 
                      onChange={() => {}} // handled by parent click
                    />
                  </div>

                  <div className="settings-dropdown-divider" />

                  <div 
                    className="setting-menu-item"
                    onClick={handleExportWorkspace}
                  >
                    <Download size={16} />
                    <span>Export Workspace</span>
                  </div>

                  <div 
                    className="setting-menu-item"
                    onClick={triggerFileInput}
                  >
                    <Upload size={16} />
                    <span>Import Workspace</span>
                  </div>

                  <div className="settings-dropdown-divider" />

                  <div 
                    className="setting-menu-item danger"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      setIsResetModalOpen(true);
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Reset Workspace</span>
                  </div>
                </div>
              )}
            </div>

            {/* New Project Button */}
            <button 
              className="btn btn-primary"
              onClick={() => setIsProjectModalOpen(true)}
            >
              <FolderPlus size={18} />
              <span>New Project</span>
            </button>
          </div>
        </header>

        {/* Main Content Grid */}
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Globe size={32} />
            </div>
            <h3 className="empty-title">No Projects Found</h3>
            <p className="empty-desc">
              {searchQuery ? "No projects or tabs match your search query." : "Create your first project to start organizing your browser tabs in order."}
            </p>
            <button className="btn btn-primary" onClick={() => setIsProjectModalOpen(true)}>
              <Plus size={18} />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project) => renderProjectCard(project, false))}
          </div>
        )}
      </div>

      {/* FULL PREVIEW / FOCUS MODE SPOTLIGHT OVERLAY */}
      {focusedProject && (
        <div className="focus-preview-overlay" onClick={() => setFocusedProjectId(null)}>
          <div className="focused-project-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="focus-close-btn" onClick={() => setFocusedProjectId(null)}>
              <Minimize2 size={16} />
              <span>Exit Focus Mode</span>
            </button>
            {renderProjectCard(focusedProject, true)}
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isProjectModalOpen && (
        <div className="modal-overlay" onClick={() => setIsProjectModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Project</h3>
              <button className="icon-btn" onClick={() => setIsProjectModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddProject}>
              <div className="form-group">
                <label>Project / Topic Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. React Tutorial Tabs, Travel Booking..."
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-footer" style={{ justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsProjectModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Create Project</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Workspace Confirmation Modal */}
      {isResetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsResetModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reset Workspace</h3>
              <button className="icon-btn" onClick={() => setIsResetModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
              Are you sure you want to reset your workspace? This will replace all your current projects and tabs with initial sample data. This action cannot be undone.
            </p>
            <div className="modal-footer" style={{ justifyContent: 'flex-end', marginTop: '16px' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setIsResetModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={confirmResetWorkspace}
              >
                <RotateCcw size={16} />
                <span>Reset Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Tab Pop-up Modal */}
      {activeTabEdit && (
        <div className="modal-overlay" onClick={() => setActiveTabEdit(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {activeTabEdit.isNew 
                  ? `Add Tab #${activeTabEdit.nextNumber}` 
                  : `Edit Tab #${activeTabEdit.tab.number}`}
              </h3>
              <button className="icon-btn" onClick={() => setActiveTabEdit(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveTab}>
              <div className="form-group">
                <label>Tab / Topic Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Official Documentation, Tutorial Video"
                  value={tabFormName}
                  onChange={(e) => setTabFormName(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Website URL</label>
                <input 
                  type="text" 
                  placeholder="e.g. https://react.dev"
                  value={tabFormUrl}
                  onChange={(e) => setTabFormUrl(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                {!activeTabEdit.isNew ? (
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleDeleteTab}
                  >
                    <Trash2 size={16} />
                    <span>Delete Tab</span>
                  </button>
                ) : <div />}

                <div className="modal-footer-right">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setActiveTabEdit(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Check size={16} />
                    <span>{activeTabEdit.isNew ? 'Add Tab' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
