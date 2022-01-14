const textBody = document.querySelector("#text-body");
const preTag = document.querySelector("#pre-tag");
const undoBtn = document.querySelector("#undo");
const redoBtn = document.querySelector("#redo");

const direction = ["LEFT_TO_RIGHT", "RIGHT_TO_LEFT"]; // kind of like an enum, will probably change later
let selectionDirection = ""; // put in this variable and the one above as temp to test new event listeners
let caretIndex = 0;

let currentCommandIndex = 1;

preTag.innerText = textBody.innerHTML;
let trend = true; //false = downwards trend and true = upwards trend
let lengthIncrement = true; //false = downwards increment and true = upwards increment
const keyTypeLog = [""];
const caretNodeLog = [{}];
let lastStateText = "";
let currentStateText = "";

textBody.addEventListener("mousedown", (e) => {
  setTimeout(() => {
    // Extra setTimeout wrapper is for when user has decided to change the selection they have made
    if (textBody.innerText && !document.getSelection().toString().length) {
      setTimeout(() => {
        caretIndex = getCaretIndex();
        console.log("Caret index = ", caretIndex);
      }, 10); // needs time to accommodate first before it can function properly
    }
  }, 10);
});

textBody.addEventListener("click", (e) => {
  // For our use case this will tell us if there was already text selected when user clicked
  const userHasDeselected = document.getSelection().toString().length;
  setTimeout(() => {
    // This tells us that the click was in order to make a selection
    const selectionLength = document.getSelection().toString().length;
    if (selectionLength) {
      const begin = caretIndex;
      const end = begin + selectionLength;
      if (
        textBody.innerText.slice(begin, end) ===
        document.getSelection().toString()
      ) {
        selectionDirection = direction[0];
      } else {
        selectionDirection = direction[1];
        --caretIndex; // so that it matches the first index actually being selected on the right side
      }
      console.log(
        `Selection of ${selectionLength} digits made from ${selectionDirection} starting at index ${caretIndex}.`
      );
    } else if (userHasDeselected) {
      //Why the duplicate of mousedown? Because if you make a selection and then change your mind and click inside the selection
      //to place the caret somewhere there instead, it only works here, not in the mousedown listener and without the
      //mousedown listener, the above block detailing the selection does not have the correct caretIndex to work with.
      caretIndex = getCaretIndex();
      console.log("Caret index = ", caretIndex);
    }
  }, 10); // needs time to accommodate first for the else block to function properly
});

textBody.addEventListener("keyup", (e) => {
  caretIndex = getCaretIndex();
  console.log("Caret index = ", caretIndex);
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
