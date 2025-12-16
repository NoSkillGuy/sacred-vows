-- Revert: Restore original Classic Scroll description

UPDATE "layouts"
SET 
  "description" = 'Classic single-column vertical scroll layout with traditional wedding invitation structure. Features elegant typography, generous spacing, centered content, and a sequential narrative flow that guides guests through your celebration story. Ideal for traditional and formal weddings.',
  "config" = jsonb_set(
    "config",
    '{metadata,description}',
    '"Classic single-column vertical scroll layout with traditional wedding invitation structure. Features elegant typography, generous spacing, centered content, and a sequential narrative flow that guides guests through your celebration story. Ideal for traditional and formal weddings."'
  ),
  "manifest" = jsonb_set(
    "manifest",
    '{description}',
    '"Classic single-column vertical scroll layout with traditional wedding invitation structure. Features elegant typography, generous spacing, centered content, and a sequential narrative flow that guides guests through your celebration story. Ideal for traditional and formal weddings."'
  )
WHERE "id" = 'classic-scroll';

