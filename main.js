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
    // Створюємо сервер за допомогою модуля http
  const server = http.createServer((req, res) => {
    // Розбираємо адресу запиту
    const url = new URL(req.url, `http://${options.host}:${options.port}`);
    // Перевірка шляху: ТІЛЬКИ корінь "/"
    if (url.pathname !== '/') {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Маршрут не знайдено' }));
      return;
    }
    // Тимчасова відповідь для перевірки, що сервер працює на "/"
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ message: 'Сервер успішно працює!' }));
  });
  // Запускаємо прослуховування нашого порту й хоста
  server.listen(options.port, options.host, () => {
    console.log(`Сервер працює на http://${options.host}:${options.port}`);
  });

}