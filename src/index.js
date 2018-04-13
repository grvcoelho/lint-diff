import program from 'commander'
import run from './lint-diff'

program
  .command('lint <commit-range>')
  .action(run)

program.parse(process.argv)
