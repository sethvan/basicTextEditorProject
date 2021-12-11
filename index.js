const textBody = document.querySelector("#text-body");
const preTag = document.querySelector("#pre-tag");
const boldBtn = document.querySelector("#bold-text");
const underlineBtn = document.querySelector("#underline-text");
const italicBtn = document.querySelector("#italic-text");
const subBtn = document.querySelector("#sub-text");
const supBtn = document.querySelector("#sup-text");
const undoBtn = document.querySelector("#undo");
const redoBtn = document.querySelector("#redo");
const textBodySelection = document.createRange();
const textBodyInnerHTMLStates = [
  {
    innerHTML: textBody.innerHTML,
    innerText: textBody.innerText,
  },
  {
    innerHTML: textBody.innerHTML,
    innerText: textBody.innerText,
  },
];
let currentStateIndex = 1;
preTag.innerText = textBody.innerHTML;
let trend = true; //false = downwards trend and true = upwards trend
let lengthIncrement = true; //false = downwards increment and true = upwards increment
const keyTypeLog = [""];
const caretNodeLog = [{}];

textBody.addEventListener("keyup", (e) => {
  if (textHasChanged()) {
    keyTypeLog.push(e.key);
    caretNodeLog.push(getCaretNode());
    if (
      carriageReturn(e.key) ||
      !lastTwoAnchorNodesAreEqual(caretNodeLog) ||
      wroteWord(e.key) ||
      pastedOrDeletedDigits() ||
      hasChangedDirection(caretNodeLog)
    ) {
      if (currentStateIndex < textBodyInnerHTMLStates.length - 1) {
        let difference = textBodyInnerHTMLStates.length - 1 - currentStateIndex;
        for (let i = 0; i < difference; ++i) {
          textBodyInnerHTMLStates.pop();
        }
      }
      pushState();
    } else updateCurrentState();
    preTag.innerText = textBody.innerHTML;
  }
});

underlineBtn.addEventListener("click", () => {
  executeCMD(tag.underline);
});

boldBtn.addEventListener("click", () => {
  executeCMD(tag.bold);
});

italicBtn.addEventListener("click", () => {
  executeCMD(tag.italic);
});

subBtn.addEventListener("click", () => {
  executeCMD(tag.sub);
});

supBtn.addEventListener("click", () => {
  executeCMD(tag.sup);
});

undoBtn.addEventListener("click", () => {
  if (currentStateIndex === 1) {
    if (
      textBodyInnerHTMLStates[currentStateIndex].innerHTML === "" &&
      textBodyInnerHTMLStates[currentStateIndex].innerText === ""
    )
      return;
    else {
      textBodyInnerHTMLStates.unshift({ innerText: "", innerHTML: "" });
      textBody.innerHTML = textBodyInnerHTMLStates[currentStateIndex].innerHTML;
    }
  } else {
    textBody.innerHTML = textBodyInnerHTMLStates[--currentStateIndex].innerHTML;
  }

  preTag.innerText = textBody.innerHTML;
});

redoBtn.addEventListener("click", () => {
  if (textBodyInnerHTMLStates.length > currentStateIndex + 1) {
    textBody.innerHTML = textBodyInnerHTMLStates[++currentStateIndex].innerHTML;
    preTag.innerText = textBody.innerHTML;
  }
});

const executeCMD = (tagType) => {
  try {
    const selection = document.getSelection();
    if (
      !selection ||
      !textBody.contains(selection.anchorNode) ||
      selection.toString().length === 0
    )
      return;
    console.log(selection);
    const selectionRange = selection.getRangeAt(0);
    //IHO = Inner HTML Object
    const selectionIHO = getSelectionInnerHTML(
      selection,
      selectionRange,
      textBody
    );
    const newSelectionInnerHTML = getNewInnerHTML(
      selectionIHO,
      textBody,
      tagType
    );

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

    pushState();

    preTag.innerText = textBody.innerHTML;
    document.getSelection().removeAllRanges();
  } catch (e) {
    console.log(e);
  }
};

const getSelectionInnerHTML = (selection, selectionRange, textBody) => {
  try {
    const myDelimiter = `~${Math.floor(Math.random() * 1000000000000000)}`;

    const rangeToPlaceEnd = document.createRange();
    rangeToPlaceEnd.setStart(selection.focusNode, selection.focusOffset);
    rangeToPlaceEnd.setEnd(selection.focusNode, selection.focusOffset);
    const endNode = document
      .createRange()
      .createContextualFragment(myDelimiter);
    rangeToPlaceEnd.insertNode(endNode);

    const newNode = document
      .createRange()
      .createContextualFragment(myDelimiter);
    selectionRange.insertNode(newNode);

    const textBodyHTML = textBody.innerHTML.toString();

    const [anteriorHTML, innerHTML, posteriorHTML] =
      textBodyHTML.split(myDelimiter);
    const index = anteriorHTML.length;
    const posteriorIndex = index + innerHTML.length;

    textBody.innerHTML = textBodyHTML.replaceAll(myDelimiter, "");

    return {
      innerHTML,
      index,
      posteriorHTML,
      posteriorIndex,
      anteriorHTML,
    };
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
        selectionIHO.index + selectionIHO.innerHTML.length
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
    !firstInnerTag.startOrEndTag &&
    !lastInnerTag.startOrEndTag &&
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
  } else if (
    firstInnerTag.startOrEndTag === tagType.endTag &&
    lastInnerTag.startOrEndTag === tagType.startTag
  ) {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${selectionIHO.innerHTML}`;
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

const lastTwoAnchorNodesAreEqual = (carrotNodeLog) => {
  if (textBody.innerText.length) {
    if (textBody.innerText.length > 1) {
      return (
        caretNodeLog[caretNodeLog.length - 1].anchorNode ===
        caretNodeLog[caretNodeLog.length - 2].anchorNode
      );
    } else return true;
  } else return true;
};

const pushState = () => {
  console.log("pushing");
  textBodyInnerHTMLStates.push({
    innerHTML: textBody.innerHTML,
    innerText: textBody.innerText,
  });
  ++currentStateIndex;
};

const updateCurrentState = () => {
  console.log("not pushing");
  textBodyInnerHTMLStates[currentStateIndex].innerHTML = textBody.innerHTML;
  textBodyInnerHTMLStates[currentStateIndex].innerText = textBody.innerText;
};

const wroteWord = (keyPressed) => {
  if (keyPressed === " " && keyTypeLog[keyTypeLog.length - 2] !== " ")
    return true;
  else {
    const current = caretNodeLog[caretNodeLog.length - 1].offSet;
    const previous = caretNodeLog[caretNodeLog.length - 2].offSet;

    if (
      textBodyInnerHTMLStates[currentStateIndex].innerText.length > 1 &&
      lastTwoAnchorNodesAreEqual(caretNodeLog) &&
      Math.abs(current - previous) !== 1
    )
      return true;
    else return false;
  }
};

const carriageReturn = (keyPressed) => {
  return keyPressed === "Enter";
};

const pastedOrDeletedDigits = () => {
  try {
    //for firefox
    if (textBody.innerHTML.toString().slice(-4) === `<br>`) {
      return (
        Math.abs(
          textBody.innerText.toString().length -
            textBodyInnerHTMLStates[currentStateIndex].innerText.length
        ) > 2
      );
    }
    return (
      Math.abs(
        textBody.innerText.toString().length -
          textBodyInnerHTMLStates[currentStateIndex].innerText.length
      ) > 1
    );
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

const hasChangedDirection = (carrotNodeLog) => {
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
