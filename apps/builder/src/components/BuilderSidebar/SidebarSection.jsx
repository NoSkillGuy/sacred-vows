import { useId } from 'react';

/**
 * Simple accessible collapsible section for the builder sidebar.
 */
export default function SidebarSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  collapsed = false,
}) {
  const contentId = useId();

  return (
    <section className={`sidebar-section ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}>
      <button
        type="button"
        className="sidebar-section-header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        title={collapsed ? title : undefined}
      >
        <span className="sidebar-section-icon" aria-hidden="true">
          {icon}
        </span>
        {!collapsed && <span className="sidebar-section-title">{title}</span>}
        {!collapsed && <span className="sidebar-section-chevron" aria-hidden="true">▾</span>}
      </button>

      {!collapsed && (
        <div id={contentId} className="sidebar-section-content">
          {children}
        </div>
      )}
    </section>
  );
}


