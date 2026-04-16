import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { algorithmCategories } from '../src/data/algorithms'

const outputPath = resolve(process.cwd(), '../alg_app/assets/data/algorithms.json')

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(
  outputPath,
  JSON.stringify({ algorithmCategories }, null, 2),
  'utf8',
)

console.log(`Exported algorithms to ${outputPath}`)
