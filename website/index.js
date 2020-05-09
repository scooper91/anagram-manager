document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const word = formData.get('word');
    const shuffledWord = _.shuffle(word.toUpperCase().split('')).join('');
    document.getElementById('jumbled').innerHTML = shuffledWord;
  });
});
