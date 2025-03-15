import van from "vanjs-core";
const { div, button, nav, h1, li, ul, a } = van.tags;

export function Navbar() {
    return nav(
        a({href: '#'},h1("Komunikátor")),
        div({ class: 'dropdown d-none' },
            button({ class: 'btn btn-secondary dropdown-toggle', tabIndex: -1, onclick(e: Event) { e.stopPropagation() } }),
            ul({ class: 'dropdown-menu end-0' },
                li(a({ class: 'dropdown-item active', href: '#panel/demo' }, 'Demo')),
                li({ class: 'dropdown-divider' }),
                li(a({ class: 'dropdown-item', href: '#home' }, 'Home')))))
}