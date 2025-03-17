import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { writeFile, readFile } from 'node:fs/promises';
import JSZip from 'jszip';
const rl = readline.createInterface({ input, output });
const tts = 'https://translate.google.com/translate_tts';

type Button = [lable: string, file: string]
type Panel = {
    grid: Button[];
    menu: Button[];
}

const zip = await JSZip.loadAsync(await readFile('./panel.zip'));

console.clear();
console.log('   |   |   ');
console.log(' 1 | 2 | 3 ');
console.log(' 4 | 5 | 6 ');
console.log(' 7 | 8 | 9 ');
const panel: Panel = {
    grid: [],
    menu: [['Chci', 'chci'], ['Nechci', 'nechci'], ['Ještě', 'jeste']]
};

for (let i = 1; i <= 9; i++) {
    console.log();
    let image: string, file: Buffer | null;
    do {
        image = await rl.question(`image ${i}:`);
        file = await readFile(`./images/${image}.png`).catch(() => null);
        if (!file) console.log('file not exist');
    } while (!file);
    const label = (await rl.question(`label (${image}):`)) || image;
    const audio = await fetch(`${tts}?tl=cs-CZ&q=${encodeURIComponent(label)}&client=tw-ob`).then(x => x.bytes());
    const fileName = Math.random().toString(16).substring(2, 8);
    zip.file(fileName + '.png', file);
    zip.file(fileName + '.mp3', audio);
    panel.grid.push([label, fileName]);
}
zip.file('panel.json', JSON.stringify(panel));

console.log();
let name: string;
do {
    name = await rl.question(`name of panel: `);
} while (!/^\w+$/.test(name))

await zip.generateAsync({ type: 'nodebuffer' }).then(x => writeFile(`./src/public/plates/${name}.zip`, x as any));
rl.close();