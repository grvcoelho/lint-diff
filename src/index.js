import meow from 'meow'
import run from './lint-diff'

const cli = meow(`
  Usage
    $ lint-diff [<diff-input>]

  Examples
    $ lint-diff
    $ lint-diff HEAD~1..HEAD
    $ lint-diff master..my-branch
`)

run(cli.input[0])
