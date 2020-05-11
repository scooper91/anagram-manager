function createRow(element) {
  const row = document.createElement('div');
  row.className = 'row';
  element.appendChild(row);
  return row;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();

    const jumbledElement = document.getElementById('jumbled');
    jumbledElement.innerHTML = '';
    const formData = new FormData(e.target);
    const input = formData.get('word');
    const shuffledWord = _.shuffle(input.toUpperCase().split(''));

    let rows;

    if (shuffledWord.length > 0 && shuffledWord.length <= 2) {
      rows = 1;
    }

    if (shuffledWord.length >= 3 && shuffledWord.length <= 6) {
      rows = 2;
    }

    if (shuffledWord.length >= 7 && shuffledWord.length <= 12) {
      rows = 3;
    }

    if (shuffledWord.length >= 13 && shuffledWord.length <= 16) {
      rows = 4;
    }

    if (shuffledWord.length >= 17) {
      rows = 5;
    }

    _.chunk(shuffledWord, Math.ceil(shuffledWord.length / rows)).forEach(chunk => {
      const row = createRow(jumbledElement);

      chunk.forEach(letter => {
        const letterElement = document.createElement('div');
        letterElement.className = 'letter';
        letterElement.appendChild(document.createTextNode(letter));
        row.appendChild(letterElement);
      });
    });
  });
});
