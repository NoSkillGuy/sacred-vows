/**
 * Classic Scroll Layout
 * 
 * Main entry point for the classic-scroll layout.
 * This file registers the layout with the registry and exports all layout resources.
 */

import { registerLayout, type LayoutRegistration } from '../registry';
import classicScrollManifest from './manifest';
import components from './components/index';
import styles from './styles/index';
import exportModule from './export/index';
import hooks from './hooks/index';

/**
 * Classic Scroll Layout Definition
 */
const classicScrollLayout: LayoutRegistration = {
  id: 'classic-scroll',
  name: 'Classic Scroll',
  version: '1.0.0',
  
  // Component mappings
  components: {
    view: components.view,
    editable: components.editable,
    shared: components.shared,
  },
  
  // Style functions
  styles: styles.apply,
  
  // Export functions
  export: {
    generateHTML: exportModule.generateHTML,
    generateCSS: exportModule.generateCSS,
    exportInvitation: exportModule.exportInvitation,
  },
  
  // Layout manifest
  manifest: classicScrollManifest,
  
  // Layout-specific hooks
  hooks: hooks,
};

// Auto-register the layout when imported
try {
  registerLayout(classicScrollLayout);
} catch (error) {
  console.error('Failed to register classic-scroll layout:', error);
}

export default classicScrollLayout;
export { classicScrollManifest, components, styles, exportModule, hooks };

