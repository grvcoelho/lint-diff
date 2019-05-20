import Promise from 'bluebird'
import exec from 'execa'
import path from 'path'
import { CLIEngine } from 'eslint'
import {
  T,
  assoc,
  cond,
  curry,
  curryN,
  endsWith,
  evolve,
  equals,
  filter,
  find,
  length,
  map,
  merge,
  objOf,
  pipe,
  pipeWith,
  pluck,
  prop,
  propEq,
  split,
  sum,
  tap,
  then,
} from 'ramda'
import { getChangedLinesFromDiff } from './lib/git'

const linter = new CLIEngine()
const formatter = linter.getFormatter()

const getChangedFiles = extensions => pipeWith(
  then,
  [
    commitRange => exec('git', ['diff', commitRange, '--name-only', '--diff-filter=ACMR']),
    prop('stdout'),
    split('\n'),
    filter(file => extensions.split(',').some(ext => endsWith(ext, file))),
    map(path.resolve),
  ]
)

const getDiff = curry((commitRange, filename) =>
  exec('git', ['diff', commitRange, filename])
    .then(prop('stdout')))

const getChangedFileLineMap = curry((commitRange, filePath) => pipeWith(
  then,
  [
    getDiff(commitRange),
    getChangedLinesFromDiff,
    objOf('changedLines'),
    assoc('filePath', filePath),
  ]
)(filePath))

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

  const countBySeverity = severity =>
    pipe(
      filter(propEq('severity', severity)),
      length
    )

  const countWarningMessages = countBySeverity(1)
  const countErrorMessages = countBySeverity(2)

  const warningCount = (result) => {
    const transform = {
      warningCount: countWarningMessages(result.messages),
    }

    return merge(result, transform)
  }

  const errorCount = (result) => {
    const transform = {
      errorCount: countErrorMessages(result.messages),
    }

    return merge(result, transform)
  }

  return pipe(
    prop('results'),
    map(pipe(
      filterMessagesByFile,
      warningCount,
      errorCount
    )),
    objOf('results')
  )(linterOutput)
}

const applyLinter = changedFileLineMap => pipe(
  lintChangedLines,
  filterLinterMessages(changedFileLineMap)
)(changedFileLineMap)

const logResults = pipe(
  prop('results'),
  formatter,
  console.log
)

const getErrorCountFromReport = pipe(
  prop('results'),
  pluck('errorCount'),
  sum
)

const exitProcess = curryN(2, n => process.exit(n))

const reportResults = pipe(
  tap(logResults),
  getErrorCountFromReport,
  cond([
    [equals(0), exitProcess(0)],
    [T, exitProcess(1)],
  ])
)

const run = (commitRange = 'HEAD', extensions = '.js') => Promise.resolve(commitRange)
  .then(getChangedFiles(extensions))
  .map(getChangedFileLineMap(commitRange))
  .then(applyLinter)
  .then(reportResults)

export default run
