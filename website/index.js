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

function showJumbledLetters(word) {
  const jumbledElement = document.getElementById('jumbled');
  jumbledElement.innerHTML = '';

  const rowCount = getRowCount(word);

  _.chunk(word, Math.ceil(word.length / rowCount)).forEach(chunk => {
    const row = createRow(jumbledElement);

    chunk.forEach(letter => {
      const letterElement = createLetterElement();
      letterElement.appendChild(document.createTextNode(letter));
      row.appendChild(letterElement);
    });
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

    const boxesElement = document.getElementById('letter-boxes');
    boxesElement.innerHTML = '';

    shuffledWord.forEach(letter => {
      const box = document.createElement('span');
      box.className = 'letter-box';
      boxesElement.appendChild(box);
    });
  });
});
