const fs = require("fs")
const path = require("path")
const xlsx = require("node-xlsx")
const chalk = require("chalk")
const { program } = require("commander")
const { promisify } = require("util");
const writeFileAsync = promisify(fs.writeFile);

const { asyncMakeDir, trans2I18nData } = require("../lib/utils");
const { JSON_EXTS, languageCode } = require("../lib/constants");


const pkg = require("../package.json")

program
  .version(pkg.version)
  .option("-x, --xlsx <string>", ".xlsx格式文件路径")
  .option("-g, --google <string>", "google sheets id")
  .option("-s, --sheet <string>", "sheet name") // 不指定sheet name则默认为Sheet1
  .option("-o, --output <string>", "转换后的文件输出路径")
;

// 解析命令参数
program.parse(process.argv);

// 开始主任务
main(program);

async function main(program) {
  const { xlsx, google, sheet, output } = program.opts();
  let outputDir = path.resolve(__dirname, "../i18n");


  if (output) {
    outputDir = await asyncMakeDir({ outputPath: output });
  } else {
    console.log(chalk.red('请输入转换后的文件输出路径'));
    return;
  }

  if (xlsx) {
    parseXLSXFile({
      filePath: xlsx,
      sheetName: sheet,
      outputPath: outputDir,
    });
  } else if (google) {
    parseGoogleSheets({
      googleId: google,
      sheetName: sheet,
      outputPath: outputDir,
    });
  } else {
    console.log(chalk.red('请输入需要转换的xlsx文件路径或google sheets id'));
  }
};

/**
 * 
 * 解析xlsx文件，并导出json文件
 * @param {string} filePath .xlsx文件所在路径
 * @param {string} sheetName 指定要导出的sheet name
 * @param {string} outputPath json文件输出路径
 * 
 */
function parseXLSXFile({ filePath, sheetName, outputPath }) {
  console.log(chalk.green(`开始解析.xlsx文件：${filePath}`))

  try  {
    if (fs.existsSync(filePath)) {
      // 读取xlsx格式文件
      const workSheetsFromFile = xlsx.parse(filePath);

      asyncExportJSON({
        data: workSheetsFromFile,
        sheetName,
        outputPath,
      });

    } else {
      console.log(chalk.red(`.xlsx格式文件路径不正确：${err}`))
    }
  } catch (err) {
    console.log(chalk.red(`读取文件失败：${err}`))
  }
};

function parseGoogleSheets() {
  console.log(chalk.green(`开始解析google sheets：`))

  // TODO
};

/**
 * 
 * 将数据处理为i18n格式，并导出json文件
 * @param {object} data 数据源
 * @param {string} sheetName 指定要导出的sheet name
 * @param {string} ext 文件扩展名
 * @param {string} outputPath 文件输出路径
 * 
 */
async function asyncExportJSON({ data, outputPath, sheetName, ext = JSON_EXTS.JSON }) {
  let dataSource = data;
  // 导出指定sheet数据
  if (sheetName) {
    dataSource = dataSource.filter(i => i.name === sheetName);
  }

  // 默认导出sheet1中数据
  const i18nData = trans2I18nData(dataSource[0].data);

  for (i in i18nData) {
    // 将数据写入文件
    try {
      // 文件导出路径
      const exportFilePath = `${outputPath}/${i}${ext}`;
      await writeFileAsync(exportFilePath, JSON.stringify(i18nData[i], null, 2));
      console.log(chalk.green(`文件导出成功：${exportFilePath}`));
    } catch (err) {
      console.log(chalk.red(`文件导出失败：${err}`));
    }
  }

  console.log(chalk.green('所有文件导出完毕！✨'));
}
