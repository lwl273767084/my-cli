const fs = require('fs')
const path = require('path')

function removeDir(dir) {
  console.log('需要删除的路径', dir)
  const files = fs.readdirSync(dir)
  console.log('需要删除的文件', files)
  for (let i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i])
    let stat = fs.statSync(newPath)
    if (stat.isDirectory()) { // 如果是文件夹就递归下去
      removeDir(newPath)
    } else {
      fs.unlinkSync(newPath)
    }
  }
  // 如果文件夹是空的, 删除文件夹
  fs.rmdirSync(dir)
}

module.exports = removeDir;
