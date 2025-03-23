import express from 'express';
import { IncomingForm } from 'formidable';
import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
const __dirname = import.meta.dirname;

const app = express();

app.get('/plates', (req, res) => {
    readdir(path.resolve(__dirname, 'src/public/plates'))
        .then(files => res.json(files.filter(x => x.endsWith('.zip')).map(x => x.substring(0, x.length - 4))));
});
app.get('/plates/:plate', (req, res) => {
    const file = req.params.plate;
    if (file.endsWith('.zip'))
        res.sendFile(path.resolve(__dirname, 'src/public/plates', file))
    else
        res.sendStatus(404);
});

app.post('/plates/:plate', (req, res) => {
    new IncomingForm().parse(req, async (err, fields, files) => {
        const [file] = files!.panel!;
        await writeFile(
            path.resolve(__dirname, 'src/public/plates', req.params.plate + '.zip'),
            await readFile(file.filepath)
        );
        res.send('ok');
    });
});

app.get('/voice', (req, res) => {
    fetch(`https://translate.google.com/translate_tts?tl=cs-CZ&q=${encodeURIComponent((req.query as any).text)}&client=tw-ob`)
        .then(x => x.blob())
        .then(async x => {
            res.type(x.type);
            res.send(Buffer.from(await x.arrayBuffer()));
        });
});

app.listen(3289);