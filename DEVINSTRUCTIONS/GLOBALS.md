We use [Jotai](https://jotai.org/) for global state management. It is recommended to go through the [tutorial](https://tutorial.jotai.org/).

The documentation is really confusing, so you might also want do some reading on (reactive) signals to get an idea of how it works.

Anything that must be accessible from any component or should persist sessions should be placed within `src/globals`.

## conventions

Take a look at `src/globals/workspace/model.ts` for how things should be layed out.

General format:

- private atoms (prefix with `_`, do not export)
- public atoms (export these)
