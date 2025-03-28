import van from "vanjs-core";
const { a, section } = van.tags;

export function Home() {
    location.hash = '';
    const list = section({ class: 'home' });
    fetch('/panels')
        .then(x => x.json())
        .then((x: string[]) => list.append(...x.map(x => {
            return a({ href: `#panel/${x}`, class: "btn btn-lg btn-success" }, x)
        })));
    return list;
}