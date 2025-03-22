import van from "vanjs-core";
import "bootstrap/dist/css/bootstrap.css"
import "./style.css";
import { Panel } from "./pages/panel";
import { Home } from "./pages/home";
import { Navbar } from "./pages/navbar";
import { Manage } from "./pages/manage";
import { Edit } from "./pages/edit";
const { main } = van.tags;

type Component = (...params: string[]) => HTMLElement

const routers: [string | RegExp, Component][] = [
    ['', Home],
    ['#edit', Edit],
    ['#manage', Manage],
    [/^#panel\/(\w+)\b/, Panel]
]

function App() {
    const path = van.state(location.hash);
    window.addEventListener('hashchange', () => { path.val = location.hash });
    let params: string[] = [];
    const component = van.state<Component>(Home);
    van.derive(() => {
        const href = path.val;
        for (const [mask, comp] of routers) {
            if (typeof mask == 'string' && href === mask) {
                params = [href];
                component.val = comp;
                return;
            }
            if (mask instanceof RegExp) {
                const match = mask.exec(href);
                if (match) {
                    params = [...match]
                    component.val = comp;
                    return;
                }
            }
        }
        params = [];
        component.val = Home;
    });

    return main(
        Navbar(),
        () => component.val.apply(params[0], params.slice(1)));
}
van.add(document.body, App);