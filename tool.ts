import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { writeFile, readFile } from 'node:fs/promises';
import DigestFetch from 'digest-fetch';
import JSZip from 'jszip';
const rl = readline.createInterface({ input, output });

//Přihlašovací údaje pro TTS v souboru `tool.auth.txt` ve tavru `jmeno;heslo`

(async () => {
    const auth = (await readFile('./tool.auth.txt')).toString().split(';');
    const client = new DigestFetch(auth[0], auth[1]);

    const zip = new JSZip();
    const panel: { grid: string[] } = { grid: [] };

    for (let index = 1; index <= 9; index++) {
        const text = await rl.question(index + ': ');

        await readFile(`./images/${text}.png`)
            .then(x => zip.file(text + '.png', x))

            .then(() => client.fetch('https://speechcloud.kky.zcu.cz:8887/tts/v4/synth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'engine=Oldrich30&text=' + text + '&format=mp3'
            }))
            .then(x => x.bytes())
            .then(x => zip.file(text + '.mp3', x))

            .then(() => { panel.grid.push(text); })
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