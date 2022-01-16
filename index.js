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
let spanNumber = 0; // For the id of each created span
let useSpan = false; // See getSelectionInnerHTML() and keyup event listener
preTag.innerText = textBody.innerHTML;
let trend = true; // False = downwards trend and true = upwards trend
let lengthIncrement = true; // False = downwards increment and true = upwards increment
const keyTypeLog = [""];
const caretNodeLog = [{}];

textBody.addEventListener("keyup", (e) => {
  // If a newly created span was being focused before this key event, reset all the contenteditable attributes
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

const executeCMD = (tagType) => {
  try {
    const selection = document.getSelection();
    const selectionRange = selection.getRangeAt(0);

    if (!textBody.contains(selection.anchorNode)) return; // selection has to be inside textBody

    /*IHO = Inner HTML Object, function will return an object containing:
    innerHTML = If there is a selection it returns the innerHTML of that selection, else it returns innerHTML 
                containing a new span on which to insert and focus() where the caret was when button was clicked
    index = The string index of the selection's innerHTML inside the textBody's innerHTML (not being used as of yet)
    posteriorHTML = Portion of textBody's innerHTML that comes after the selection
    posteriorIndex = The string index of the posteriorHTML (not being used as of yet)
    anteriorHTML = Portion of textBody's innerHTML that comes before the selection
    caretIndex = where caret is after click
    */
    const selectionIHO = getSelectionInnerHTML(
      selection,
      selectionRange,
      textBody
    );

    /*Function takes the selection's innerHTML string and modifies it to match
    the desired effect of what clicking style button should produce */
    const newSelectionInnerHTML = getNewInnerHTML(
      selectionIHO,
      textBody,
      tagType
    );

    // Inserts in place the new selection innerHTML string
    textBody.innerHTML =
      selectionIHO.anteriorHTML +
      `${newSelectionInnerHTML}` +
      selectionIHO.posteriorHTML;

    // like in keyup event, If user has undone states before this change, delete all recorded states that came after this state.
    if (currentStateIndex < textBodyInnerHTMLStates.length - 1) {
      let difference = textBodyInnerHTMLStates.length - 1 - currentStateIndex;
      for (let i = 0; i < difference; ++i) {
        textBodyInnerHTMLStates.pop();
      }
    } // If no selection was made and empty span to be focused was put in place of the innerHTML of section,
    // then momentarily change attributes of the other spans and the textBody to make new span focusable.
    // Focus will be added inside btn listener
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
    } else {
      SetCaretPosition(textBody, selectionIHO.caretIndex);
    } // record caret position in state
    textBodyInnerHTMLStates[currentStateIndex].caretIndex =
      selectionIHO.caretIndex;
    if (!selection.toString()) {
      // If no selection, do not push, just update (personal taste)
      updateCurrentState();
    } else {
      pushState();
    }

    preTag.innerText = textBody.innerHTML;
    // this commented out line here, I am not sure of its purpose, I only remember I copied it from
    // somewhere and it was needed before, but currently seems to work fine without it, so not sure what
    // to do with it or not anymore.
    //document.getSelection().removeAllRanges();
  } catch (e) {
    console.log(e);
  }
};

const getSelectionInnerHTML = (selection, selectionRange, textBody) => {
  try {
    /* I am semi-new to JavaScript and I could not for the life of me find a way to get the innerHTML
    of a selectionObject, so this function does it by first temporarily creating a random delimiter 
    to insert at the beginning and end of the selection inside of the innerHTML and then using those 
    delimiters to split the entire textBody.innerHTML into what was selected, what precedes it, and 
    what follows it. I chose to use a tilde followed by a large random number as I imagined the risk 
    would be low that a user would have that in their text. */
    const myDelimiter = `~${Math.floor(Math.random() * 1000000000000000)}`;

    /* If there is a selection (that was selected from left to right), this block inserts a delimiter 
    at the end of the selection. I googled two different things and put them together to come up with this
    so it may not be correctly written though it works.*/
    if (selection.toString()) {
      const rangeToPlaceEnd = document.createRange();
      rangeToPlaceEnd.setStart(selection.focusNode, selection.focusOffset);
      rangeToPlaceEnd.setEnd(selection.focusNode, selection.focusOffset);
      const endNode = document
        .createRange()
        .createContextualFragment(myDelimiter);
      rangeToPlaceEnd.insertNode(endNode);
    }
    //does the same as above but at the beginning of the selection
    const newNode = document
      .createRange()
      .createContextualFragment(myDelimiter);
    selectionRange.insertNode(newNode);

    const textBodyHTML = textBody.innerHTML.toString();

    if (selection.toString()) {
      // if there is a selection, split it out
      let [anteriorHTML, innerHTML, posteriorHTML] =
        textBodyHTML.split(myDelimiter);

      //calculate index properties
      selectionRange.setStart(textBody, 0);
      let caretIndex = selectionRange.toString().length - myDelimiter.length;
      let index = anteriorHTML.length;
      let posteriorIndex = index + innerHTML.length;

      //remove delimiters
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
      // If no selection, make innerHTML equal to a span to be focused on for caret placement
      // and set useSpan to true.
      let innerHTML = `<span id="span${++spanNumber}" contenteditable="true" tabindex="0"></span>`;
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

// Styling tags
// Regex added to lean up the code concerning tag searches in the innerHTML
const tag = {
  bold: {
    startTag: `<strong>`,
    endTag: `</strong>`,
    regex: /([<][/]?strong[>])/g,
  },
  italic: {
    startTag: `<em>`,
    endTag: `</em>`,
    regex: /([<][/]?em[>])/g,
  },
  underline: {
    startTag: `<u>`,
    endTag: `</u>`,
    regex: /([<][/]?u[>])/g,
  },
  sub: {
    startTag: `<sub>`,
    endTag: `</sub>`,
    regex: /([<][/]?sub[>])/g,
  },
  sup: {
    startTag: `<sup>`,
    endTag: `</sup>`,
    regex: /([<][/]?sup[>])/g,
  },
};

const removeTags = (str, tagType) => {
  return str.replaceAll(tagType.regex, "");
};

const getNewInnerHTML = (selectionIHO, textBody, tagType) => {
  let antTags, posTags, innerTags;
  let closestAnteriorTag =
    (closestPosteriorTag =
    firstInnerTag =
    lastInnerTag =
      null);

  if ((antTags = selectionIHO.anteriorHTML.match(tagType.regex)))
    closestAnteriorTag = antTags[antTags.length - 1];

  if ((posTags = selectionIHO.posteriorHTML.match(tagType.regex)))
    closestPosteriorTag = posTags[0];

  if ((innerTags = selectionIHO.innerHTML.match(tagType.regex))) {
    firstInnerTag = innerTags[0];
    lastInnerTag = innerTags[innerTags.length - 1];
  }

  if (
    //This scenario is mostly for when connecting one emboldened section to another, all
    // that is done is that any corresponding tags of tagType are removed from the selectionIHO.innerHTML
    firstInnerTag === tagType.endTag &&
    lastInnerTag === tagType.startTag &&
    // These following 3 lines were some sort of jury rig I had to do due to Safari being weird
    // God-willing we will stop using spans for this styling and the jury rig will go way
    selectionIHO.innerHTML.indexOf(`${tagType.endTag}</div>`) === -1 &&
    selectionIHO.innerHTML.indexOf(`${tagType.endTag}</span>`) === -1 &&
    selectionIHO.innerHTML.indexOf(`<div>${tagType.startTag}`) === -1 &&
    closestAnteriorTag === tagType.startTag &&
    closestPosteriorTag === tagType.endTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${selectionIHO.innerHTML}`;
  } else if (
    // User selected within an already stylized range, therefore we remove bold styling from
    // the selection by adding tags to negate the styling
    closestAnteriorTag === tagType.startTag &&
    closestPosteriorTag === tagType.endTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${tagType.endTag}${selectionIHO.innerHTML}${tagType.startTag}`;
  } else if (
    // Extends the end of an already stylized section to the end of the selection
    closestAnteriorTag === tagType.startTag &&
    firstInnerTag === tagType.endTag &&
    lastInnerTag == tagType.endTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${selectionIHO.innerHTML}${tagType.endTag}`;
  } else if (
    // Extends the end of an already stylized section to the beginning of the selection
    firstInnerTag === tagType.startTag &&
    lastInnerTag === tagType.startTag &&
    closestPosteriorTag === tagType.endTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${tagType.startTag}${selectionIHO.innerHTML}`;
  } else {
    // Stylizes the selection as normal by putting start and end tags around it
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
