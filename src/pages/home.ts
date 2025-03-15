import van from "vanjs-core";
const { a, section } = van.tags;

export function Home() {
    return section({ class: 'home' },
        a({ class: 'btn btn-lg btn-success', href: '#panel/demo' }, 'Demo'),
        a({ href: '#manage' }, 'Manage')
    );
}