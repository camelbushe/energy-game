import sources from '../sources.json' with {type: 'json'};
import { getLocale, applyLocaleOn } from './locales.js';

class Progress {
    private progressBar;
    private _value = 0;

    constructor(progressBar: HTMLProgressElement, limit: number) {
        this.progressBar = progressBar;
        this.progressBar.max = limit;
    }

    set value(newValue: number) {
        this._value = newValue;
        this.progressBar.value = this._value;
    }
    get value() {
        return this._value;
    }
}

let openedTooltips: Array<HTMLDivElement> = []

let counter = 5;
const counterValue = document.getElementById("counter_value") as HTMLOutputElement;
counterValue.textContent = counter.toString();

function updateCounter() {
    counter = counter - 1;
    counterValue.textContent = counter.toString();
    if (counter <= 0) {
        let result: "fail" | "victory" = 
        progress.pollution.value > 
            progress.efficiency.value ? "fail" : "victory"

        const gameOverElement = document.createElement("div");
        gameOverElement.classList.add("game-over");
        const gameOverElementHTML = 
        `
        <div class="game-over_window">
            <h2 class="game-over_title ${result}">
                ${getLocale(`gameOver_title_${result}`)}
            </h2>
            <button id="game-over_button" class="button">
                ${getLocale("gameOver_button")}
            </button>
        </div>
        `
        gameOverElement.insertAdjacentHTML('afterbegin', gameOverElementHTML);
        document.body.insertAdjacentElement('afterbegin', gameOverElement);

        gameOverElement.addEventListener('click', (event) => {
        if (
            event.target instanceof HTMLElement &&
            event.target?.closest("#game-over_button")
        ) {
            location.reload()
        }
    })
    }
}

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

const cardsContainer = document.getElementById("cards-container-main");
if (!cardsContainer) {
    throw new Error("There is no provided cards container");
}

applyLocaleOn(document)

sources.map(source => {
    const cardSize = 40;

    const tooltipElement = document.createElement("div");
    tooltipElement.classList.add("card_tooltip");
    const tooltipElementInnerHTML =
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
    `
    tooltipElement.insertAdjacentHTML("afterbegin", tooltipElementInnerHTML)

    tooltipElement.addEventListener('click', (event) => {
        if (
            event.target instanceof HTMLElement &&
            event.target?.closest("#card_tooltip_button")
        ) {
            progress.pollution.value =
                progress.pollution.value + source.pollution;
            progress.efficiency.value =
                progress.efficiency.value + source.efficiency;

            
            updateCounter()
            cardElement.remove()
        }
    })

    const cardElement = document.createElement("img");
    cardElement.classList.add("card");

    cardElement.style.width = cardSize + "px";
    cardElement.style.height = cardSize + "px";

    cardElement.style.left =
        Math.random() * (cardsContainer.clientWidth - cardSize) + "px";
    cardElement.style.top =
        Math.random() * (cardsContainer.clientHeight - cardSize) + "px";

    cardElement.addEventListener("click", (event) => {
        event.stopPropagation()
        cardsContainer.insertAdjacentElement("afterend", tooltipElement);
        openedTooltips = [...openedTooltips, tooltipElement]

        tooltipElement.style.left = cardElement.style.left;
        tooltipElement.style.top = cardElement.style.top;
    })

    cardElement.src = source.image;

    cardsContainer.insertAdjacentElement("afterbegin", cardElement);
})

document.addEventListener("click", () => {
    openedTooltips.forEach(tooltip => {
        tooltip.remove()
    })
    openedTooltips = []
})