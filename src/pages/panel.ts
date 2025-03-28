import JSZip from "jszip";
import van from "vanjs-core";

const { div, img, label, section } = van.tags

function renderButtons(buttons: Button[], zip: JSZip) {
    return Array.from(buttons, ([text, icon, audio]) => {
        const image = img();
        const card = div({ class: 'card' }, image, label(text))
        icon && zip.file(icon)?.async('base64').then(x => image.src = 'data:image/png;base64,' + x);
        audio && zip.file(audio)?.async('base64').then(x => {
            const mp3 = new Audio('data:audio/mpeg;base64,' + x);
            card.addEventListener('click', () => mp3.play());
        });
        return card;
    });
}

export function Panel(name: string) {
    const grid = section({ class: 'grid' });
    const zip = JSZip();
    fetch(`/panels/${name}`)
        .then(x => x.bytes())
        .then(x => zip.loadAsync(x))
        .then(x => x.file('panel')!.async('string'))
        .then<Panel>(x => JSON.parse(x))
        .then(x => grid.append(
            ...renderButtons(x.home, zip),
            ...renderButtons(x.grid, zip)));
    return grid;
}