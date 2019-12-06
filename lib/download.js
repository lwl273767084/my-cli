const download = require('download-git-repo')
const path = require('path')
const ora = require('ora')

module.exports = function (target) {
  target = path.join(target || '.', '.download-temp')
  return new Promise((reslove, reject) => {
    // download 地址
    let url = 'github:ZoeLeee/my-cli#master'

    const spinner = ora(`正在下载项目模板,地址${url}`)
    spinner.start() // 加载动画
    download(url, target, function (err) {
      if (err) {
        spinner.fail()
        reject(err)
      } else {
        spinner.succeed()
        // 下载的模板存在一个临时路径，下载完成后，可以向下通知这个临时路径，以便后续处理
        reslove(target)
      }
    })
  })
}