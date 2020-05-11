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

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();

    const wordToShuffle = getWord(e.target);
    const shuffledWord = _.shuffle(wordToShuffle.toUpperCase().split(''));

    const jumbledElement = document.getElementById('jumbled');
    jumbledElement.innerHTML = '';

    const rowCount = getRowCount(shuffledWord);

    _.chunk(shuffledWord, Math.ceil(shuffledWord.length / rowCount)).forEach(chunk => {
      const row = createRow(jumbledElement);

      chunk.forEach(letter => {
        const letterElement = createLetterElement();
        letterElement.appendChild(document.createTextNode(letter));
        row.appendChild(letterElement);
      });
    });
  });
});
