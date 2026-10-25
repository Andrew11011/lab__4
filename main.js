import fs from 'fs';
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

  console.log('Файл існує, можна запускати сервер!');
});