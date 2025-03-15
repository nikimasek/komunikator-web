import van from "vanjs-core";
const { section, ul, li, a } = van.tags;

export function Manage() {
    const allPlates = van.state<string[]>([]);
    fetch('/plates').then(x => x.json()).then(x => allPlates.val = x);
    return section(
        () => ul({ class: "list-group" },
            allPlates.val.map(x => {
                return li({ class: "list-group-item" }, x)
            })
        ),
        a({ href: '#' }, 'Home')
    )
}
