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

function initFiles() {
    const files = new Set<string>();
    return () => {
        let file: string;
        do { file = Math.random().toString(16).substring(2, 8); }
        while (files.has(file));
        files.add(file);
        return file;
    }
}

async function save(parent: HTMLElement): Promise<Blob> {
    const zip = JSZip();
    const panel: Panel = { grid: [], home: [] };
    const file = initFiles();
    for (const card of parent.querySelectorAll('div.item')) {
        const label = card.querySelector<HTMLInputElement>('input[type=text]')!.value || '';
        const src = card.querySelector<HTMLImageElement>('img')!.src;
        const item: Button = [label, null, null];
        let image: string | undefined = undefined;
        if (src.startsWith('data:')) {
            image = item[1] =file();
            zip.file(image, src.substring(src.indexOf(',') + 1), { base64: true });
        }
        if (image && label) {
            const audio = item[2] = file();
            await fetch('/voice?text=' + encodeURIComponent(label))
                .then(x => x.bytes())
                .then(x => zip.file(audio, x));
        }
        panel.grid.push(item);
    }
    zip.file('panel', JSON.stringify(panel));
    return zip.generateAsync({ type: 'blob' });
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
                return fetch(`/panels/${name}`, { body, method: 'POST' });
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