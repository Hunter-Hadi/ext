import { execSync } from 'child_process'
import { promises as fs } from 'fs'
import _ from 'lodash-es'

import readline from 'readline'
import  { buildI18n } from './build-i18n-script.mjs'

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    return await new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer)
      })
    })
  } finally {
    rl.close()
  }
}

async function compareJson(filePath) {
  try {
    // 获取上一个 commit 中的文件内容
    const oldFileContent = execSync(`git show HEAD:${filePath}`, { encoding: 'utf8' })

    // 读取当前文件的内容
    const newFileContent = await fs.readFile(filePath, 'utf8')

    // 将内容解析为 JSON 对象
    const oldJson = JSON.parse(oldFileContent)
    const newJson = JSON.parse(newFileContent)

    // 自定义差异比较
    function findDifferences(obj1, obj2, path = '') {
      const keys1 = _.keys(obj1)
      const keys2 = _.keys(obj2)

      // 获取所有的键
      const uniqueKeys = _.union(keys1, keys2)

      const differences = []

      uniqueKeys.forEach(key => {
        const value1 = obj1[key]
        const value2 = obj2[key]
        const currentPath = path ? `${path}.${key}` : key

        if (_.isObject(value1) && _.isObject(value2)) {
          differences.push(...findDifferences(value1, value2, currentPath))
        } else if (!_.isEqual(value1, value2)) {
          let operation = ''
          if (value1 === undefined) {
            operation = 'add'
          } else if (value2 === undefined) {
            operation = 'remove'
          } else {
            operation = 'update'
          }
          differences.push({
            path: currentPath,
            oldValue: value1,
            newValue: value2,
            operation: operation,
            finalPath: key, // 修改这里，只保存最内层 key
          })
        }
      })

      return differences
    }

    const detailedDifferences = findDifferences(oldJson, newJson)
    return detailedDifferences
  } catch (error) {
    console.error('Error comparing JSON files:', error)
    return []
  }
}

// 指定要对比的文件路径（相对路径）
const filePath = 'src/i18n/locales/en/index.json'

// 调用比较函数
const main = async () => {
  const diffData = await compareJson(filePath)
  const addItems = diffData.filter(item => item.operation === 'add')
  const removeItems = diffData.filter(item => item.operation === 'remove')
  const updateItems = diffData.filter(item => item.operation === 'update')
  console.log('Diff结果:\n')
  console.log('🟩新增:', addItems.length, '个')
  console.log('\x1b[32m', JSON.stringify(addItems.map(item => item.path), null, 2))
  console.log('🟦更新:', updateItems.length, '个')
  console.log('\x1b[34m', JSON.stringify(updateItems.map(item => item.path), null, 2))
  console.log('🟨删除:', removeItems.length, '个')
  console.log('\x1b[33m', JSON.stringify(removeItems.map(item => item.path), null, 2))
  console.log('\x1b[0m')
  // shell询问是否继续执行
  const answer = await askQuestion('是否继续执行？(y/n)')
  if (answer !== 'n') {
    if (addItems.length + removeItems.length > 0) {
      console.log('自动添加/删除i18n')
      await buildI18n()
    }
    if (updateItems.length > 0) {
      console.log('手动更新i18n')
      // 因为update的不会自动更新，所以需要手动执行
      await buildI18n(updateItems.map(item => item.finalPath))
    }
  }
}

main()