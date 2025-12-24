/**
 * Editorial Elegance Layout Entry Point
 * Registers the layout with the central layout registry
 */

import { registerLayout, type LayoutRegistration } from "../registry";
import { editorialEleganceManifest } from "./manifest";
import * as components from "./components/index";
import * as styles from "./styles/index";
import * as hooks from "./hooks/index";
import * as exportModule from "./export/index";

// Register editorial-elegance layout
registerLayout({
  id: "editorial-elegance",
  name: "Editorial Elegance",
  version: "1.0.0",
  manifest: editorialEleganceManifest,
  components: {
    view: components.view,
    editable: components.editable,
    shared: components.shared,
  },
  styles: styles.apply || (() => {}),
  hooks,
  export: exportModule,
} as LayoutRegistration);

console.log("✓ Registered layout: editorial-elegance (v1.0.0)");
