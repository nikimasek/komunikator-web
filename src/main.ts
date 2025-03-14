import van from "vanjs-core";
import "bootstrap/dist/css/bootstrap.css"
import "./style.css";
const { main, div, button, img, label } = van.tags;

const test = [
    'ahoj', 'jídlo', 'pití',
    'něco', 'proč', 'nevim',
    'pití', 'co?', 'kdo?',
    'ne', 'nevím', 'ano'
]

function audio(text: string) {
    const audio = new Audio('/ahoj.mp3');
    audio.play();
}

function App() {

    return main(
        div({ class: 'grid' },
            Array.from(test, (text) => {
                return div({ class: 'card', onclick() { audio(text); } },
                    img({ src: 'https://placehold.co/200?text=' + text }),
                    label(text))
            })
        )
    );
}

van.add(document.body, App);