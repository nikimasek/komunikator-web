import express from 'express';
import { IncomingForm } from 'formidable';
import { readdir, copyFile } from 'fs/promises';
import path from 'path';
const __dirname = import.meta.dirname;

const app = express();

const panels = path.resolve(__dirname, 'panels');
app.get('/panels', (_, res) => {
    readdir(panels).then(files => res.json(files.filter(x => x.endsWith('.zip')).map(x => x.substring(0, x.length - 4))));
});
app.get('/panels/:panel', (req, res) => {
    res.sendFile(path.resolve(panels, req.params.panel + '.zip'))
});
app.post('/panels/:panel', (req, res) => {
    new IncomingForm().parse(req, async (_err, _fields, files) => {
        const [file] = files?.panel ?? [];
        copyFile(file.filepath, path.resolve(panels, req.params.panel + '.zip')).then(() => res.send('ok'));
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