/**
 * Vite Environment Type Declarations
 *
 * Declares types for Vite-specific imports like CSS with ?inline suffix
 */

declare module "*.css?inline" {
  const content: string;
  export default content;
}

