import { CCA } from "./cca";

const cca = new CCA();

const history = document.getElementById("history") as HTMLDivElement;
const inputCont = document.getElementById("input-cont") as HTMLSpanElement;
const input0 = document.getElementById("input-0") as HTMLSpanElement;
const input1 = document.getElementById("input-1") as HTMLSpanElement;
const inputccont = document.getElementById("input-c-cont") as HTMLSpanElement;
const inputc = document.getElementById("input-c") as HTMLSpanElement;
const cursor = document.getElementById("cursor") as HTMLDivElement;
const input2 = document.getElementById("input-2") as HTMLSpanElement;

const input = document.getElementById("input") as HTMLInputElement;

input.focus();

let blinkState = 0;
let blinkInterval: ReturnType<typeof setInterval> | undefined;

function updateBlink() {
    cursor.style.display = blinkState % 4 < 2 ? "" : "none";
    blinkState++;
}

function updatePromptInput() {
    if (document.activeElement == input) {
        if (input.selectionStart == input.selectionEnd) {
            const selectionIndex = input.selectionStart === null ? input.value.length : input.selectionStart;

            input0.textContent = input.value.slice(0, selectionIndex);
            input1.textContent = "";
            inputccont.style.display = "";
            inputc.textContent = selectionIndex >= input.value.length ? "" : input.value.slice(selectionIndex, selectionIndex + 1);
            input2.textContent = input.value.slice(selectionIndex + 1);

            if (blinkInterval !== undefined) {
                clearInterval(blinkInterval);
            }
            
            blinkState = 0;
            blinkInterval = setInterval(updateBlink, 125);
            updateBlink();
        } else {
            input0.textContent = input.value.slice(0, input.selectionStart!);
            input1.textContent = input.value.slice(input.selectionStart!, input.selectionEnd!);
            inputccont.style.display = "none";
            input2.textContent = input.value.slice(input.selectionEnd!);
        }
    }
}

updatePromptInput();

function computeSelectionIndex(node: Node, nodeSelectionIndex: number): number {
    if (node == inputCont) return nodeSelectionIndex;

    let parentSelectionIndex = nodeSelectionIndex;

    for (const sibling of node.parentNode!.childNodes) {
        if (sibling == node) break;

        parentSelectionIndex += sibling.textContent!.length;
    }

    return computeSelectionIndex(node.parentNode!, parentSelectionIndex);
}

window.addEventListener("click", () => {
    const selection = window.getSelection()!;

    console.log(selection);

    if (selection.isCollapsed) {
        if (inputCont.contains(selection.focusNode)) {
            const selectionIndex = computeSelectionIndex(selection.focusNode!, selection.focusOffset);

            input.focus();
            input.setSelectionRange(selectionIndex, selectionIndex);
        } else {
            input.focus();
        }
    } else {
        if (inputCont.contains(selection.anchorNode) && inputCont.contains(selection.focusNode)) {
            const anchorIndex = computeSelectionIndex(selection.anchorNode!, selection.anchorOffset);
            const focusIndex = computeSelectionIndex(selection.focusNode!, selection.focusOffset);

            input.focus();
            input.setSelectionRange(Math.min(anchorIndex, focusIndex), Math.max(anchorIndex, focusIndex));
        }
    }
});

input.addEventListener("input", () => {
    updatePromptInput();
});

input.addEventListener("keydown", (event) => {
    if (event.code == "Enter") {
        const output = cca.runUserInput(input.value);
        history.textContent += "\n\n>" + input.value + (output ? "\n" + output : "");

        input.value = "";
        updatePromptInput();
    }
});

input.addEventListener("blur", () => {
    cursor.style.display = "none";
    clearInterval(blinkInterval);
    blinkInterval = undefined;
});

document.addEventListener("selectionchange", () => {
    updatePromptInput();
});