import JSZip from "jszip";
import van from "vanjs-core";
const { section, button, div, input, img, label, dialog, h5, form } = van.tags;

function readToDataUrl(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(file);
    });
}

async function save(parent: HTMLElement): Promise<Blob> {
    const zip = JSZip();
    const panel: Panel = { grid: [], home: [], menu: [] };
    for (const item of parent.querySelectorAll('div.item')) {
        const label = item.querySelector<HTMLInputElement>('input[type=text]')!.value;
        const src = item.querySelector<HTMLImageElement>('img')!.src;
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
    return await zip.generateAsync({ type: 'blob' });
}

function saveDialog() {
    const panelName = input({
        type: 'text', class: 'form-control', id: 'panelName',
        autocomplete: 'off', spellcheck: false, autofocus: true,
        pattern: /^[a-zA-Z ]{4,30}$/.source, required: true
    });
    const saveButton = button({
        class: 'btn btn-primary', type: 'submit', onclick(ev: Event) {
            ev.preventDefault();
            const editor = document.querySelector<HTMLElement>('section.edit')!;
            const name = panelName.value;
            save(editor).then(x => {
                const body = new FormData();
                body.set('panel', x);
                return fetch(`/plates/${name}`, { body, method: 'POST' });
            }).then(() => { document.location.href = `#panel/${name}`; })
        }
    }, 'Uložit panel');
    const modal = dialog({ class: 'modal-dialog border-0 p-0 rounded', onclose() { panelName.value = ''; } },
        form({ class: 'modal-content', method: 'dialog' },
            div({ class: 'modal-header' },
                h5({ class: 'modal-title' }, 'Uložit panel'),
                button({ class: 'btn-close', type: 'button', onclick() { modal.close(); } })),
            div({ class: 'modal-body was-validated' },
                label({ for: 'panelName', class: 'form-label' }, 'Název panelu:'), panelName),
            div({ class: 'modal-footer' },
                button({ class: 'btn btn-secondary', type: 'button', onclick() { modal.close() } }, 'Storno'),
                saveButton)));
    return modal;
}

export function Edit() {
    const modal = saveDialog();
    const edit = section({ class: 'grid edit' },
        button({
            role: 'button',
            class: 'btn btn-success end-0 m-2 position-fixed top-0',
            onclick() { modal.showModal(); }
        }, 'Uložit'),
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
            const item = div({ class: 'm-1 position-relative border rounded item' },
                label({ class: 'top-0 position-absolute btn btn-sm' }, file, '🖌️'),
                remove, image, text);
            return item;
        }),
        modal
    )
    return edit;
}