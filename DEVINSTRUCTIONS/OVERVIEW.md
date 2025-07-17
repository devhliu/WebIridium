Run `npm run dev` to start the dev server.

Run `npm run build && npm run preview` to see the final build.

## deploying

A GitHub action will automatically deploy any changes to main.

## testing

Run `npm run test` to run the test suite.

Run `npm run coverage` to generate a coverage report which you can view in `/coverage/index.html`.

Please write tests for any changes you make, as much as is reasonable.

### resources for testing

- philosophy: https://testing-library.com/docs/guiding-principles
- examples: https://testing-library.com/docs/react-testing-library/example-intro
- queries: https://testing-library.com/docs/queries/about
- list of DOM matchers: https://github.com/testing-library/jest-dom

## code style

- Run `npm run format` to reformat your code.
- Run `npm run lint` to run the linter. Use `npm run lint:fix` to accept any automatic fixes it offers.
- A GitHub action will block any PRs that are not formatted properly or have lint errors.

# specific stuff

- [styling](./STYLING.md)
- [global state management](./GLOBALS.md)
- [simulation + copasi/antimony](./SIMULATION.md)
- [icons](./ICONS.md)
