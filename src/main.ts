import van from "vanjs-core";
import JSZip from 'jszip';
import "bootstrap/dist/css/bootstrap.css"
import "./style.css";
import { Panel } from "./panel";
const { main, div, button, nav, h1, li, ul, section } = van.tags;

function App() {
    const panel = van.state<JSZip | undefined>();

    return main(
        nav(
            h1("Komunikátor"),
            div({ class: 'dropdown' },
                button({ class: 'btn btn-secondary dropdown-toggle', tabIndex: -1, onclick(e: Event) { e.stopPropagation() } }),
                ul({ class: 'dropdown-menu end-0' },
                    li({ class: 'dropdown-item active' }, 'Demo'),
                    li({ class: 'dropdown-divider' }),
                    li({ class: 'dropdown-item' }, 'Nastavení')))),
        () => {
            return panel.val
                ? Panel(panel.val)
                : section({ class: 'home' },
                    button({
                        class: 'btn btn-lg btn-success',
                        onclick() {
                            const zip = new JSZip();
                            fetch('./data.zip')
                                .then(x => x.bytes())
                                .then(x => zip.loadAsync(x))
                                .then(x => panel.val = x);
                        }
                    }, 'Demo')
                )
        }
    );
}

van.add(document.body, App);