#!/usr/bin/env node
const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob')
const download = require('../lib/download')
const inquirer = require('inquirer')
const generator = require('../lib/generator')

program.usage('<project-name>')
// 根据输入获取项目名称
let projectName = process.argv[2]
console.log(projectName);


if (!projectName) { // 项目名称必须写，否则展示help信息
  program.help()
  return
}

// 遍历当前目录
const list = glob.sync('*')
// process.cwd() 当前执行 node 命令的文件夹地址 __dirname：被执行js文件的地址
let rootName = path.basename(process.cwd()) // 根路径名称
let next = undefined
if (list.length) { // 当前目录不为空
  let hasProjectName = list.some(name => {
    const fileName = path.resolve(process.cwd(), name)
    console.log(fileName);
    const isDir = fs.statSync(fileName).isDirectory()
    return fileName === name && isDir
  })
  if (hasProjectName) {
    console.log(`项目${projectName}已经存在`)
    return
  }
  rootName = projectName
  next = Promise.resolve(rootName)
} else if (rootName === projectName) {
  rootName = '.'
  next = inquirer.prompt([{
    name: 'buildProject',
    message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下面创建项目',
    type: 'confirm',
    default: true
  }]).then(answer => {
    return Promise.resolve(answer.buildProject ? '.' : projectName)
  })
} else {
  rootName = projectName
  next = Promise.resolve(projectName)
}

next && go()

function go() {
  next.then(projectRoot => {
    if (projectRoot != '.') {
      fs.mkdirSync(projectRoot)
    }
    return download(projectRoot).then(target => {
      return {
        name: projectRoot,
        root: projectRoot,
        downloadTemp: target
      }
    })
  }).then(context => {
    return inquirer.prompt([
      {
        name: 'projectName',
        message: '请输入项目名称',
        default: context.name
      },
      {
        name: 'projectVersion',
        message: '请输入项目版本号',
        default: '1.0.0'
      },
      {
        name: 'projectDescription',
        
        message: '请输入项目简介',
        default: `a project named ${context.name}`
      }
    ]).then(answer => {
      return {
        ...context,
        metadata: {
          ...answer
        }
      }
    })
  }).then(context => {
    // 删除临时文件，将文件移动到目标目录下
    console.log('用户输入信息', context)
    if (context) return generator(context)
  }).then(context => {
    console.log('创建成功');
  }).catch(err => {
    console.log(err);
  })
}