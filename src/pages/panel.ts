import JSZip from "jszip";
import van from "vanjs-core";

const { div, img, label, section } = van.tags

function renderButtons(buttons: Button[], zip: JSZip, style: string) {
    return Array.from(buttons, ([text, file]) => {
        const image = img();
        const card = div({ class: style }, image, label(text))
        zip.file(file + '.png')?.async('blob')
            .then(x => image.src = URL.createObjectURL(x));
        zip.file(file + '.mp3')?.async('base64')
            .then(x => {
                const audio = new Audio('data:audio/mpeg;base64,' + x);
                card.addEventListener('click', audio.play.bind(audio));
            });
        return card;
    });
}

export function Panel(name: string) {
    const grid = section({ class: 'grid' });
    const zip = new JSZip();
    fetch(`/plates/${name}.zip`)
        .then(x => x.bytes())
        .then(x => zip.loadAsync(x))
        .then(x => x.file('panel.json')!.async('string'))
        .then(JSON.parse)
        .then((panel: Panel) => {
            grid.append(
                ...renderButtons(panel.menu, zip, 'card menu'),
                ...renderButtons(panel.grid, zip, 'card')
            )
        });
    return grid;
}