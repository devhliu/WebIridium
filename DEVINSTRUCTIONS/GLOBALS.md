We use [Jotai](https://jotai.org/) for global state management. It is recommended to go through the [tutorial](https://tutorial.jotai.org/).

The documentation is really confusing, so you might also want do some reading on (reactive) signals to get an idea of how it works.

Anything that must be accessible from any component or should persist sessions should be placed within `src/globals`.

## conventions

Take a look at `src/globals/model.ts` for how things should be layed out.

General format:

- private atoms (prefix with `_`, do not export)
- public atoms (export these)
- array with all atoms (export this)
  - the purpose of this array is so that it can be used with `jotai-scope` (we want to be able to scope some of the global state so we can have multiple instances)

Any atom you export should accept modifications from any place. For example, if you have a `settingsAtom`, it should be designed to be writeable from any component. If you need to control how an atom is written to, create a private atom and pair it with a public write-only atom.
