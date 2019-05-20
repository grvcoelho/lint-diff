import meow from 'meow'
import run from './lint-diff'

const cli = meow(`
  Usage
    $ lint-diff [<diff-input>] [<extensions>]
  Examples
    $ lint-diff
    $ lint-diff HEAD~1..HEAD
    $ lint-diff master..my-branch
`, {
    flags: {
      ext: { type: 'string' },
    },
  })

run(cli.input[0], cli.flags.ext)
