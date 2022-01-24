const boldBtn = document.querySelector("#bold-text");
const underlineBtn = document.querySelector("#underline-text");
const italicBtn = document.querySelector("#italic-text");
const subBtn = document.querySelector("#sub-text");
const supBtn = document.querySelector("#sup-text");

const direction = ["LEFT_TO_RIGHT", "RIGHT_TO_LEFT"]; // kind of like an enum, will probably change later
let selectionDirection = ""; // put in this variable and the one above as temp to test new event listeners

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
