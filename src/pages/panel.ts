import JSZip from "jszip";
import van from "vanjs-core";

const { div, img, label, section } = van.tags

export function Panel(name: string) {
    console.log(name);
    const grid = section({ class: 'grid' });
    const zip = new JSZip();
    fetch('./data.zip')
        .then(x => x.bytes())
        .then(x => zip.loadAsync(x))
        .then(x => x.file('panel.json')!.async('string'))
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