import JSZip from "jszip";
import van from "vanjs-core";
const { section, ul, li, a, button, div, input, img, label } = van.tags;

function readToDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(file);
    });
}

function download(file: Blob) {
    const blobUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "panel.zip";
    link.innerText = "Click here to download the file";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
}

async function save(parent: HTMLElement) {
    const zip = JSZip();
    const panel: Panel = { grid: [], home: [], menu: [] };
    for (const image of parent.querySelectorAll('div')) {
        const label = image.querySelector<HTMLInputElement>('input[type=text]')!.value;
        const src = image.querySelector<HTMLImageElement>('img')!.src;
        let file: string | null = null;
        if (src.startsWith('data:')) {
            file = Math.random().toString(16).substring(2, 8);
            zip.file(file + '.png', src.substring(src.indexOf(',') + 1), { base64: true });
        }
        if (file && label) {
            await fetch('/voice?text=' + encodeURIComponent(label))
                .then(x => x.bytes())
                .then(x => zip.file(file + '.mp3', x));
        }
        panel.grid.push([label, file!]);
    }
    zip.file('panel.json', JSON.stringify(panel));
    zip.generateAsync({ type: 'blob' }).then(download);
}

export function Edit() {
    const edit = section({ class: 'grid edit' },
        button({
            role: 'button',
            class: 'btn btn-success end-0 m-2 position-fixed top-0',
            onclick() { save(edit); }
        }, 'save'),
        Array.from({ length: 9 }, () => {
            const image = img();
            const file = input({
                type: 'file', class: 'form-control d-none',
                async onchange() {
                    const src = await readToDataUrl(file.files![0]);
                    image.src = src;
                    file.value = '';
                    remove.hidden = false;
                }
            });
            const remove = button({
                class: 'top-0 end-0 position-absolute btn btn-sm',
                hidden: true,
                onclick() {
                    image.src = '';
                    text.value = '';
                    remove.hidden = true;
                }
            }, '❌');
            const text = input({ type: 'text', class: 'border-0 border-top bottom-0 form-control position-absolute rounded-0 text-center' });
            const item = div({ class: 'm-1 position-relative border rounded' },
                label({ class: 'top-0 position-absolute btn btn-sm' }, file, '🖌️'),
                remove,
                image,
                text
            );
            return item;
        })
    )
    return edit;
}