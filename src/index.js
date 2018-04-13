import program from 'commander'
import run from './lintdiff'

program
  .command('lint <commit-range>')
  .action(run)

program.parse(process.argv)
