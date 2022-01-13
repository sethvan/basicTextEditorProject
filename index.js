const textBody = document.querySelector("#text-body");
const preTag = document.querySelector("#pre-tag");
const undoBtn = document.querySelector("#undo");
const redoBtn = document.querySelector("#redo");

let currentCommandIndex = 1;

preTag.innerText = textBody.innerHTML;
let trend = true; //false = downwards trend and true = upwards trend
let lengthIncrement = true; //false = downwards increment and true = upwards increment
const keyTypeLog = [""];
const caretNodeLog = [{}];
let lastStateText = "";
let currentStateText = "";

textBody.addEventListener("keyup", (e) => {
  if (textHasChanged()) {
    keyTypeLog.push(`${e.key}`);
    caretNodeLog.push(getCaretNode());
    if (keyTypeLog[keyTypeLog.length - 2] === "Enter") {
      updateCurrentState();
    } else {
      if (
        !lastTwoAnchorNodesAreEqual(caretNodeLog) ||
        wroteWord(e.key) ||
        pastedOrDeletedDigits(e.key) ||
        hasChangedDirection(caretNodeLog)
      ) {
        pushState();
      } else {
        updateCurrentState();
      }
    }
    preTag.innerText = textBody.innerHTML;
  }
});

undoBtn.addEventListener("click", () => {
  console.log("undo");
});

redoBtn.addEventListener("click", () => {
  console.log("redo");
});

const getCaretNode = () => {
  const selection = window.getSelection();
  return {
    anchorNode: selection.anchorNode,
    offSet: selection.anchorOffset,
  };
};

const lastTwoAnchorNodesAreEqual = (caretNodeLog) => {
  if (textBody.innerText.length) {
    if (textBody.innerText.length > 2) {
      return (
        caretNodeLog[caretNodeLog.length - 1].anchorNode ===
        caretNodeLog[caretNodeLog.length - 2].anchorNode
      );
    } else return true;
  } else return true;
};

const pushState = () => {
  console.log("pushing");
  lastStateText = currentStateText;
};

const updateCurrentState = () => {
  console.log("not pushing");
  currentStateText = textBody.innerText;
};

const wroteWord = (keyPressed) => {
  return keyPressed === " " && keyTypeLog[keyTypeLog.length - 2] !== " ";
};

const pastedOrDeletedDigits = (key) => {
  try {
    switch (key) {
      case "Delete":
        return true;
      case "Cut":
        return true;
      case "Insert":
        return true;
      case "Paste":
        return true;
      case "Clear":
        return true;
      default:
        return false;
    }
  } catch (e) {
    console.log(e);
  }
};

const textHasChanged = () => {
  return textBody.innerText !== lastStateText;
};

const hasChangedDirection = (caretNodeLog) => {
  const current = caretNodeLog[caretNodeLog.length - 1].offSet;
  const previous = caretNodeLog[caretNodeLog.length - 2].offSet;

  if (
    lastTwoAnchorNodesAreEqual(caretNodeLog) &&
    Math.abs(current - previous) === 1
  ) {
    if (current > previous) lengthIncrement = true;
    else lengthIncrement = false;
    if (trend !== lengthIncrement) {
      trend = lengthIncrement;
      return true;
    } else return false;
  } else return false;
};

//below setcaretposition function taken from https://exceptionshub.com/set-caret-position-in-contenteditable-div-that-has-children.html
// Move caret to a specific point in a DOM element
function SetCaretPosition(el, pos) {
  if (pos === 0) {
    return el.focus();
  }
  // Loop through all child nodes
  for (let node of el.childNodes) {
    if (node.nodeType == 3) {
      // we have a text node
      if (node.length >= pos) {
        // finally add our range
        let range = document.createRange(),
          sel = window.getSelection();
        range.setStart(node, pos);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return -1; // we are done
      } else {
        pos -= node.length;
      }
    } else {
      pos = SetCaretPosition(node, pos);
      if (pos == -1) {
        return -1; // no need to finish the for loop
      }
    }
  }
  return pos; // needed because of recursion stuff
}

const getCaretIndex = () => {
  selection = document.getSelection();
  selectionRange = selection.getRangeAt(0);
  selectionRange.setStart(textBody, 0);
  index = selectionRange.toString().length;
  selection.collapseToEnd();
  return index;
};
