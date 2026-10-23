import {Command} from 'commander';

const program = new Command();

program.option('--help', 'Відобразити довідку');

program
    .requiredOption('-i, --input <path>', 'Шлях до файлу')
    .option('-o, --output <path>', 'Шлях для запису результату')
    .requiredOption('-h, --host <address>', 'Адреса сервера')
    .requiredOption('-p, --port <number>', 'Порт сервера')

program.parse(process.argv);
const options = program.opts();

console.log("Параметри успішно зчитані:", options);