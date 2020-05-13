function getWord(form) {
  const formData = new FormData(form);
  return formData.get('word');
}

function getRowCount(word) {
  const length = word.length;

  if (length > 0 && length <= 2) { return 1; }
  if (length >= 3 && length <= 6) { return 2; }
  if (length >= 7 && length <= 12) { return 3; }
  if (length >= 13 && length <= 16) { return 4; }
  if (length >= 17) { return 5; }
}

function removeOldMessage() {
  if (document.querySelector('.alert')) {
    document.querySelector('.alert').remove();
  }
}

function showErrorMessage() {
  const alert = document.createElement('div');
  alert.className = 'alert';

  alert.appendChild(document.createTextNode('No alphabetical characters entered'));
  document.querySelector('form').insertAdjacentElement('afterend', alert);
}

function createRow(element) {
  const row = document.createElement('div');
  row.className = 'row';
  element.appendChild(row);
  return row;
}

function createLetterElement() {
  const letterElement = document.createElement('div');
  letterElement.className = 'letter';
  return letterElement;
}

function showJumbledLetters(letters) {
  const jumbledElement = document.getElementById('jumbled');
  jumbledElement.innerHTML = '';

  const rowCount = getRowCount(letters);

  _.chunk(letters, Math.ceil(letters.length / rowCount)).forEach(chunk => {
    const row = createRow(jumbledElement);

    chunk.forEach(letter => {
      const letterElement = createLetterElement();
      letterElement.appendChild(document.createTextNode(letter));
      row.appendChild(letterElement);
    });
  });
}

function handleLetterBoxInput(box, input) {
  const inputtedLetter = input && input.toUpperCase();

  const previousLetter = box.getAttribute('data-letter');
  if (previousLetter === inputtedLetter) { return; }

  const letterElements = [...document.querySelectorAll('div.letter')];

  if (previousLetter) {
    const letterToUnmark = letterElements.find(letter =>
      letter.innerText === previousLetter && letter.classList.contains('used'));
    letterToUnmark.classList.remove('used');
  }

  if (!inputtedLetter) { return box.removeAttribute('data-letter'); }

  const letterToMark = letterElements.find(letter =>
    letter.innerText === inputtedLetter && !letter.classList.contains('used'));
  letterToMark.classList.add('used');

  box.setAttribute('data-letter', inputtedLetter);
}

function showLetterBoxes(letters) {
  const boxesElement = document.getElementById('letter-boxes');
  boxesElement.innerHTML = '';

  letters.forEach(letter => {
    const box = document.createElement('input');
    box.className = 'letter-box';
    box.setAttribute('maxlength', 1);
    box.addEventListener('click', function () { this.select(); });

    box.addEventListener('input', e => handleLetterBoxInput(box, e.data));

    boxesElement.appendChild(box);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    removeOldMessage();

    const sanitisedWord = getWord(e.target).replace(/[^A-Za-z]/g, '');
    if (!sanitisedWord.length) { showErrorMessage(); }

    const shuffledWord = _.shuffle(sanitisedWord.toUpperCase().split(''));

    showJumbledLetters(shuffledWord);
    showLetterBoxes(shuffledWord);
  });
});
