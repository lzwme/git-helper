
const path = require('path');
const fs = require('fs');

const start = () => {
  const list = process.argv.slice(2).filter(Boolean).map(d => path.resolve(d));
  list.forEach(dest => {
    if (!fs.existsSync(dest)) return console.log('指定的目录不存在：', dest);
    fs.rmSync(dir, { recursive: true, force: true });
    console.log('目录已删除：', dest);
  });
}

start();
