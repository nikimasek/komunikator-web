import van from "vanjs-core";
import JSZip from 'jszip';
import "bootstrap/dist/css/bootstrap.css"
import "./style.css";
const { main, div, button, img, label, nav, h1, li, ul } = van.tags;

type Button = [label: string, filename: string];
let panel: { grid: Button[] };

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
async function audio(file: string) {
    let audio = audios[file];
    if (!audio) {
        await zip.file(file + '.mp3')!
            .async('base64')
            .then(x => audio = audios[file] = new Audio('data:audio/mpeg;base64,' + x));
    }
    audio.play();
}

function App() {
    return main(
        nav(
            h1("Komunikátor"),
            div({ class: 'dropdown' },
                button({ class: 'btn btn-secondary dropdown-toggle', tabIndex: -1, onclick(e: Event) { e.stopPropagation() } }),
                ul({ class: 'dropdown-menu end-0' },
                    li({ class: 'dropdown-item active' }, 'Demo'),
                    li({ class: 'dropdown-divider' }),
                    li({ class: 'dropdown-item' }, 'Nastavení')))),
        div({ class: 'grid' },
            div({ class: 'card menu' }),
            div({ class: 'card menu' }),
            div({ class: 'card menu' }),
            Array.from(panel.grid, (x) => {
                const image = img();
                zip.file(x[1] + '.png')?.async('blob').then(x => image.src = URL.createObjectURL(x))
                return div({ class: 'card', onclick() { audio(x[1]); } }, image, label(x[0]));
            })
        )
    );
}
