const textBody = document.querySelector("#text-body");
const preTag = document.querySelector("#pre-tag");
const boldBtn = document.querySelector("#bold-text");
const underlineBtn = document.querySelector("#underline-text");
const italicBtn = document.querySelector("#italic-text");
const subBtn = document.querySelector("#sub-text");
const supBtn = document.querySelector("#sup-text");
const undoBtn = document.querySelector("#undo");
const redoBtn = document.querySelector("#redo");

// For each saved state we save the entire innerHTML string for that state
// and the index of the caret. This is why we are working on command pattern.
const textBodyInnerHTMLStates = [
  {
    innerHTML: textBody.innerHTML,
    innerText: textBody.innerText,
    caretIndex: 0,
  },
  {
    innerHTML: textBody.innerHTML,
    innerText: textBody.innerText,
    caretIndex: 0,
  },
];
let currentStateIndex = 1;
let spanNumber = 0; // for the id of each created span
let useSpan = false; // see getSelectionInnerHTML() and keyup even listener
preTag.innerText = textBody.innerHTML;
let trend = true; //false = downwards trend and true = upwards trend
let lengthIncrement = true; //false = downwards increment and true = upwards increment
const keyTypeLog = [""];
const caretNodeLog = [{}];

textBody.addEventListener("keyup", (e) => {
  // if a newly created span was being focused before this key event, reset all the contenteditable attributes
  // for all other spans (that along with textBody were temporarily set to false so as to focus the span) back to true now
  if (useSpan) {
    const spanList = document.querySelectorAll("span");
    for (let span of spanList) {
      if (span !== document.querySelector(`#span${spanNumber}`)) {
        span.setAttribute("contenteditable", "true");
      }
    }
    textBody.setAttribute("contenteditable", "true");
    useSpan = false;
  }
  if (textHasChanged()) {
    // if text has changed since last pushed state
    keyTypeLog.push(`${e.key}`);
    caretNodeLog.push(getCaretNode());
    // This is my arbitrary taste, basically means that if the last key before this one pushed was a carriage return
    // do not push. This results in consecutive carriage returns being recorded as one change in state instead
    // of multiple incremental changes.
    if (keyTypeLog[keyTypeLog.length - 2] === "Enter") {
      updateCurrentState();
    } else {
      if (
        // The logic being used to decide whether to push the state or not when change in text content detected.
        !lastTwoAnchorNodesAreEqual(caretNodeLog) ||
        wroteWord(e.key) ||
        pastedOrDeletedDigits(e.key) ||
        hasChangedDirection(caretNodeLog)
      ) {
        // If user has undone states and makes a change, delete all recorded states that came after that change.
        if (currentStateIndex < textBodyInnerHTMLStates.length - 1) {
          let difference =
            textBodyInnerHTMLStates.length - 1 - currentStateIndex;
          for (let i = 0; i < difference; ++i) {
            textBodyInnerHTMLStates.pop();
          }
        }
        pushState();
      } else {
        textBodyInnerHTMLStates[currentStateIndex].caretIndex = getCaretIndex();
        updateCurrentState();
      }
    }
    preTag.innerText = textBody.innerHTML;
  }
});

underlineBtn.addEventListener("click", () => {
  executeCMD(tag.underline); // see executeCMD()
  if (useSpan) {
    // If the btn was clicked without a selection, focus on span that was inserted
    document.querySelector(`#span${spanNumber}`).focus();
  }
});

boldBtn.addEventListener("click", () => {
  executeCMD(tag.bold);
  if (useSpan) {
    document.querySelector(`#span${spanNumber}`).focus();
  }
});

italicBtn.addEventListener("click", () => {
  executeCMD(tag.italic);
  if (useSpan) {
    document.querySelector(`#span${spanNumber}`).focus();
  }
});

subBtn.addEventListener("click", () => {
  executeCMD(tag.sub);
  if (useSpan) {
    document.querySelector(`#span${spanNumber}`).focus();
  }
});

supBtn.addEventListener("click", () => {
  executeCMD(tag.sup);
  if (useSpan) {
    document.querySelector(`#span${spanNumber}`).focus();
  }
});

undoBtn.addEventListener("click", () => {
  // If undone back to beginning, make sure original saved state is blank
  if (currentStateIndex === 1) {
    if (
      textBodyInnerHTMLStates[currentStateIndex].innerHTML === "" &&
      textBodyInnerHTMLStates[currentStateIndex].innerText === "" &&
      textBodyInnerHTMLStates[currentStateIndex].caretIndex === 0
    )
      return;
    else {
      textBodyInnerHTMLStates.unshift({
        innerText: "",
        innerHTML: "",
        caretIndex: 0,
      });
      textBody.innerHTML = textBodyInnerHTMLStates[currentStateIndex].innerHTML;
      if (useSpan) {
        // Edge case where undo was clicked right after having clicked a style button
        textBody.setAttribute("contenteditable", "true");
        useSpan = false;
      }
      textBody.focus();
    }
  } else {
    // If not undone to beginning, set the innerHTML of textBody to mach string in saved state
    textBody.innerHTML = textBodyInnerHTMLStates[--currentStateIndex].innerHTML;
    const spanList = document.querySelectorAll("span");
    if (
      // This indicates that the current state in question being reverted to was right after a style button
      // was clicked without a selection made and the focus was on the inserted span. We therefore need to
      // manually place focus again on the span to recreate the state, and set useSpan to true so that
      // the code will know to revert the attributes back to true in the next keyup event.
      spanList.length > 1 &&
      document.querySelector(`#span1`).getAttribute("contentEditable") ===
        "false"
    ) {
      textBody.setAttribute("contenteditable", "false");
      document.querySelector(`#span${spanList.length}`).focus();
      useSpan = true;
      preTag.innerText = textBody.innerHTML;
      return;
    } // Otherwise we are able to set the caret position to the index recorded in the state object using
    // SetCaretPosition ( because it will not be in an empty child node ).
    SetCaretPosition(
      textBody,
      textBodyInnerHTMLStates[currentStateIndex].caretIndex
    );
  }

  preTag.innerText = textBody.innerHTML;
});

redoBtn.addEventListener("click", () => {
  // If currently not at the most recently saved state, change to state that followed the current one
  if (textBodyInnerHTMLStates.length > currentStateIndex + 1) {
    textBody.innerHTML = textBodyInnerHTMLStates[++currentStateIndex].innerHTML;
    // Just like with undo, check to see whether or not caret needs to be placed inside an empty span
    //or set according to index of the innerText.
    const spanList = document.querySelectorAll("span");
    if (
      spanList.length > 1 &&
      document.querySelector(`#span1`).getAttribute("contentEditable") ===
        "false"
    ) {
      textBody.setAttribute("contenteditable", "false");
      document.querySelector(`#span${spanList.length}`).focus();
      useSpan = true;
      preTag.innerText = textBody.innerHTML;
      return;
    }
    preTag.innerText = textBody.innerHTML;
    SetCaretPosition(
      textBody,
      textBodyInnerHTMLStates[currentStateIndex].caretIndex
    );
  }
});

// what happens when user clicks styling button
const executeCMD = (tagType) => {
  try {
    const selection = document.getSelection();

    if (!textBody.contains(selection.anchorNode)) return; // selection has to be inside textBody
    const selectionString = selection.toString(); // will function as a boolean to indicate if text was selected or not

    /*IHO = Inner HTML Object, function will return an object containing:
    innerHTML = If there is a selection it returns the innerHTML of that selection, else it returns innerHTML 
                containing a new span on which to insert and focus() where the caret was when button was clicked
    index = The string index of the selection's innerHTML inside the textBody's innerHTML (not being used as of yet)
    posteriorHTML = Portion of textBody's innerHTML that comes after the selection
    posteriorIndex = The string index of the posteriorHTML (not being used as of yet)
    anteriorHTML = Portion of textBody's innerHTML that comes before the selection
    caretIndex = where caret is after click
    */
    const selectionIHO = getSelectionInnerHTML(selection, tagType);
    const newSelectionInnerHTML = getNewInnerHTML(selectionIHO, tagType);

    textBody.innerHTML =
      selectionIHO.anteriorHTML +
      `${newSelectionInnerHTML}` +
      selectionIHO.posteriorHTML;

    if (currentStateIndex < textBodyInnerHTMLStates.length - 1) {
      let difference = textBodyInnerHTMLStates.length - 1 - currentStateIndex;
      for (let i = 0; i < difference; ++i) {
        textBodyInnerHTMLStates.pop();
      }
    }
    if (useSpan) {
      const spanList = document.querySelectorAll("span");
      if (spanList.length > 1) {
        for (let span of spanList) {
          if (span !== document.querySelector(`#span${spanNumber}`)) {
            span.setAttribute("contenteditable", "false");
          }
        }
      }
      textBody.setAttribute("contenteditable", "false");
      // document.querySelector(`#span${spanNumber}`).focus();
    } else {
      SetCaretPosition(textBody, selectionIHO.caretIndex);
    }
    textBodyInnerHTMLStates[currentStateIndex].caretIndex =
      selectionIHO.caretIndex;
    if (!selection.toString()) {
      updateCurrentState();
    } else {
      pushState();
    }

    preTag.innerText = textBody.innerHTML;
    //document.getSelection().removeAllRanges();
  } catch (e) {
    console.log(e);
  }
};

const getSelectionInnerHTML = (selection, textBody, tagType) => {
  try {
    const selectionString = selection.toString();
    const myDelimiter = `~${Math.floor(Math.random() * 1000000000000000)}`;
    const selectionRange = selection.getRangeAt(0);

    if (selectionString) {
      const rangeToPlaceEnd = document.createRange();
      rangeToPlaceEnd.setStart(selection.focusNode, selection.focusOffset);
      rangeToPlaceEnd.setEnd(selection.focusNode, selection.focusOffset);
      const endNode = document
        .createRange()
        .createContextualFragment(myDelimiter);
      rangeToPlaceEnd.insertNode(endNode);
    }

    const newNode = document
      .createRange()
      .createContextualFragment(myDelimiter);
    selectionRange.insertNode(newNode);

    const textBodyHTML = textBody.innerHTML.toString();

    if (selectionString) {
      let [anteriorHTML, innerHTML, posteriorHTML] =
        textBodyHTML.split(myDelimiter);
      selectionRange.setStart(textBody, 0);
      let caretIndex = selectionRange.toString().length - myDelimiter.length;
      let index = anteriorHTML.length;
      let posteriorIndex = index + innerHTML.length;
      textBody.innerHTML = textBodyHTML.replaceAll(myDelimiter, "");

      return {
        innerHTML,
        index,
        posteriorHTML,
        posteriorIndex,
        anteriorHTML,
        caretIndex,
      };
    } else {
      let innerHTML = `<span id=\"span${++spanNumber}\" contenteditable=\"true\" tabindex=\"0\"></span>`;
      let [anteriorHTML, posteriorHTML] = textBodyHTML.split(myDelimiter);
      selectionRange.setStart(textBody, 0);
      let caretIndex = selectionRange.toString().length - myDelimiter.length;
      let index = anteriorHTML.length;
      let posteriorIndex = index + innerHTML.length;
      textBody.innerHTML = textBodyHTML.replaceAll(myDelimiter, "");

      useSpan = true;

      return {
        innerHTML,
        index,
        posteriorHTML,
        posteriorIndex,
        anteriorHTML,
        caretIndex,
      };
    }
  } catch (e) {
    console.log(e);
  }
};

const tag = {
  bold: {
    startTag: `<strong>`,
    endTag: `</strong>`,
  },
  italic: {
    startTag: `<em>`,
    endTag: `</em>`,
  },
  underline: {
    startTag: `<u>`,
    endTag: `</u>`,
  },
  sub: {
    startTag: `<sub>`,
    endTag: `</sub>`,
  },
  sup: {
    startTag: `<sup>`,
    endTag: `</sup>`,
  },
};

//Source:https://bit.ly/3hEZdCl
// countSubstrings
const indexTags = (str, tagType) => {
  const startTagIndexes = [];
  let count = 0,
    i = 0;
  while (true) {
    const r = str.indexOf(tagType.startTag, i);
    if (r !== -1) {
      startTagIndexes.push({
        startOrEndTag: tagType.startTag,
        index: r,
      });
      [count, i] = [count + 1, r + 1];
    } else break;
  }

  const endTagIndexes = [];
  count = 0;
  i = 0;
  while (true) {
    const r = str.indexOf(tagType.endTag, i);
    if (r !== -1) {
      endTagIndexes.push({
        startOrEndTag: tagType.endTag,
        index: r,
      });
      [count, i] = [count + 1, r + 1];
    } else break;
  }

  const tagIndexes = startTagIndexes.concat(endTagIndexes);
  tagIndexes.sort((a, b) => {
    return a.index - b.index;
  });
  return tagIndexes;
};

const removeTags = (str, tagType) => {
  const startTagRegex = new RegExp(tagType.startTag, "g");
  const endTagRegex = new RegExp(tagType.endTag, "g");

  str = str.replaceAll(startTagRegex, "");
  return str.replaceAll(endTagRegex, "");
};

const getNewInnerHTML = (selectionIHO, textBody, tagType) => {
  const tagIndexes = indexTags(textBody.innerHTML, tagType);

  let closestAnteriorTag = {};
  let closestPosteriorTag = {};
  if (tagIndexes.length) {
    for (let i = 0; i < tagIndexes.length; ++i) {
      if (tagIndexes[i].index < selectionIHO.index)
        closestAnteriorTag = tagIndexes[i];
    }

    for (let i = 0; i < tagIndexes.length; ++i) {
      if (
        tagIndexes[i].index >=
        selectionIHO.index +
          (selectionIHO.innerHTML.slice(0, 5) === `<span`
            ? 0
            : selectionIHO.innerHTML.length)
      ) {
        closestPosteriorTag = tagIndexes[i];
        break;
      }
    }
  }

  const innerTagIndexes = indexTags(selectionIHO.innerHTML, tagType);

  let firstInnerTag = {};
  let lastInnerTag = {};
  if (innerTagIndexes.length) {
    firstInnerTag = innerTagIndexes[0];
    lastInnerTag = innerTagIndexes[innerTagIndexes.length - 1];
  }

  if (
    firstInnerTag.startOrEndTag === tagType.endTag &&
    lastInnerTag.startOrEndTag === tagType.startTag &&
    selectionIHO.innerHTML.indexOf(`${tagType.endTag}</div>`) === -1 &&
    selectionIHO.innerHTML.indexOf(`${tagType.endTag}</span>`) === -1 &&
    selectionIHO.innerHTML.indexOf(`<div>${tagType.startTag}`) === -1 &&
    closestAnteriorTag.startOrEndTag === tagType.startTag &&
    closestPosteriorTag.startOrEndTag === tagType.endTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${selectionIHO.innerHTML}`;
  } else if (
    closestAnteriorTag.startOrEndTag === tagType.startTag &&
    closestPosteriorTag.startOrEndTag === tagType.endTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${tagType.endTag}${selectionIHO.innerHTML}${tagType.startTag}`;
  } else if (
    closestAnteriorTag.startOrEndTag === tagType.startTag &&
    firstInnerTag.startOrEndTag === tagType.endTag &&
    lastInnerTag.startOrEndTag == tagType.endTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${selectionIHO.innerHTML}${tagType.endTag}`;
  } else if (
    firstInnerTag.startOrEndTag === tagType.startTag &&
    lastInnerTag.startOrEndTag == tagType.startTag &&
    closestPosteriorTag.startOrEndTag === tagType.endTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${tagType.startTag}${selectionIHO.innerHTML}`;
  } else {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${tagType.startTag}${selectionIHO.innerHTML}${tagType.endTag}`;
  }
};

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
  const caretIndex = textBodyInnerHTMLStates[currentStateIndex].caretIndex;
  textBodyInnerHTMLStates.push({
    innerHTML: textBody.innerHTML,
    innerText: textBody.innerText,
    caretIndex: caretIndex,
  });
  ++currentStateIndex;
};

const updateCurrentState = () => {
  console.log("not pushing");
  const caretIndex = textBodyInnerHTMLStates[currentStateIndex].caretIndex;

  textBodyInnerHTMLStates[currentStateIndex].innerHTML = textBody.innerHTML;
  textBodyInnerHTMLStates[currentStateIndex].innerText = textBody.innerText;
  textBodyInnerHTMLStates[currentStateIndex].caretIndex = caretIndex;
};

const wroteWord = (keyPressed) => {
  return keyPressed === " " && keyTypeLog[keyTypeLog.length - 2] !== " ";
};

//this can be removed as it no longer has a purpose in current commit
const carriageReturn = (keyPressed) => {
  return keyPressed === "Enter";
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
  return (
    textBody.innerText !==
    textBodyInnerHTMLStates[currentStateIndex - 1].innerText
  );
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
