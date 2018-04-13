import Promise from 'bluebird'
import exec from 'execa'
import path from 'path'
import { CLIEngine } from 'eslint'
import {
  assoc,
  curry,
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

const getChangedFiles = pipeP(
  commitRange => exec('git', ['diff', commitRange, '--name-only']),
  prop('stdout'),
  split('\n'),
  filter(endsWith('.js')),
  map(path.resolve)
)

const getDiff = curry((commitRange, filename) =>
  exec('git', ['diff', commitRange, filename])
    .then(prop('stdout')))

const getChangedFileLineMap = curry((commitRange, filePath) => pipeP(
  getDiff(commitRange),
  getChangedLinesFromDiff,
  objOf('changedLines'),
  assoc('filePath', filePath)
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

const run = commitRange => Promise.resolve(commitRange)
  .then(getChangedFiles)
  .map(getChangedFileLineMap(commitRange))
  .then(applyLinter)
  .then(reportResults)
  .tap(console.log)

export default run
