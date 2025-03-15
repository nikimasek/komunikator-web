import van from "vanjs-core";
import JSZip from 'jszip';
import "bootstrap/dist/css/bootstrap.css"
import "./style.css";
const { main, div, button, img, label } = van.tags;

let panel: { grid: [] };

const zip = new JSZip();
fetch('./data.zip')
    .then(x => x.bytes())
    .then(x => zip.loadAsync(x))
    .then(() => zip.file('panel.json')?.async('string'))
    .then(x => {
        panel = JSON.parse(x!);
        van.add(document.body, App);
    });

const audios: Record<string, HTMLAudioElement> = {};
async function audio(text: string) {
    let audio = audios[text];
    if (!audio) {
        await zip.file(text + '.mp3')!
            .async('blob')
            .then(x => audio = audios[text] = new Audio(URL.createObjectURL(x)));
    }
    audio.play();
}

function App() {
    return main(
        div({ class: 'grid' },
            div({ class: 'card' }),
            div({ class: 'card' }),
            div({ class: 'card' }),
            Array.from(panel.grid, (x) => {
                const image = img();
                zip.file(x + '.png')?.async('blob').then(x => image.src = URL.createObjectURL(x))
                return div({ class: 'card', onclick() { audio(x); } }, image, label(x));
            })
        )
    );
}
