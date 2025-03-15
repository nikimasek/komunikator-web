import JSZip from "jszip";
import van from "vanjs-core";

const { div, img, label, section } = van.tags

export function Panel(zip: JSZip) {
    const grid = section({ class: 'grid' });
    zip.file('panel.json')?.async('string')
        .then(JSON.parse)
        .then((panel: Panel) => {
            grid.append(
                div({ class: 'card menu' }),
                div({ class: 'card menu' }),
                div({ class: 'card menu' }),
                ...Array.from(panel.grid, ([text, file]) => {
                    const image = img();
                    const card = div({ class: 'card' }, image, label(text))
                    zip.file(file + '.png')?.async('blob')
                        .then(x => image.src = URL.createObjectURL(x));
                    zip.file(file + '.mp3')?.async('base64')
                        .then(x => {
                            const audio = new Audio('data:audio/mpeg;base64,' + x);
                            card.addEventListener('click', audio.play.bind(audio));
                        });
                    return card;
                })
            )
        });
    return grid;
}