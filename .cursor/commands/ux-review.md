# UX Review

When the user invokes `/ux-review`, review a selected browser div element against all Sacred Vows brand guidelines and provide comprehensive UX feedback.

## Context Understanding

1. **Element Selection**: The user should have:
   - Navigated to a page in the browser
   - Clicked on or selected a div element they want reviewed
   - The element should be visible in the current browser view

2. **Browser State**:
   - Use browser MCP tools to interact with the page
   - Capture element information from the browser
   - Extract computed styles and properties

## Review Process

### Step 1: Capture Element Information

1. **Take a browser snapshot** to see the current page state:
   - Use `mcp_cursor-ide-browser_browser_snapshot` to capture the accessibility snapshot
   - This provides element references and structure
   - Look for the element the user wants to review

2. **Identify the selected element**:

   **Option A: User provides element reference from snapshot**
   - Ask user to identify the element reference from the snapshot
   - Use the `ref` field from the snapshot to target the element

   **Option B: Use browser console to get clicked element**
   - If user clicked an element, use browser console commands:
     ```javascript
     // Get the last clicked element (requires tracking)
     // Or get active element
     const element = document.activeElement;

     // Or get selected element
     const selection = window.getSelection();
     const element = selection.anchorNode?.parentElement;
     ```

   **Option C: User provides CSS selector**
   - Ask user for a CSS selector
   - Use: `document.querySelector(selector)`

3. **Extract element details** using browser console or MCP tools:

   **Computed Styles Extraction**:
   ```javascript
   // Get the element (using one of the methods above)
   const element = /* element reference */;
   const styles = window.getComputedStyle(element);

   // Extract all key properties into an object:
   const elementData = {
     // Colors
     backgroundColor: styles.backgroundColor,
     color: styles.color,
     borderColor: styles.borderColor,
     borderTopColor: styles.borderTopColor,
     borderRightColor: styles.borderRightColor,
     borderBottomColor: styles.borderBottomColor,
     borderLeftColor: styles.borderLeftColor,

     // Typography
     fontFamily: styles.fontFamily,
     fontSize: styles.fontSize,
     fontWeight: styles.fontWeight,
     lineHeight: styles.lineHeight,
     letterSpacing: styles.letterSpacing,
     textAlign: styles.textAlign,

     // Spacing
     padding: styles.padding,
     paddingTop: styles.paddingTop,
     paddingRight: styles.paddingRight,
     paddingBottom: styles.paddingBottom,
     paddingLeft: styles.paddingLeft,
     margin: styles.margin,
     marginTop: styles.marginTop,
     marginRight: styles.marginRight,
     marginBottom: styles.marginBottom,
     marginLeft: styles.marginLeft,
     gap: styles.gap,

     // Layout
     display: styles.display,
     gridTemplateColumns: styles.gridTemplateColumns,
     flexDirection: styles.flexDirection,
     alignItems: styles.alignItems,
     justifyContent: styles.justifyContent,
     position: styles.position,

     // Borders
     borderWidth: styles.borderWidth,
     borderTopWidth: styles.borderTopWidth,
     borderRightWidth: styles.borderRightWidth,
     borderBottomWidth: styles.borderBottomWidth,
     borderLeftWidth: styles.borderLeftWidth,
     borderRadius: styles.borderRadius,
     borderStyle: styles.borderStyle,

     // Shadows
     boxShadow: styles.boxShadow,

     // Animations
     transition: styles.transition,
     animation: styles.animation,
     animationDuration: styles.animationDuration,
     animationTimingFunction: styles.animationTimingFunction,

     // Dimensions
     width: styles.width,
     height: styles.height,
     minWidth: styles.minWidth,
     minHeight: styles.minHeight,
     maxWidth: styles.maxWidth,
     maxHeight: styles.maxHeight,
   };
   ```

   **Element Properties Extraction**:
   ```javascript
   const elementInfo = {
     // Structure
     tagName: element.tagName.toLowerCase(),
     className: element.className,
     id: element.id,

     // Content
     textContent: element.textContent?.trim(),
     innerHTML: element.innerHTML,

     // Attributes
     attributes: Array.from(element.attributes).reduce((acc, attr) => {
       acc[attr.name] = attr.value;
       return acc;
     }, {}),

     // ARIA
     ariaLabel: element.getAttribute('aria-label'),
     ariaLabelledBy: element.getAttribute('aria-labelledby'),
     role: element.getAttribute('role'),

     // Dimensions (actual rendered)
     boundingRect: element.getBoundingClientRect(),

     // Children
     childCount: element.children.length,
     childElements: Array.from(element.children).map(child => ({
       tagName: child.tagName.toLowerCase(),
       className: child.className,
     })),
   };
   ```

4. **Extract CSS rules** (for hover/focus states):
   ```javascript
   // Get all stylesheets and find matching rules
   const sheets = Array.from(document.styleSheets);
   const matchingRules = [];

   sheets.forEach(sheet => {
     try {
       const rules = Array.from(sheet.cssRules || []);
       rules.forEach(rule => {
         if (element.matches(rule.selectorText)) {
           matchingRules.push({
             selector: rule.selectorText,
             styles: rule.style,
           });
         }
       });
     } catch (e) {
       // Cross-origin stylesheet, skip
     }
   });

   // Look for :hover, :focus, :active states
   const hoverRules = matchingRules.filter(r => r.selector.includes(':hover'));
   const focusRules = matchingRules.filter(r => r.selector.includes(':focus'));
   const activeRules = matchingRules.filter(r => r.selector.includes(':active'));
   ```

5. **Extract interactive states**:
   - Check computed styles for hover/focus/active states
   - Extract transition properties
   - Check for disabled attribute
   - Verify touch target size (minWidth × minHeight ≥ 44px × 44px)

6. **Calculate contrast ratios**:
   ```javascript
   // Helper function to calculate contrast ratio
   function getLuminance(hex) {
     const rgb = hexToRgb(hex);
     const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
       val = val / 255;
       return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
     });
     return 0.2126 * r + 0.7152 * g + 0.0722 * b;
   }

   function getContrastRatio(color1, color2) {
     const lum1 = getLuminance(color1);
     const lum2 = getLuminance(color2);
     const lighter = Math.max(lum1, lum2);
     const darker = Math.min(lum1, lum2);
     return (lighter + 0.05) / (darker + 0.05);
   }

   // Calculate for text/background
   const contrastRatio = getContrastRatio(
     elementData.color,
     elementData.backgroundColor
   );
   ```

7. **Compile complete element data**:
   ```javascript
   const completeElementData = {
     ...elementData,
     ...elementInfo,
     hoverStyles: hoverRules,
     focusStyles: focusRules,
     activeStyles: activeRules,
     contrastRatio: contrastRatio,
   };
   ```

### Step 2: Load Brand Guidelines

Read all guideline files from `ux/` directory to understand requirements:

1. **Brand Guidelines** (`ux/brand-guidelines.md`):
   - Brand personality (romantic, elegant, approachable, confident, joyful)
   - Design principles (generous whitespace, premium quality)
   - Do's and Don'ts

2. **Color Palette** (`ux/color-palette.md`):
   - Primary colors (gold `#d4af37`, rose `#e8b4b8`, burgundy `#8b2942`, cream `#fffaf5`)
   - Accent colors (sage, champagne, etc.)
   - Color usage guidelines
   - Gradient specifications
   - Shadow specifications
   - Contrast ratio requirements

3. **Typography** (`ux/typography.md`):
   - Font families (Cormorant Garamond for headings, Quicksand for body, Great Vibes for accents)
   - Type scale (sizes, weights, line heights)
   - Usage guidelines
   - Minimum sizes (16px body, 14px small)

4. **Components** (`ux/components.md`):
   - Button specifications (primary, secondary, ghost)
   - Card specifications
   - Form element specifications
   - Navigation patterns
   - Modal patterns
   - Component states

5. **Spacing & Layout** (`ux/spacing-and-layout.md`):
   - 8px base unit spacing scale
   - Section padding guidelines
   - Container widths
   - Grid system
   - Component spacing
   - Breakpoints

6. **Accessibility** (`ux/accessibility.md`):
   - WCAG 2.1 Level AA compliance
   - Color contrast requirements (4.5:1 normal, 3:1 large)
   - Keyboard navigation (focus states)
   - Touch target sizes (44px minimum)
   - ARIA labels and semantic HTML
   - Text scaling support

7. **Motion & Animation** (`ux/motion-and-animation.md`):
   - Easing functions (ease-out-expo, ease-out-quart, etc.)
   - Duration guidelines
   - Animation principles
   - Reduced motion support
   - Performance considerations

8. **Voice & Tone** (`ux/voice-and-tone.md`):
   - Brand voice characteristics
   - Tone spectrum
   - Writing guidelines
   - Terminology

### Step 3: Comprehensive Review

Perform detailed review against each guideline category:

#### 3.1 Color Compliance

**Check against `ux/color-palette.md`:**

1. **Color Values**:
   - ✅ Verify background colors match brand palette (cream `#fffaf5`, white `#ffffff`, blush variants)
   - ✅ Verify text colors match brand palette (text-dark `#2d2d2d`, text-medium `#4a4a4a`, etc.)
   - ✅ Verify accent colors match (gold `#d4af37`, rose `#e8b4b8`, burgundy `#8b2942`)
   - ⚠️ Check for colors close to brand palette (within reasonable tolerance)
   - ❌ Flag any colors outside brand palette

2. **Gradients**:
   - ✅ Verify gold gradient: `linear-gradient(135deg, #d4af37 0%, #b8960c 100%)`
   - ✅ Verify rose gradient: `linear-gradient(135deg, #e8b4b8 0%, #d4969c 100%)`
   - ❌ Flag incorrect gradient directions or color stops

3. **Shadows**:
   - ✅ Verify shadow values match brand shadows (shadow-sm, shadow-md, shadow-lg, shadow-gold, etc.)
   - ❌ Flag custom shadows that don't match brand specifications

4. **Contrast Ratios**:
   - ✅ Calculate contrast ratio for text/background combinations
   - ✅ Verify normal text (≥18px): minimum 4.5:1 (WCAG AA)
   - ✅ Verify large text (≥18px or 14px bold): minimum 3:1 (WCAG AA)
   - ❌ Flag contrast violations with specific ratios

**Example Check**:
```javascript
// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  // Implementation to calculate WCAG contrast ratio
  // Return ratio and pass/fail status
}
```

#### 3.2 Typography Compliance

**Check against `ux/typography.md`:**

1. **Font Families**:
   - ✅ Verify headings use Cormorant Garamond
   - ✅ Verify body text uses Quicksand
   - ✅ Verify decorative text uses Great Vibes (if applicable)
   - ❌ Flag incorrect font families

2. **Font Sizes**:
   - ✅ Verify sizes match type scale:
     - Hero Title: 3.5rem (56px) desktop, 2rem mobile
     - Section Title: 2.75rem (44px) desktop, 1.85rem mobile
     - Card Title: 1.35rem (22px) desktop, 1.2rem mobile
     - Body: 1rem (16px) desktop, 0.95rem mobile
     - Body Small: 0.9rem (14px)
   - ⚠️ Check for sizes close to scale (within 2px tolerance)
   - ❌ Flag sizes below minimum (14px for small text, 16px for body)

3. **Font Weights**:
   - ✅ Verify weights are appropriate (300, 400, 500, 600, 700 available)
   - ✅ Check heading weights (500-600 for titles)
   - ✅ Check body weights (400 for regular, 600 for semi-bold)

4. **Line Heights**:
   - ✅ Verify body text: 1.7-1.85
   - ✅ Verify headings: 1.2-1.4
   - ❌ Flag line heights that are too tight (<1.5 for body) or too loose (>2.0 for body)

5. **Letter Spacing**:
   - ✅ Verify headings: -0.5px to 0
   - ✅ Verify labels: 2-3px
   - ✅ Verify body: 0

#### 3.3 Component Compliance

**Check against `ux/components.md`:**

1. **Button Components** (if element is a button):
   - ✅ Verify primary button: gold gradient, white text, 1rem 2rem padding, 100px border-radius
   - ✅ Verify secondary button: transparent, rose border, 0.95rem 1.75rem padding
   - ✅ Verify hover states: translateY(-2px to -3px), increased shadow
   - ✅ Verify focus states: 2px gold outline with 2px offset
   - ✅ Verify disabled states: 60% opacity
   - ❌ Flag deviations from button specifications

2. **Card Components** (if element is a card):
   - ✅ Verify border-radius: 24px (var(--radius-xl))
   - ✅ Verify padding: 2.5rem (40px)
   - ✅ Verify shadow: shadow-sm → shadow-lg on hover
   - ✅ Verify hover: translateY(-8px)
   - ❌ Flag deviations from card specifications

3. **Form Elements** (if element is a form input):
   - ✅ Verify input padding: 1rem 1.25rem
   - ✅ Verify border: 2px solid var(--builder-border)
   - ✅ Verify border-radius: 10px (var(--radius-md))
   - ✅ Verify focus: border-color var(--rose), 4px shadow
   - ❌ Flag deviations from form specifications

4. **Component States**:
   - ✅ Check for hover, focus, active, disabled states
   - ❌ Flag missing required states

#### 3.4 Spacing & Layout Compliance

**Check against `ux/spacing-and-layout.md`:**

1. **Spacing Scale**:
   - ✅ Verify all spacing values use 8px base unit (0.5rem increments)
   - ✅ Check padding values: 0.25rem, 0.5rem, 0.75rem, 1rem, 1.25rem, 1.5rem, 2rem, 2.5rem, 3rem, 4rem, etc.
   - ⚠️ Flag spacing values that don't align with 8px scale (within 2px tolerance)
   - ❌ Flag arbitrary spacing values

2. **Component Spacing**:
   - ✅ Verify card padding: 2.5rem (desktop), 1.75rem (mobile)
   - ✅ Verify form group margin: 1.5rem
   - ✅ Verify button padding matches guidelines
   - ❌ Flag incorrect component spacing

3. **Container Widths**:
   - ✅ Verify max-width: 1280px (standard), 800px (narrow), 1400px (wide)
   - ❌ Flag incorrect container widths

4. **Grid System**:
   - ✅ Verify grid gaps: 2rem standard
   - ✅ Verify responsive breakpoints: 768px, 1024px, 1200px, 1440px
   - ❌ Flag incorrect grid usage

#### 3.5 Accessibility Compliance

**Check against `ux/accessibility.md`:**

1. **Color Contrast**:
   - ✅ Verify all text/background combinations meet WCAG AA (4.5:1 normal, 3:1 large)
   - ❌ Flag contrast violations with specific ratios

2. **Keyboard Navigation**:
   - ✅ Verify focus states are visible (2px gold outline, 2px offset)
   - ✅ Verify focus order is logical
   - ❌ Flag missing or insufficient focus indicators

3. **Touch Targets**:
   - ✅ Verify interactive elements: minimum 44px × 44px
   - ❌ Flag touch targets below 44px

4. **ARIA Labels**:
   - ✅ Verify icon-only buttons have aria-label
   - ✅ Verify form inputs have labels (visible or aria-label)
   - ✅ Verify landmark regions have appropriate ARIA
   - ❌ Flag missing ARIA labels

5. **Semantic HTML**:
   - ✅ Verify proper HTML elements (button, nav, main, article, etc.)
   - ✅ Verify heading hierarchy (h1 → h2 → h3)
   - ❌ Flag div/span misuse where semantic elements should be used

6. **Text Scaling**:
   - ✅ Verify text uses relative units (rem, em) not fixed pixels
   - ⚠️ Flag excessive use of px units

#### 3.6 Motion & Animation Compliance

**Check against `ux/motion-and-animation.md`:**

1. **Easing Functions**:
   - ✅ Verify easing matches brand: ease-out-expo, ease-out-quart, ease-in-out, spring
   - ❌ Flag incorrect easing functions

2. **Duration**:
   - ✅ Verify durations match guidelines:
     - Micro-interactions: 0.1-0.2s
     - Hover states: 0.2-0.3s
     - Standard transitions: 0.4-0.6s
     - Major reveals: 0.6-1.0s
   - ❌ Flag durations outside guidelines

3. **Reduced Motion**:
   - ✅ Check for `@media (prefers-reduced-motion: reduce)` support
   - ❌ Flag missing reduced motion support

4. **Performance**:
   - ✅ Verify animations use transform/opacity (GPU accelerated)
   - ❌ Flag animations using layout properties (width, height, margin, etc.)

5. **Animation Purpose**:
   - ✅ Verify animations serve a purpose (reveal, feedback, delight, guide)
   - ⚠️ Flag excessive or unnecessary animations

#### 3.7 Brand Voice Compliance

**Check against `ux/voice-and-tone.md`:**

1. **Text Content** (if element contains text):
   - ✅ Verify tone is warm, elegant, helpful, celebratory, confident
   - ✅ Verify active voice is used
   - ✅ Verify user is addressed directly ("you" not "users")
   - ❌ Flag cold, corporate, pushy, or generic language

2. **Button Labels**:
   - ✅ Verify action verbs (1-3 words)
   - ✅ Verify specificity ("Save changes" not "Submit")
   - ❌ Flag vague labels ("Click here", "Submit")

3. **Terminology**:
   - ✅ Verify correct terms are used ("wedding invitation" not "e-vite")
   - ✅ Verify brand terminology (layout, guests, RSVP, dashboard)
   - ❌ Flag incorrect terminology

4. **Message Structure**:
   - ✅ Verify error messages: What → Why → How to fix
   - ✅ Verify success messages acknowledge action and suggest next steps
   - ❌ Flag unhelpful or vague messages

#### 3.8 Overall Brand Alignment

**Check against `ux/brand-guidelines.md`:**

1. **Brand Personality**:
   - ✅ Assess if element reflects: romantic, elegant, approachable, confident, joyful
   - ⚠️ Flag elements that feel cold, corporate, or generic

2. **Design Principles**:
   - ✅ Verify generous whitespace
   - ✅ Verify premium quality feel
   - ✅ Verify timeless elegance (not trendy)
   - ❌ Flag overcrowded layouts or low-quality feel

3. **Do's and Don'ts**:
   - ✅ Check against design do's (generous whitespace, consistent colors, subtle animations)
   - ❌ Flag design don'ts (overcrowding, colors outside palette, excessive animations)

### Step 4: Generate Review Report

Create a comprehensive markdown report following this structured format. Use the template below and fill in findings from the review:

**Report Generation Process**:

1. **Collect all findings** from Step 3 review:
   - Group by category (Colors, Typography, Components, etc.)
   - Categorize by severity (Critical, Major, Minor, Info)
   - Separate compliant areas, warnings, and issues

2. **Calculate overall assessment**:
   - If any Critical issues: "Non-Compliant"
   - If Major issues but no Critical: "Needs Improvement"
   - If only Minor/Info issues: "Mostly Compliant"
   - If no issues: "Compliant"

3. **Prioritize recommendations**:
   - Critical issues first (accessibility, brand identity)
   - Major issues second (significant deviations)
   - Minor issues third (small improvements)
   - Info suggestions last (enhancements)

4. **Generate code examples** for each issue:
   - Show current code (if available)
   - Show recommended fix
   - Reference specific guideline section

**Report Template Structure**:

The following template shows the structure for the review report:

# UX Review Report

## Summary
[Overall assessment: Compliant / Needs Improvement / Non-Compliant]
[Brief overview of findings]

## Color Compliance

### ✅ Compliant Areas
- Background color matches brand palette (cream #fffaf5)
- Text color uses brand text-dark (#2d2d2d)
- Gold gradient matches specification

### ⚠️ Warnings
- Border color (#e0e0e0) is close to brand palette but not exact match

### ❌ Issues Found
- **Severity: MAJOR** - Text color (#333333) doesn't match brand palette
  - Current: #333333
  - Expected: #2d2d2d (text-dark) or #4a4a4a (text-medium)

- **Severity: CRITICAL** - Contrast ratio violation
  - Text: #ffffff on background: #d4af37
  - Ratio: 2.8:1 (fails WCAG AA for normal text)
  - Required: 4.5:1 for normal text

### 💡 Recommendations
1. Update text color to use brand CSS variables:

       color: var(--text-dark); /* #2d2d2d */

2. Fix contrast by using darker gold or adjusting text:

       /* Option 1: Use gold-dark for background */
       background: var(--gold-dark); /* #b8960c */

       /* Option 2: Use burgundy for text on gold */
       color: var(--burgundy); /* #8b2942 */

## Typography Compliance

### ✅ Compliant Areas
- Font family (Quicksand) matches body text guidelines
- Font size (1rem) matches body text scale

### ❌ Issues Found
- **Severity: MAJOR** - Font size too small
  - Current: 14px (0.875rem)
  - Minimum: 16px (1rem) for body text
  - Guideline: Body text should be 1rem minimum

- **Severity: MINOR** - Line height too tight
  - Current: 1.4
  - Recommended: 1.7-1.85 for body text

### 💡 Recommendations
    /* Update typography */
    font-size: 1rem; /* 16px */
    line-height: 1.7;


## Component Compliance

[Similar structure for component checks]

## Spacing & Layout Compliance

[Similar structure for spacing checks]

## Accessibility Compliance

[Similar structure for accessibility checks]

## Motion & Animation Compliance

[Similar structure for animation checks]

## Brand Voice Compliance

[Similar structure for voice/tone checks]

## Overall Brand Alignment

### Assessment
[Overall assessment of brand personality reflection]

### Key Strengths
- [List what works well]

### Areas for Improvement
- [List what needs work]

## Prioritized Recommendations

### 🔴 Critical (Must Fix)
1. [Critical issue 1]
2. [Critical issue 2]

### 🟡 Major (Should Fix)
1. [Major issue 1]
2. [Major issue 2]

### 🟢 Minor (Nice to Have)
1. [Minor issue 1]
2. [Minor issue 2]

## Code Examples

### Complete Fix Example
    /* Before */
    .my-element {
      color: #333;
      font-size: 14px;
      padding: 15px;
    }

    /* After */
    .my-element {
      color: var(--text-dark); /* #2d2d2d */
      font-size: 1rem; /* 16px */
      padding: 1.5rem; /* 24px - aligns with 8px scale */
      line-height: 1.7;
    }


**Complete Report Template** (fill in with actual findings):

The following is a template structure for the review report. Replace placeholders with actual findings:

# UX Review Report

**Element Reviewed**: [Element description/selector]
**Review Date**: [Date]
**Overall Status**: [Compliant / Needs Improvement / Non-Compliant]

## Executive Summary

[2-3 sentence overview of the review findings, highlighting critical issues if any]

**Key Metrics**:
- Total Issues: [X] (Critical: [X], Major: [X], Minor: [X])
- Compliance Rate: [X]%
- Accessibility Status: [Pass / Fail]

---

## Color Compliance

### ✅ Compliant Areas
- [List what matches brand guidelines]
- Example: "Background color (cream #fffaf5) matches brand palette"

### ⚠️ Warnings
- [List items that are close but not exact matches]
- Example: "Border color (#e0e0e0) is close to builder-border (#e8e8e8) but not exact"

### ❌ Issues Found

**Issue 1: [Title]**
- **Severity**: [CRITICAL / MAJOR / MINOR]
- **Current Value**: [actual value]
- **Expected Value**: [guideline value]
- **Impact**: [Why this matters]
- **Guideline Reference**: `ux/color-palette.md` - [specific section]
- **Fix**:
        /* Current */
      color: #333333;

      /* Recommended */
      color: var(--text-dark); /* #2d2d2d */


**Issue 2: [Title]**
[Same structure as above]

---

## Typography Compliance

[Same structure as Color Compliance]

### ✅ Compliant Areas
- Font family (Quicksand) matches body text guidelines
- Font size (1rem) matches body text scale

### ❌ Issues Found

**Issue: Font size below minimum**
- **Severity**: MAJOR
- **Current**: 14px (0.875rem)
- **Expected**: 16px (1rem) minimum for body text
- **Impact**: Reduces readability and accessibility
- **Guideline Reference**: `ux/typography.md` - Minimum Sizes section
- **Fix**:
        font-size: 1rem; /* 16px - meets minimum requirement */


---

## Component Compliance

[Same structure - check if element matches button, card, form, etc. patterns]

---

## Spacing & Layout Compliance

[Same structure - verify 8px base unit alignment]

---

## Accessibility Compliance

[Same structure - focus on WCAG compliance]

### Critical Issues

**Issue: Contrast ratio violation**
- **Severity**: CRITICAL
- **Current Ratio**: [X]:1
- **Required Ratio**: 4.5:1 (normal text) or 3:1 (large text)
- **Impact**: Violates WCAG 2.1 Level AA, makes text unreadable for some users
- **Guideline Reference**: `ux/accessibility.md` - Color & Contrast section
- **Fix**:
        /* Option 1: Darken background */
      background: var(--gold-dark); /* #b8960c - better contrast */

      /* Option 2: Change text color */
      color: var(--burgundy); /* #8b2942 - better contrast on gold */


---

## Motion & Animation Compliance

[Same structure - verify easing, duration, reduced motion support]

---

## Brand Voice Compliance

[Same structure - review text content, tone, terminology]

---

## Overall Brand Alignment

### Assessment
[Overall assessment: Does this element reflect the brand personality?]

**Brand Personality Reflection**:
- ✅ Romantic: [Yes/No - explanation]
- ✅ Elegant: [Yes/No - explanation]
- ✅ Approachable: [Yes/No - explanation]
- ✅ Confident: [Yes/No - explanation]
- ✅ Joyful: [Yes/No - explanation]

### Key Strengths
- [What works well and aligns with brand]
- Example: "Generous whitespace creates elegant, premium feel"

### Areas for Improvement
- [What needs work to better reflect brand]
- Example: "Color choices feel generic, should use brand palette"

---

## Prioritized Recommendations

### 🔴 Critical (Must Fix - Accessibility & Brand Identity)
1. **[Issue title]**
   - **Why**: [Impact explanation]
   - **How**: [Quick fix description]
   - **Reference**: [Guideline section]

2. **[Issue title]**
   [Same structure]

### 🟡 Major (Should Fix - Significant Deviations)
1. **[Issue title]**
   [Same structure]

### 🟢 Minor (Nice to Have - Small Improvements)
1. **[Issue title]**
   [Same structure]

### 💡 Info (Enhancements - Optional)
1. **[Suggestion]**
   [Same structure]

---

## Complete Code Fix Example

If multiple issues need fixing, provide a complete before/after:

    /* BEFORE - Current Implementation */
    .my-element {
      /* Color Issues */
      color: #333333;
      background-color: #f0f0f0;
      border-color: #ddd;

      /* Typography Issues */
      font-family: Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;

      /* Spacing Issues */
      padding: 15px;
      margin: 10px;

      /* Missing States */
      /* No hover, focus, or transition */
    }

    /* AFTER - Brand-Compliant Implementation */
    .my-element {
      /* Colors - Using Brand Variables */
      color: var(--text-dark); /* #2d2d2d */
      background-color: var(--cream); /* #fffaf5 */
      border: 2px solid var(--builder-border); /* #e8e8e8 */

      /* Typography - Brand Fonts & Scale */
      font-family: 'Quicksand', sans-serif;
      font-size: 1rem; /* 16px - meets minimum */
      line-height: 1.7; /* Brand guideline */
      font-weight: 400;

      /* Spacing - 8px Base Unit */
      padding: 1.5rem; /* 24px - aligns with scale */
      margin: 1rem; /* 16px - aligns with scale */

      /* Interactive States */
      transition: all 0.3s var(--ease-out-quart);
    }

    .my-element:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .my-element:focus-visible {
      outline: 2px solid var(--gold);
      outline-offset: 2px;
    }


---

## Next Steps

1. **Immediate Actions** (Critical issues):
   - [ ] Fix contrast ratio violation
   - [ ] Update color values to brand palette

2. **Short-term Improvements** (Major issues):
   - [ ] Align spacing with 8px scale
   - [ ] Update typography to brand scale

3. **Enhancements** (Minor/Info):
   - [ ] Add hover animations
   - [ ] Improve brand voice in text content

---

## References

- [Brand Guidelines](./ux/brand-guidelines.md)
- [Color Palette](./ux/color-palette.md)
- [Typography](./ux/typography.md)
- [Components](./ux/components.md)
- [Spacing & Layout](./ux/spacing-and-layout.md)
- [Accessibility](./ux/accessibility.md)
- [Motion & Animation](./ux/motion-and-animation.md)
- [Voice & Tone](./ux/voice-and-tone.md)

---

### Step 5: Provide Actionable Feedback

For each issue found:

1. **Identify the problem**: Clear description of what's wrong
2. **Explain the impact**: Why it matters (accessibility, brand consistency, etc.)
3. **Provide solution**: Specific code example or fix
4. **Reference guideline**: Link to specific guideline section

**Severity Levels**:
- **CRITICAL**: Accessibility violations, brand identity issues, major usability problems
- **MAJOR**: Significant deviations from guidelines, moderate usability issues
- **MINOR**: Small deviations, nice-to-have improvements
- **INFO**: Suggestions for enhancement

## Implementation Steps

1. **Capture element**:
   - Take browser snapshot: `mcp_cursor-ide-browser_browser_snapshot`
   - Identify element (ask user for element reference if needed)
   - Use browser console to extract computed styles

2. **Extract element data**:
   ```javascript
   // Use browser console or MCP tools to get:
   // - Computed styles
   // - Element properties
   // - Text content
   // - ARIA attributes
   // - Child elements
   ```

3. **Load guidelines**:
   - Read all files from `ux/` directory
   - Parse color values, typography scale, component specs, etc.

4. **Perform checks**:
   - Compare extracted data against each guideline category
   - Calculate contrast ratios
   - Verify spacing alignment
   - Check component patterns
   - Assess brand alignment

5. **Generate report**:
   - Create structured markdown report
   - Include compliant areas, issues, warnings, suggestions
   - Provide code examples for fixes
   - Prioritize recommendations

6. **Present to user**:
   - Display comprehensive review report
   - Highlight critical issues first
   - Provide actionable recommendations

## Review Checklist

Use this checklist to ensure comprehensive review:

### Colors
- [ ] Background colors match brand palette
- [ ] Text colors match brand palette
- [ ] Accent colors (gold, rose, burgundy) used correctly
- [ ] Gradients match specifications
- [ ] Shadows match brand shadows
- [ ] Contrast ratios meet WCAG AA (4.5:1 normal, 3:1 large)

### Typography
- [ ] Font families correct (Cormorant for headings, Quicksand for body)
- [ ] Font sizes match type scale
- [ ] Font weights appropriate
- [ ] Line heights meet guidelines (1.7-1.85 body, 1.2-1.4 headings)
- [ ] Letter spacing correct
- [ ] Minimum sizes met (16px body, 14px small)

### Components
- [ ] Matches standard component pattern (if applicable)
- [ ] Padding/margins match component specs
- [ ] Border radius matches guidelines
- [ ] Shadows match component specs
- [ ] Hover states implemented correctly
- [ ] Focus states implemented correctly
- [ ] Disabled states implemented (if applicable)

### Spacing
- [ ] All spacing uses 8px base unit
- [ ] Padding values align with spacing scale
- [ ] Margin values align with spacing scale
- [ ] Component spacing matches guidelines

### Accessibility
- [ ] Color contrast meets WCAG AA
- [ ] Focus states visible and correct
- [ ] Touch targets ≥44px
- [ ] ARIA labels present (if needed)
- [ ] Semantic HTML used correctly
- [ ] Text uses relative units

### Motion
- [ ] Easing functions match brand
- [ ] Durations match guidelines
- [ ] Reduced motion supported
- [ ] Animations use transform/opacity
- [ ] Animations serve a purpose

### Brand Voice
- [ ] Tone is warm, elegant, helpful
- [ ] Active voice used
- [ ] User addressed directly
- [ ] Terminology correct
- [ ] Button labels specific and action-oriented

### Overall
- [ ] Reflects brand personality
- [ ] Follows design principles
- [ ] Meets do's, avoids don'ts

## Examples

### Example 1: Button Review

**Element**: Primary CTA button

**Findings**:
- ✅ Gold gradient matches specification
- ✅ White text color correct
- ✅ Padding (1rem 2rem) matches guidelines
- ✅ Border-radius (100px) matches guidelines
- ❌ Hover transform missing (should have translateY(-3px))
- ❌ Focus outline missing (should have 2px gold outline)

**Recommendations**:
```css
.btn-primary:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: var(--shadow-gold-lg);
}

.btn-primary:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}
```

### Example 2: Card Review

**Element**: Feature card

**Findings**:
- ✅ Background white matches guidelines
- ✅ Border-radius (24px) matches guidelines
- ✅ Padding (2.5rem) matches guidelines
- ⚠️ Shadow (shadow-md) should be shadow-sm for default state
- ❌ Hover state missing (should lift with translateY(-8px))

**Recommendations**:
```css
.feature-card {
  box-shadow: var(--shadow-sm); /* Not shadow-md */
  transition: all 0.4s var(--ease-out-expo);
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}
```

### Example 3: Text Element Review

**Element**: Body text paragraph

**Findings**:
- ✅ Font family (Quicksand) correct
- ✅ Font size (1rem) matches body scale
- ✅ Line height (1.7) within guidelines
- ❌ Text color (#666666) doesn't match brand palette
- ❌ Contrast ratio: 5.2:1 (passes but color is wrong)

**Recommendations**:
```css
/* Update to brand color */
color: var(--text-medium); /* #4a4a4a */
/* Or */
color: var(--text-dark); /* #2d2d2d */
```

## Error Handling

1. **If element cannot be identified**:
   - Ask user to provide element reference from snapshot
   - Or ask user to click the element again
   - Or ask for CSS selector

2. **If styles cannot be extracted**:
   - Use browser console to get computed styles
   - Ask user to inspect element and provide styles
   - Fall back to visual assessment from snapshot

3. **If guidelines cannot be loaded**:
   - Inform user that guideline files are missing
   - Proceed with general best practices review
   - Suggest checking `ux/` directory

## Notes

- Always be constructive and helpful in feedback
- Provide specific, actionable recommendations
- Reference specific guideline sections when possible
- Prioritize critical issues (accessibility, brand identity)
- Acknowledge what's done well
- Use brand terminology consistently
- Focus on user experience and brand alignment
- Consider context (some deviations may be intentional for specific use cases)

## Tools to Use

- **Browser MCP**: `mcp_cursor-ide-browser_browser_snapshot` for page structure
- **Browser Console**: Extract computed styles and element properties
- **File Reading**: Read all `ux/*.md` files for guidelines
- **Color Calculations**: Calculate contrast ratios (implement or use library)
- **Markdown Generation**: Create structured review report

