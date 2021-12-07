const textBody = document.querySelector("#text-body");
const preTag = document.querySelector("#pre-tag");
const boldBtn = document.querySelector("#bold-text");
const underlineBtn = document.querySelector("#underline-text");
const italicBtn = document.querySelector("#italic-text");
const subBtn = document.querySelector("#sub-text");
const supBtn = document.querySelector("#sup-text");
const undoBtn = document.querySelector("#undo");
const redoBtn = document.querySelector("#redo");
const originalText = textBody.innerHTML;
const textBodyInnerHTMLStates = ["", originalText];
let currentStateIndex = 1;
preTag.innerText = textBody.innerHTML;

document.addEventListener("keyup", () => {
  preTag.innerText = textBody.innerHTML;
  if (currentStateIndex < textBodyInnerHTMLStates.length - 1) {
    let difference = textBodyInnerHTMLStates.length - 1 - currentStateIndex;
    for (let i = 0; i < difference; ++i) {
      textBodyInnerHTMLStates.pop();
    }
  }
  textBodyInnerHTMLStates.push(textBody.innerHTML);
  console.log(textBodyInnerHTMLStates);
  ++currentStateIndex;
});

underlineBtn.addEventListener("click", () => {
  try {
    const selection = window.getSelection();
    const selectionRange = selection.getRangeAt(0);
    console.log(selection);
    executeCMD(selection, selectionRange, textBody, tag.underline);
  } catch (e) {
    console.log(e);
  }
});

boldBtn.addEventListener("click", () => {
  try {
    const selection = window.getSelection();
    const selectionRange = selection.getRangeAt(0);
    console.log(selection);
    executeCMD(selection, selectionRange, textBody, tag.bold);
  } catch (e) {
    console.log(e);
  }
});

italicBtn.addEventListener("click", () => {
  try {
    const selection = window.getSelection();
    const selectionRange = selection.getRangeAt(0);
    console.log(selection);
    executeCMD(selection, selectionRange, textBody, tag.italic);
  } catch (e) {
    console.log(e);
  }
});

subBtn.addEventListener("click", () => {
  try {
    const selection = window.getSelection();
    const selectionRange = selection.getRangeAt(0);
    console.log(selection);
    executeCMD(selection, selectionRange, textBody, tag.sub);
  } catch (e) {
    console.log(e);
  }
});

supBtn.addEventListener("click", () => {
  try {
    const selection = window.getSelection();
    const selectionRange = selection.getRangeAt(0);
    console.log(selection);
    executeCMD(selection, selectionRange, textBody, tag.sup);
  } catch (e) {
    console.log(e);
  }
});

undoBtn.addEventListener("click", () => {
  if (currentStateIndex > 1) {
    textBody.innerHTML = textBodyInnerHTMLStates[--currentStateIndex];
    preTag.innerText = textBody.innerHTML;
  }
});

redoBtn.addEventListener("click", () => {
  if (textBodyInnerHTMLStates.length > currentStateIndex + 1) {
    textBody.innerHTML = textBodyInnerHTMLStates[++currentStateIndex];
    preTag.innerText = textBody.innerHTML;
  }
});
const executeCMD = (selection, selectionRange, textBody, tagType) => {
  try {
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
    textBodyInnerHTMLStates.push(textBody.innerHTML);
    console.log(textBodyInnerHTMLStates);
    ++currentStateIndex;

    preTag.innerText = textBody.innerHTML;
    window.getSelection().removeAllRanges();
  } catch (e) {
    console.log(e);
  }
};

const getSelectionInnerHTML = (selection, selectionRange, textBody) => {
  try {
    const myDelimiter = `~${Math.floor(Math.random() * 1000000000000000)}`;
    const newNode = document
      .createRange()
      .createContextualFragment(myDelimiter);
    selectionRange.insertNode(newNode);
    const rangeToPlaceEnd = document.createRange();
    rangeToPlaceEnd.setStart(selection.focusNode, selection.focusOffset);
    rangeToPlaceEnd.setEnd(selection.focusNode, selection.focusOffset);
    const endNode = document
      .createRange()
      .createContextualFragment(myDelimiter);
    rangeToPlaceEnd.insertNode(endNode);

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
  console.log("tag indexes = ", tagIndexes);

  console.log("InnerHTML = ", selectionIHO.innerHTML);
  console.log("selectionIHO.index = ", selectionIHO.index);
  console.log(
    "selectionIHO.index + selectionIHO.innerHTML.length = ",
    selectionIHO.index + selectionIHO.innerHTML.length
  );
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

  console.log(
    "firstInnerTag = ",
    firstInnerTag,
    "closestAnteriorTag = ",
    closestAnteriorTag,
    "lastInnerTag = ",
    lastInnerTag,
    "closestPosteriorTag = ",
    closestPosteriorTag
  );

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
  } else {
    selectionIHO.innerHTML = removeTags(selectionIHO.innerHTML, tagType);
    return `${tagType.startTag}${selectionIHO.innerHTML}${tagType.endTag}`;
  }
};
