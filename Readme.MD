# V0_version_control - A Simple Version Control System

## Overview
V0_version_control is a lightweight version control system implemented in Node.js. It provides basic functionalities like initializing a repository, adding files, committing changes, viewing commit history, and showing commit differences.

## Features
- Initialize a new repository
- Add files to the staging area
- Commit changes with messages
- View commit history
- Show differences between commits

## Installation
To use Groot, ensure that you have Node.js installed on your system.

### Clone the Repository
```sh
 git clone <repository_url>
 cd v0_version_control
```

### Install Dependencies
```sh
npm install
```

## Usage
Groot provides a command-line interface (CLI) for interacting with the repository.

### Initialize a Repository
```sh
node v0_version_control.mjs init
```
This command initializes a new Groot repository in the current directory by creating a `.groot` folder.

### Add Files to Staging Area
```sh
node v0_version_control.mjs add <file>
```
Example:
```sh
node v0_version_control.mjs add sample.txt
```
This adds `sample.txt` to the staging area.

### Commit Changes
```sh
node v0_version_control.mjs commit "Your commit message"
```
Example:
```sh
node v0_version_control.mjs commit "Initial commit"
```
This creates a new commit with the staged files.

### View Commit History
```sh
node v0_version_control.mjs log
```
This displays a list of all commits in the repository.

### Show Differences in a Commit
```sh
node v0_version_control.mjs show <commitHash>
```
Example:
```sh
node v0_version_control.mjs show eaa52462ebebc65976485a4c1ec313fb25ee53cf
```
This compares the changes made in a commit with its parent.

## How It Works
1. **Hashing Files**: Files are hashed using SHA-1 and stored in the `.groot/objects` directory.
2. **Staging Area**: Staged files are stored in `.groot/index` before committing.
3. **Commit Structure**: Commits store a timestamp, message, file references, and parent commit.
4. **Commit History**: The `HEAD` file stores the latest commit hash.
5. **Showing Differences**: Uses the `diff` library to highlight changes between commits.

## Dependencies
- [Chalk](https://www.npmjs.com/package/chalk) - Colored CLI output
- [Commander](https://www.npmjs.com/package/commander) - CLI command handling
- [Diff](https://www.npmjs.com/package/diff) - Compute text differences

## Contributing
Feel free to contribute by submitting issues or pull requests.



