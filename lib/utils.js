const fs = require("fs");
const path = require("path")
const chalk = require("chalk");
const { promisify } = require("util");
const mkdirAsync = promisify(fs.mkdir);

/**
 * 
 * 判断文件夹路径是否存在
 * @param {string} dirPath 文件夹路径
 * @return {boolean}
 * 
 */
function isExistDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      return fs.statSync(dirPath).isDirectory();
    }catch(err){
      console.log(chalk.red(`路径有误：${dirPath}`))
    }
  }

  return false;
}

/**
 * 
 * 将xlsx数据转换为多语言数据
 * @param {array} data [["文案描述", "zh-CN", "en-US"], [null, "下一步", "Next"]]
 * @returns {object} {'zh-CN': { '下一步': '下一步' }, 'en-US': { '下一步': 'Next' }}
 * 
 */
function trans2I18nData(data = []) {
  let i18nDatas = {};
  let keyArrs = [];

  for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
    const rowData = data[rowIndex];

    // 第一列为文案描述，从第二列开始遍历
    for (let colIndex = 1; colIndex < rowData.length; colIndex++) {
      const tableTitle = data[0][colIndex]; // 表格标题栏：文案描述及语言码
      const cellVal = rowData[colIndex]; // 每个单元格的内容

      if (colIndex === 1) {
        // 保存多语言文案所需的key（即第二列中文文案），并去除换行符、小数点、空白
        keyArrs[rowIndex] = cellVal.replace(/\s|\./g, "");
      }
      
      if (rowIndex === 0) {
        i18nDatas[tableTitle] = {}
      } else {
        const languageKey = keyArrs[rowIndex];
        // 向对应语言中添加文案，并将多空格替换为单空格，去除首尾空白
        i18nDatas[tableTitle][languageKey] = cellVal.replace(/[ ]+/g," ").trim();
      }

    }
  }

  return i18nDatas;
};

/**
 * 
 * 判断路径创建i18n文件夹，返回路径
 * @param {string} path 文件输入路径
 * @param {string} dirName 自定义文件夹名，默认为i18n
 * @returns {string} 文件夹路径
 * 
 */
async function asyncMakeDir({ outputPath, dirName = 'i18n'}) {
  if (isExistDir(outputPath) === true) {
    // 输出路径正确
    const i18nDir = path.parse(outputPath).name === dirName ? outputPath : path.resolve(outputPath, `./${dirName}`);

    if (!isExistDir(i18nDir)) { // 没有文件夹则创建
      await mkdirAsync(i18nDir)
    }
    return i18nDir;
  } else {
    console.log(chalk.red(`路径有误：${outputPath}`))
  }
};

module.exports = {
  isExistDir,
  asyncMakeDir,
  trans2I18nData,
}
