import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { writeFile, readFile } from 'node:fs/promises';
import DigestFetch from 'digest-fetch';
import JSZip from 'jszip';
const rl = readline.createInterface({ input, output });
type Button = [label: string, files: string];

//Přihlašovací údaje pro TTS v souboru `tool.auth.txt` ve tavru `jmeno;heslo`

(async () => {
    const zip = new JSZip();
    const auth = (await readFile('./tool.auth.txt')).toString().split(';');
    const client = new DigestFetch(auth[0], auth[1]);

    console.clear();
    console.log('   |   |   ');
    console.log(' 1 | 2 | 3 ');
    console.log(' 4 | 5 | 6 ');
    console.log(' 7 | 8 | 9 ');
    const panel: { grid: Button[] } = { grid: [] };

    for (let i = 1; i <= 9; i++) {
        console.log();
        let image: string, file: Buffer | null;
        do {
            image = await rl.question(`image ${i}:`);
            file = await readFile(`./images/${image}.png`).catch(() => null);
            if (!file) console.log('file not exist');
        } while (!file);
        const label = (await rl.question(`label (${image}):`)) || image;
        const body = new URLSearchParams({ engine: 'Oldrich30', text: label, format: 'mp3' }).toString()
        const audio = await client.fetch('https://speechcloud.kky.zcu.cz:8887/tts/v4/synth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body
        }).then(x => x.bytes());

        const fileName = Math.random().toString(16).substring(2, 8);
        zip.file(fileName + '.png', file);
        zip.file(fileName + '.mp3', audio);
        panel.grid.push([label, fileName]);
    }
    zip.file('panel.json', JSON.stringify(panel));

    await zip.generateAsync({ type: 'nodebuffer' }).then(x => writeFile('./src/public/data.zip', x as any));
    rl.close();
})();