# difflint

[![Build Status](https://travis-ci.org/grvcoelho/difflint.svg?branch=master)](https://travis-ci.org/grvcoelho/difflint)

:nail_care: Run eslint only in the changed parts of the code

## Why

[ESLint](https://github.com/eslint/eslint) is a great tool to enforce code
style in your code, but it has some limitations: it can only lint entire files.
When working with legacy code, we often have to make changes to very large
files (which would be too troublesome to fix all lint errors)and thus it would
be good to lint only the lines changed and not the entire file.

[difflint](https://github.com/grvcoelho/difflint) receives a commit range and
uses [ESLint](https://github.com/eslint/eslint)  to lint the changed files and
filter only the errors introduced in the commit range (and nothing more).

### State of the art

* [lint-staged](https://github.com/okonet/lint-staged) is a similar tool that lints only the staged changes. It's very helpful for adding a precommit hook, but it cannot be used to enforce the styleguide on a Continuous Integration service like Travis, because the changes are already commited.

## Usage

1. Install it:

  ```sh
  npm install difflint
  ```

2. Install `eslint` and add your eslint configuration file.

3. Use it:

  ```sh
  # This will lint the last commit
  difflint lint HEAD^..HEAD
  ```

## Examples

1. Lint the last 3 commits:

  ```sh
  difflint lint HEAD~3..HEAD
  ```

2. Lint local changes that are not yet commited (similar to what [lint-staged](https://github.com/okonet/lint-staged) do):

  ```sh
  difflint lint HEAD
  ```

3. Lint all commits from a build in [Travis](https://travis-ci.org):

  ```sh
  # This environment variable will be available in any Travis build
  difflint lint $TRAVIS_COMMIT_RANGE
  ```
