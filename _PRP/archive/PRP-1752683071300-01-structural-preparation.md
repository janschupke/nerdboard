# PRP: Structural Preparation for Unified API/Scraping Architecture

## Feature Overview

Refactor the project’s data layer to support both API and scraping-based data retrieval for tiles, ensuring a unified, type-safe, and testable architecture. This includes adding `fetchAndParse` to `dataFetcher`, introducing a `dataParser` registry, updating tile hooks to select the correct retrieval method, updating types/interfaces, and extending unit tests for the new logic.

## User Stories

- As a developer, I want a single, consistent way to fetch and map data for all tiles, regardless of whether the data comes from an API or scraping.
- As a developer, I want to register and use parsers for scraped data in a type-safe, testable way.
- As a user, I want all tiles to load data reliably, with proper error handling and caching, regardless of the data source.

## Technical Requirements

- Add `fetchAndParse` to `src/services/dataFetcher.ts` for scraping-based tiles.
- Create `src/services/dataParser.ts` with a registry and interface for registering and retrieving parsers by tile type.
- Update tile hooks to select between `fetchAndMap` and `fetchAndParse` based on the tile’s retrieval method.
- Ensure all types and interfaces are up to date and used consistently.
- Add or update unit tests for all new fetcher and parser logic.
- Update documentation to reflect the new architecture.

## UI/UX Considerations

- No direct user-facing changes, but all tiles must continue to display loading, error, and data states consistently.
- Error and loading states must be handled gracefully for both API and scraping flows.

## Testing Requirements

- Unit tests for `fetchAndParse` and the `dataParser` registry.
- Unit tests for at least one example parser.
- Update or add tests for tile hooks to ensure correct method selection and error handling.
- Mock all network and scraping calls in tests.

## Accessibility Requirements

- No direct impact, but all error/loading states must remain accessible (e.g., ARIA live regions, roles).

## Performance Considerations

- Ensure that caching and background refresh logic works for both API and scraping flows.
- Avoid unnecessary re-renders or network calls.

## Implementation Steps

1. Add `fetchAndParse` to `dataFetcher`.
2. Create `dataParser.ts` with registry and interface.
3. Update tile hooks to select the correct retrieval method.
4. Update types/interfaces for unified data flow.
5. Add/extend unit tests for fetcher/parser logic.
6. Update documentation.
7. Run `npm run lint` and fix any issues.
8. Perform structure check and fix inconsistencies.

## Potential Risks and Mitigation

- **Risk:** Breaking existing tile data flows. **Mitigation:** Refactor incrementally, add comprehensive tests, and ensure the app works after each step.
- **Risk:** Inconsistent type usage. **Mitigation:** Use strict TypeScript types and interfaces throughout.

## References

- See `API_RESEARCH.md` sections 1A–1G for architecture details.
- See `src/services/dataFetcher.ts` and `src/services/dataMapper.ts` for current implementation.
