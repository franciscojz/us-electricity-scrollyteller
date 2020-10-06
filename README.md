# Welcome to US Electricity Generation Scrollyteller

## Developer Setup

### Environment
1) Setup Node and NPM
    - Install Node version 10.8.0 and NPM version 6.8.0 (or 6.9.0)
        - [Node Official Download Page](https://nodejs.org/en/download/)
2) Setup Git
    - Download and install Git version 2.18.0
        - Go to [Git Official Download Page](https://git-scm.com/download/) and download
        - OR Mac OS X: Use Homebrew `brew install git`
    - View Git Config settings in terminal `git config -l`
        - If config is off, then:
            - `git config --global user.name "Emma Paris"`
            - `git config --global user.email "eparis@gmail.com"`
    - (Optional) Download and install your favorite Git Client, e.g. SourceTree, GitKraken
3) Open up project in your favorite IDE/Text Editor, e.g. Webstorm or Microsoft Visual Studio Code
    - Make edits that you want in the src folder
4) Install npm dependencies
    - Open up this project directory in a terminal/console window
    - Run the command `npm install` or `npm i` to install all necessary packages
5) Run the project in developer settings
    - Run the command `npm start`

### IDE's or Text Editor Recommendation
1) Webstorm (IDE)
    - Has a monthly subscription fee but works very well and is fully featured.
2) Visual Studio Code (Text Editor)
    - Download from [VS Code Download Page](https://code.visualstudio.com/download)
    - Recommended plugins to get up to spec of Webstorm
        - `Debugger for Chrome`
        - `TSLint`
            - Reads Typescript Lint configuration file for code linting
        - `npm`
        - `GitLens`
            - Expands upon VS Code's Git capabilities with features such file history
        - `Material Icon Theme` (optional)
            - Makes your file explorer's folders look pretty
        - `EditorConfig for VS Code`
            - Reads editorconfig file to standardize how code looks in VS Code across computers

### Environment Variables (.env files)
- Environment variables to allow this app to talk to different back ends, or databases, are stored in `dotenv` files, such as `.env.production`.
- These files are part of the GitIgnore file so that they will not be checked into source control, as per best practices.
    - This is more important for backend applications with secret keys, but we follow the practice here, nonetheless.
- Copies of these files are stored in the Lucid Macro OneNote project.

------

## Maintenance and Upkeep

### Configuring Code Quality with TS Lint, TS Config, and Prettier
There are three main developer tools that this app uses to ensure code quality.
1) TS Lint
    - Configured in the `tslint.json` file
    - See [TS Linting Rules](https://palantir.github.io/tslint/) for help
    - TypeScript Linting is the process of static code checking for potential typescript errors or suggestions
    - This is done by you IDE or Text Editor, _which you will have to set up to point at the tslint file!_
    - Errors or warnings appear as squiggly marks underneath the affected code in your IDE or Text Editor
2) TS Config
    - Configured in the `tsconfig.json` file
    - Typescript _Runtime_ validation of code
    - Handled automatically when running the application with npm run command
    - Errors appear in the terminal where the app is being run from
3) Prettier
    - Configured in the `.prettierrc` file
    - Automatically handles general code cleanup to standardize how code looks across Developers environments
    - Activated whenever code is committed to the Git repository
4) EditorConfig
    - Configured in the `.editorconfig` file
    - [Editor Config Webpage and Explanation](https://editorconfig.org/)
    - Standardizes how code looks on IDE's and Text Editors across computers.

### Updating Git Ignore file
- Make your changes to the .gitignore file and then run the following commands in order
    - `git rm -r --cached .`
    - `git add .`
    - `git commit -m "fixed untracked files"`

------

