const textBody = document.querySelector("#text-body");
const preTag = document.querySelector("#pre-tag");
const undoBtn = document.querySelector("#undo");
const redoBtn = document.querySelector("#redo");

let caretIndex = 0;
let currentCommandIndex = 1;

preTag.innerText = textBody.innerHTML;
let trend = true; //false = downwards trend and true = upwards trend
let lengthIncrement = true; //false = downwards increment and true = upwards increment
const keyTypeLog = [""];
const caretNodeLog = [{}];

let lastStateText = "";
let currentStateText = "";

textBody.addEventListener("keyup", (e) => {
  if (textHasChanged(textBody, lastStateText)) {
    keyTypeLog.push(`${e.key}`);
    caretNodeLog.push(getCaretNode());

    if (stateShouldBePushed(caretNodeLog, e.key, keyTypeLog)) {
      pushState();
    } else {
      updateCurrentState();
    }
    updatePreTagContent(preTag, textBody);
  }
});

undoBtn.addEventListener("click", () => {
  console.log("undo");
});

redoBtn.addEventListener("click", () => {
  console.log("redo");
});

// COMMANDS

class AddTextCommand {
  constructor(text, node, index) {
    this.text = text;
    this.node = node;
    this.index = index;
  }

  execute() {
    // Adds this.text to this.node at this.index
    let text = this.node.textContent;
    text = text.slice(0, this.index) + this.text + text.slice(this.index);
    this.node.textContent = text;
  }

  undo() {
    // Removes this.text from this.node at this.index
    let text = this.node.textContent;
    text =
      text.slice(0, this.index) + text.slice(this.index + this.text.length);
    this.node.textContent = text;
  }
}
