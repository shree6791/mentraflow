# MentraFlow TODO List

## Knowledge Graph Page

### Legend Spacing
- [ ] Further reduce gap between "RETENTION STRENGTH" heading and legend items
  - Current: 0.375rem margin-bottom
  - Target: Minimal/no visible gap
  - File: `/app/frontend/src/components/KnowledgeGraph.css` line 301

## Dashboard Page

### Card Border Visibility - Medium Retention
- [ ] Yellow border not visible on medium retention cards ("Review Soon")
  - Issue: Yellow border (3px solid) with yellow background tint not showing
  - Expected: Yellow left border visible like red (fading) and green (strong) cards
  - Current CSS: `.library-item.retention-medium` in Dashboard.css line 3279
  - May need: Darker yellow color or thicker border
  - Priority: High (affects visual hierarchy)

### Width Alignment Spacing
- [ ] Fine-tune spacing/alignment between AppHeader and page sections
  - Issue: Minor spacing inconsistencies still visible
  - Affected sections: Stats cards, Knowledge Library
  - Files: `/app/frontend/src/Dashboard.css`, `/app/frontend/src/components/AppLayout.css`
  - Priority: Medium

## Notes
- Created: 2024
- Updated: 2024

