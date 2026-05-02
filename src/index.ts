import sources from '../sources.json' with {type: 'json'};
import { getLocale, applyLocaleOn } from './locales.js';

class Progress {
    private progressElement;
    private _value = 0;

    constructor(progressElement: HTMLProgressElement, limit: number) {
        this.progressElement = progressElement;
        this.progressElement.max = limit;
    }

    set value(newValue: number) {
        this._value = newValue;
        this.progressElement.value = this._value;
    }
    get value() {
        return this._value;
    }
}

class Counter {
    private counterElement;
    private _count = 5;
    private onExpiration;

    constructor(counterElement: HTMLElement, onExpiration: Function) {
        this.counterElement = counterElement;
        this.onExpiration = onExpiration;

        this.counterElement.textContent = this._count.toString();
    }

    public update() {
        const next = this._count - 1;
        if (next >= 0) {
            this._count = next;
            this.counterElement.textContent = this._count.toString();
        }
        if (next <= 0) {
            this.onExpiration();
        }
    }
}

type ElementsIdsMap = { [key: string]: globalThis.Element };
interface CreateElementOptions {
    tagName: string,
    className: string,
    html?: string,
    effect?: (elements: ElementsIdsMap) => any
}
class Element<E extends HTMLElement> {
    private options;

    constructor(options: CreateElementOptions) {
        this.options = options;

        this.element = document.createElement(this.options.tagName) as E;
        this.element.classList.add(this.options.className);
        if (this.options.html) {
            this.element.insertAdjacentHTML('afterbegin', this.options.html);
        }

        const elementsWithIds = this.element.querySelectorAll('[id]');
        const elementsIdsMap: ElementsIdsMap = {};
        elementsWithIds.forEach(element => {
            const idAttribute = element.getAttribute('id')
            if (idAttribute) {
                elementsIdsMap[idAttribute] = element;
            }
        })
        
        const observer = new MutationObserver(() => {
            if (document.contains(this.element) && this.options.effect) {
                this.options.effect(elementsIdsMap);
                observer.disconnect()
            }
        })
        observer.observe(document.documentElement, {childList: true, subtree: true})
    }

    public element: E;
}


let openedTooltips: Array<HTMLElement> = []

const limits = {
    pollution: 0,
    efficiency: 0,
}
sources.map(source => {
    limits.pollution = limits.pollution + source.pollution;
    limits.efficiency = limits.efficiency + source.efficiency;
})

const progress = {
    pollution: new Progress(
        document.getElementById("progress_bar-pollution") as HTMLProgressElement,
        limits.pollution
    ),
    efficiency: new Progress(
        document.getElementById("progress_bar-efficiency") as HTMLProgressElement,
        limits.efficiency
    ),
}

const counter = new Counter(
    document.getElementById("counter_value") as HTMLAnchorElement,
    () => {
        const result: "fail" | "victory" = progress.pollution.value >
            progress.efficiency.value ? "fail" : "victory";

        const gameOverElement = new Element({
            tagName: "div",
            className: "game-over",
            html:
                `
            <div class="game-over_window">
                <h2 class="game-over_title ${result}">
                    ${getLocale(`gameOver_title_${result}`)}
                </h2>
                <button id="game-over_button" class="button">
                    ${getLocale("gameOver_button")}
                </button>
            </div>
            `,
            effect: (elements) => {
                elements["game-over_button"]?.addEventListener('click', () => {
                    location.reload()
                })
            }
        })
        document.body.insertAdjacentElement('afterbegin', gameOverElement.element)
    }
)

const cardsContainer = document.getElementById("cards-container-main");
if (!cardsContainer) {
    throw new Error("There is no provided cards container");
}

applyLocaleOn(document)

sources.map(source => {
    const cardSize = 40;

    const tooltipElement = new Element({
        tagName: "div",
        className: "card_tooltip",
        html:
            `
        <h3 class="card_tooltip_title">
            ${getLocale(`card_title_${source.name}`)}
        </h3>
        ${source.feasible === false ?
                `
            <div class="card_tooltip_warning">
                <svg width="10px" height="10px" viewBox="0 0 24 24"
                    fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                <path 
                    d="M12 16.99V17M12 7V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                    stroke="rgb(188, 28, 28)" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round"
                />
                </svg>
                <span class="card_tooltip_warning_title">
                    ${getLocale("card_warning_not_easible")}
                </span>
            </div>` :
                ""
            }
        <button id="card_tooltip_button" class="button">
            ${getLocale("card_button")}
        </button>
        `,
        effect: (elements) => {
            elements["card_tooltip_button"]?.addEventListener('click', () => {
                counter.update();

                progress.pollution.value =
                    progress.pollution.value + source.pollution;
                progress.efficiency.value =
                    progress.efficiency.value + source.efficiency;

                cardElement.element.remove()
            })
        }
    })

    const cardElement = new Element<HTMLImageElement>({
        tagName: "img",
        className: "card"
    })

    cardElement.element.style.width = cardSize + "px";
    cardElement.element.style.height = cardSize + "px";

    cardElement.element.style.left =
        Math.random() * (cardsContainer.clientWidth - cardSize) + "px";
    cardElement.element.style.top =
        Math.random() * (cardsContainer.clientHeight - cardSize) + "px";

    cardElement.element.addEventListener("click", (event) => {
        event.stopPropagation()
        cardsContainer.insertAdjacentElement('afterbegin', tooltipElement.element)
        openedTooltips = [...openedTooltips, tooltipElement.element]

        tooltipElement.element.style.left = cardElement.element.style.left;
        tooltipElement.element.style.top = cardElement.element.style.top;
    })

    cardElement.element.src = source.image;
    cardsContainer.insertAdjacentElement('afterbegin', cardElement.element);
})

document.addEventListener("click", () => {
    openedTooltips.forEach(tooltip => {
        tooltip.remove()
    })
    openedTooltips = []
})