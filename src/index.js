import program from 'commander'
import run from './difflint'

program
  .command('lint <commit-range>')
  .action(run)

program.parse(process.argv)
