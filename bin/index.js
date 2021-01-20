const { program } = require("commander")
const pkg = require("../package.json")

console.log(pkg.version)

program
  .version(pkg.version)
  .option("-x, --xlsx <string>", ".xlsx格式文件")
;

// 解析命令参数
program.parse(process.argv);

// 开始主任务
main(program);

async function main(program) {
  console.log(program)
}