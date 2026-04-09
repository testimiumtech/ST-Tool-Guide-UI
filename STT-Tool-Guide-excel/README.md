# Command Docs App

Documentation site for automation commands and prerequisites. The app is built with Angular 20 (standalone components) and TailwindCSS, and loads its data from JSON files in the `public/data` folder.

## Development Server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Project Structure (Key Areas)

```
src/app
	components/        # UI components (command page, prerequisites, TOC)
	layouts/           # Main and prerequisites layouts
	services/          # Data services (API, prerequisites, TOC sync)
public/data          # JSON data loaded by the app
```

## Routes

- `/` Home page
- `/cmd/:id` Command documentation page
- `/prerequisites/excel` Excel prerequisites
- `/prerequisites/html` HTML prerequisites
- `/prerequisites/locators` Locator prerequisites
- `/prerequisites/locator-config` Locator config prerequisites
- `/prerequisites/testing-properties` Testing properties
- `/prerequisites/user-profile` User profile properties

## Data Sources & Flow

The app loads static data from `public/data`:

- `commands.json` for command documentation
- `excel-prerequisites.json`, `html-prerequisites.json`, `locator-prerequisites.json`, `locator-config-prerequisites.json`
- `testing-properties.json`, `user-profile.json`

For commands:

1. Edit `public/data/commands.xlsx` (Commands sheet)
	- `Order` supports parent/child values like `1`, `1.1`, `1.2`
2. Run `npm run xlsx-to-json`
3. App loads `public/data/commands.json`

For prerequisites:

1. Edit JSON files in `public/data`
2. Components load them via `PrerequisiteService`
3. Routes under `/prerequisites/*` render the content

See [XLSX_DATA_GUIDE.md](XLSX_DATA_GUIDE.md) for field definitions and JSON formats.

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running Unit Tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running End-to-End Tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
