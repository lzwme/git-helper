import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const start = () => {
  const list = process.argv
    .slice(2)
    .filter(Boolean)
    .map(d => resolve(d));
  list.forEach(dest => {
    if (!existsSync(dest)) return console.log('指定的目录不存在：', dest);
    rmSync(dest, { recursive: true, force: true });
    console.log('目录已删除：', dest);
  });
};

start();
