const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const remove = require('./remove')

module.exports = function (context) {
  console.log('用户输入信息', context)
  let metadata = context.metadata
  let src = context.downloadTemp
  let dest = './' + context.root

  if (!src) {
    return Promise.reject(new Error(`无效的source，${src}`))
  }
  return new Promise((resolve, reject) => {
    const metalsmith = Metalsmith(process.cwd())
      .metadata(metadata) // 用户输入的内容
      .clean(false)
      .source(src) // 模板文件的位置
      .destination(dest) // 编译号的文件存放位置
    // 判断当前目录下面是否有被忽略的文件 templates.ignore
    const ignoreFile = path.resolve(process.cwd(), path.join(src, 'templates.ignore'))
    // 临时 package.json 目录
    // const packjsonTemp = path.resolve(process.cwd(), path.join(src, 'package_temp.json'))
    // let package_temp_content;
    if (fs.existsSync(ignoreFile)) {
      // 定义一个用于移除模板中的文件的 metalsmith 插件
      metalsmith.use((files, metalsmith, done) => {
        const meta = metalsmith.metadata()
        // 先对ignore文件进行渲染，然后按行切割ignore文件的内容，拿到被忽略清单
        const ignores = Handlebars.compile(fs.readFileSync(ignoreFile).toString())(meta)
          .split('\n')
          .map(s => s.trim().replace('/\//g,"\\"'))
          .filter(item => item.length)
        // 删除被忽略的文件
        for (let ignorePattern of ignores) {
          if (files.hasOwnProperty(ignorePattern)) {
            delete files[ignorePattern]
          }
        }
        done()
      })
    }

    // metalsmith.use((files, metalsmith, done) => {
    //   const meta = metalsmith.metadata();
    //   package_temp_content = Handlebars.compile(fs.readFileSync(packjsonTemp).toString())(meta);
    //   done();
    // })

    metalsmith.use((files, metalsmith, done) => {
      const meta = metalsmith.metadata()
      console.log('替换数据', meta)
      Object.keys(files).forEach(fileName => {
        const bufferStr = files[fileName].contents.toString() // handlebars 转换前需要 toString
        // if (fileName == 'package.json') {
        //   files[fileName].contents = new Buffer(package_temp_content)
        // } else {
        files[fileName].contents = new Buffer(Handlebars.compile(bufferStr)(meta))
        // }
        done()
      })
      done()
    }).build(err => {
      // 删除
      remove(src)
      err ? reject(err) : resolve(err)
    })
  })
}