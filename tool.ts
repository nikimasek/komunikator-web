import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { writeFile, readFile } from 'node:fs/promises';
import JSZip from 'jszip';
const rl = readline.createInterface({ input, output });

(async () => {
    const zip = new JSZip();
    const panel: { grid: string[] } = { grid: [] };

    for (let index = 1; index <= 9; index++) {
        const text = await rl.question(index + ': ');

        await readFile(`./images/${text}.png`)
            .then(x => {
                zip.file(text + '.png', x);
                panel.grid.push(text);
            })
            .catch(() => {
                console.log('file not exist');
                index--;
            });
    }

    zip.file('panel.json', JSON.stringify(panel));

    zip.generateAsync({ type: 'nodebuffer' })
        .then(x => writeFile('./src/public/data.zip', x as any));

    rl.close();
})();