import fs from 'fs';
import http from 'http';
import { Command } from 'commander';

const program = new Command();

program.helpOption(false);
program.option('--help', 'Відобразити довідку');

program
  .requiredOption('-i, --input <path>', 'шлях до файлу даних')
  .requiredOption('-h, --host <address>', 'адреса сервера')
  .requiredOption('-p, --port <number>', 'порт сервера')
  .option('-o, --output <path>', 'файл для запису останньої відповіді');

program.parse(process.argv);
const options = program.opts();

// Перевірка існування файлу через КОЛБЕК
fs.access(options.input, fs.constants.F_OK, (err) => {
  if (err) {
    // Якщо файл не знайдено — виводимо точну фразу з методички
    console.error('Cannot find input file');
    // process.exit(1) завершує програму з ненульовим кодом (помилка)
    process.exit(1);
  }

  startServer();
});

function startServer() {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${options.host}:${options.port}`);

    // 1. Якщо шлях не "/" — одразу 404
    if (url.pathname !== '/') {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'Маршрут не знайдено' }));
    }

    // 2. Перевірка числа: якщо передали букви замість цифр — 400
    const minLen = url.searchParams.get('min_petal_length');
    if (minLen !== null && isNaN(Number(minLen))) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      return res.end(JSON.stringify({ error: 'Параметр min_petal_length має бути числом' }));
    }

    const showVariety = url.searchParams.get('variety') === 'true';

    // 3. Читаємо файл (колбек)
    fs.readFile(options.input, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Помилка читання файлу' }));
      }

      // 4. Розбиваємо рядки NDJSON на об'єкти
      let flowers = data.trim().split('\n').map(line => JSON.parse(line));

      // 5. Якщо є фільтр — фільтруємо квітки
      if (minLen !== null) {
        flowers = flowers.filter(f => Number(f['petal.length']) > Number(minLen));
      }

      // 6. Формуємо відповідь лише з потрібними полями
      const result = flowers.map(f => {
        const item = {
          petal_length: Number(f['petal.length']),
          petal_width: Number(f['petal.width'])
        };
        if (showVariety) item.variety = f.variety;
        return item;
      });

      // 7. Відправляємо результат
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result, null, 2));
    });
  });

  server.listen(options.port, options.host, () => {
    console.log(`Сервер працює: http://${options.host}:${options.port}`);
  });
}