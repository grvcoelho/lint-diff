import Promise from 'bluebird'
import exec from 'execa'
import path from 'path'
import { CLIEngine } from 'eslint'
import {
  assoc,
  endsWith,
  evolve,
  filter,
  find,
  map,
  objOf,
  pipe,
  pipeP,
  prop,
  propEq,
  split,
} from 'ramda'
import { getChangedLinesFromDiff } from './lib/git'

const linter = new CLIEngine()
const formatter = linter.getFormatter()
const COMMIT_RANGE = 'HEAD^..HEAD'

const getDiff = filename => exec('git', ['diff', COMMIT_RANGE, filename])
  .then(prop('stdout'))

const getChangedFiles = pipeP(
  () => exec('git', ['diff', COMMIT_RANGE, '--name-only']),
  prop('stdout'),
  split('\n'),
  filter(endsWith('.js')),
  map(path.resolve)
)

const getChangedFileLineMap = filePath => pipeP(
  getDiff,
  getChangedLinesFromDiff,
  objOf('changedLines'),
  assoc('filePath', filePath)
)(filePath)

const lintChangedLines = pipe(
  map(prop('filePath')),
  linter.executeOnFiles.bind(linter)
)

const filterLinterMessages = changedFileLineMap => (linterOutput) => {
  const filterMessagesByFile = (result) => {
    const fileLineMap = find(propEq('filePath', result.filePath), changedFileLineMap)
    const changedLines = prop('changedLines', fileLineMap)

    const filterMessages = evolve({
      messages: filter(message => changedLines.includes(message.line)),
    })

    return filterMessages(result)
  }

  return pipe(
    prop('results'),
    map(filterMessagesByFile),
    objOf('results')
  )(linterOutput)
}

const applyLinter = changedFileLineMap => pipe(
  lintChangedLines,
  filterLinterMessages(changedFileLineMap)
)(changedFileLineMap)

const reportResults = pipe(
  prop('results'),
  formatter
)

const run = () => Promise.resolve()
  .then(getChangedFiles)
  .map(getChangedFileLineMap)
  .then(applyLinter)
  .then(reportResults)
  .tap(console.log)

run()
