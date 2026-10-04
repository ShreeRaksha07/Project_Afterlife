import React from 'react';
import {
  LayoutDashboard,
  SearchCode,
  Layers,
  Users2,
  Rocket,
  Sparkles,
  X
} from 'lucide-react';
import type { ModuleId } from '../../types';
import { GithubIcon } from './GithubIcon';

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (module: ModuleId) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  analyzedRepoName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  isOpen,
  onCloseMobile,
  analyzedRepoName
}) => {
  const navItems = [
    {
      id: 'dashboard' as ModuleId,
      name: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Home'
    },
    {
      id: 'analyzer' as ModuleId,
      name: 'Project Analyzer',
      icon: SearchCode,
      badge: 'Reviewer'
    },
    {
      id: 'techAdvisor' as ModuleId,
      name: 'Technology Advisor',
      icon: Layers,
      badge: 'Architect'
    },
    {
      id: 'expertFinder' as ModuleId,
      name: 'Expert Finder',
      icon: Users2,
      badge: 'Mentor'
    },
    {
      id: 'afterlifePlanner' as ModuleId,
      name: 'Afterlife Planner',
      icon: Rocket,
      badge: 'Strategist'
    }
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="brand-badge">
            <Sparkles size={12} />
            AI Innovation Platform
          </span>
          <button
            onClick={onCloseMobile}
            className="nav-toggle-btn"
            style={{ color: '#fff', border: 'none', padding: 4 }}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="brand-title">
          PROJECT AFTERLIFE
        </div>
        <div className="brand-tagline">
          "Don't let your project end with the hackathon. Give it an Afterlife."
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation & Modules</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectModule(item.id);
                onCloseMobile();
              }}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="nav-icon" />
              <span>{item.name}</span>
              <span className="nav-badge">{item.badge}</span>
            </button>
          );
        })}
      </nav>

      {analyzedRepoName && (
        <div style={{ padding: '0 16px 14px' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '11px',
              color: '#cbd5e1'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#a78bfa', fontWeight: 600, marginBottom: 4 }}>
              <GithubIcon size={13} />
              <span>Active Repository</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all', color: '#fff' }}>
              {analyzedRepoName}
            </div>
          </div>
        </div>
      )}

      <div className="sidebar-footer">
        <div>EdTech & Prompt Engineering Prototype</div>
        <div className="footer-note">4 Persona-Driven AI Modules</div>
      </div>
    </aside>
  );
};
