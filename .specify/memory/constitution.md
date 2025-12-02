<!--
Sync Impact Report - Constitution v1.1.0
========================================
Version: 1.0.0 → 1.1.0 (MINOR - new principle added)
Ratified: 2025-12-02
Last Amended: 2025-12-02
Principles Modified:
  - Added: IV. No Testing
Sections Modified:
  - Quality Standards: Removed testing references
Templates Status:
  ✅ plan-template.md - Updated to remove testing references
  ✅ spec-template.md - Acceptance scenarios remain (these are requirements, not tests)
  ✅ tasks-template.md - Updated to remove all test task examples
  ✅ checklist-template.md - No testing-specific guidance present
Follow-up: None - all templates updated to align with no-testing principle
-->

# Demo Site Constitution

## Core Principles

### I. Simplicity First

Keep the demo site minimal and focused. Apply YAGNI (You Aren't Gonna Need It) principles rigorously. Avoid over-engineering, premature optimization, or adding features "just in case." Every component, page, and feature must serve a clear, demonstrable purpose.

**Rationale**: Demo sites should showcase core functionality clearly without unnecessary complexity that obscures the demonstration value.

### II. Component-Based Design

Build reusable React components following composition patterns. Use Tailwind CSS utility classes for styling. Maintain consistent design patterns across all UI elements. Components must be self-contained with clear props interfaces.

**Rationale**: Component-based architecture ensures maintainability, reusability, and consistent user experience across the demo site.

### III. Type Safety

TypeScript must be enabled for all code. Component props must be explicitly typed. No `any` types allowed in production code—use `unknown` with type guards when necessary. Leverage TypeScript's type inference where appropriate.

**Rationale**: Type safety catches errors at compile time, improves IDE support, and serves as living documentation for component APIs.

### IV. No Testing

This project MUST NOT include any testing infrastructure, test files, or testing dependencies. No unit tests, integration tests, end-to-end tests, or any other form of automated testing. Do not add testing frameworks (Jest, Vitest, Testing Library, etc.) to dependencies.

**Rationale**: This is a demonstration site with a limited scope. Testing infrastructure adds complexity, maintenance burden, and development overhead that are not justified for a simple demo project. Focus development effort on building clear, working features instead.

## Technology Stack

**Framework**: Next.js 14+ (App Router preferred)  
**Styling**: Tailwind CSS 3+  
**Language**: TypeScript (strict mode enabled)  
**Package Manager**: pnpm  
**Node Version**: 18+ LTS

All dependencies must be actively maintained. Prefer official Next.js and React patterns over third-party abstractions.

## Quality Standards

**Code Style**: ESLint and Prettier must be configured and enforced via pre-commit hooks or CI.  
**Responsive Design**: All pages and components must be mobile-responsive (verified manually at 320px, 768px, 1024px, 1920px viewports).  
**Accessibility**: Semantic HTML required; keyboard navigation must work; color contrast must meet WCAG AA minimum.  
**Performance**: Lighthouse performance score should target 90+ on production builds.

## Governance

This constitution guides all development decisions for the demo site. For a project of this scope, amendments do not require formal approval but should be documented via git commits with clear rationale.

Constitution supersedes ad-hoc styling or architectural decisions. When in doubt, refer back to the four core principles: Simplicity, Component-Based Design, Type Safety, and No Testing.

**Version**: 1.1.0 | **Ratified**: 2025-12-02 | **Last Amended**: 2025-12-02
