# @state-adapt/spaghetti-analyzer

Human-readable and JSON project reports, including downstream command chains, powered by `@state-adapt/spaghetti-core`.

Both formats include visualization-ready rankings for hotspots, functions,
files, chains, and distances. Use `--top`, `--history`, and `--label` to control
rankings and supply caller-owned score snapshots; the report never persists
history implicitly.

## Building

Run `nx build spaghetti-analyzer` to build the library.

## Running unit tests

Run `nx test spaghetti-analyzer` to execute the unit tests via [Jest](https://jestjs.io).
