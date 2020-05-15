'use strict';
const path = require('path');
const {assert} = require('chai');
const puppeteer = require('puppeteer');

describe('anagram manager', () => {
  let browser, page;

  async function getProperty(el, prop) {
    return (await el.getProperty(prop)).jsonValue();
  }

  async function getText(el) {
    return await getProperty(el, 'textContent');
  }

  async function enterNewWord(page, word) {
    await page.evaluate(() => document.querySelector('form input').value = '');
    await page.type('form input', word);
    await page.click('button');
  }

  before(async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    page = await browser.newPage();
    await page.goto(`file:${path.join(__dirname, '../website/index.html')}`);
  });

  after(() => browser.close());

  it('shows the page title', async () => {
    const title = await page.title();
    assert.equal(title, 'Anagram Manager');
  });

  it('shows the heading', async () => {
    const heading = await getText(await page.$('h1'));
    assert.equal(heading, 'Anagram Manager');
  });

  it('shows a form', async () => {
    const form = await page.$('form');

    const label = await form.$('label');

    const labelText = await getText(label);
    assert.equal(labelText, 'What\'s the word?');

    const input = await label.$('input');

    const inputAutocomplete = await getProperty(input, 'autocomplete');
    assert.equal(inputAutocomplete, 'off');

    const inputRequired = await getProperty(input, 'required');
    assert.equal(inputRequired, true);

    const buttonText = await getText(await form.$('button'));
    assert.equal(buttonText, 'Jumble!');
  });

  it('shows no rows or boxes', async () => {
    const rows = await page.$$('div.row');
    assert.lengthOf(rows, 0);

    const boxes = await page.$$('div input.letter-boxes');
    assert.lengthOf(boxes, 0);
  });

  describe('when a word is entered', () => {
    before(async () => {
      await page.type('form label input', 'someword');
      await page.click('button');
    });

    it('shows the jumbled word', async () => {
      const letters = await page.$$('div.row div.letter');
      const word = await Promise.all(letters.map(async letter => await getText(letter)));

      assert.notEqual(word.join(''), 'SOMEWORD');
      assert.equal(word.sort().join(''), 'DEMOORSW');
    });

    it('shows the word over multiple lines', async () => {
      const rows = await page.$$('div.row');
      assert.lengthOf(rows, 3);
    });

    it('shows a box for each letter', async () => {
      const boxes = await page.$$('div input.letter-box');
      assert.lengthOf(boxes, 8);
    });

    it('only allows a single letter in a box', async () => {
      await page.type('input.letter-box', 'w');

      const inputValue = await page.evaluate(() =>
        document.querySelector('input.letter-box').value
      );
      assert.equal(inputValue, 'w');
    });

    it('selects the text when clicking in the letter box', async () => {
      await page.click('input.letter-box');
      await page.type('input.letter-box', 'me');
      await page.click('input.letter-box');

      const selectedText = await page.evaluate(() => document.getSelection().toString());
      assert.equal(selectedText, 'M');
    });

    describe('when a letter is typed into a letter box', () => {
      before(() => page.type('input.letter-box', 'o'));

      it('marks the letter as used', async () => {
        const usedLetters = await page.$$('div.row div.letter.used');
        assert.lengthOf(usedLetters, 1);
        assert.equal(await getText(usedLetters[0]), 'O');
      });

      it('does not show letter as incorrect', async () => {
        const incorrectBoxes = await page.$$('input.letter-box.incorrect');
        assert.lengthOf(incorrectBoxes, 0);
      });

      describe('when the same letter is entered in the same box', () => {
        before(async () => {
          await page.click('input.letter-box');
          await page.type('input.letter-box', 'o');
        });

        it('keeps the letter marked', async () => {
          const usedLetters = await page.$$('div.row div.letter.used');
          assert.lengthOf(usedLetters, 1);
          assert.equal(await getText(usedLetters[0]), 'O');
        });

        it('does not show letter as incorrect', async () => {
          const incorrectBoxes = await page.$$('input.letter-box.incorrect');
          assert.lengthOf(incorrectBoxes, 0);
        });
      });

      describe('when the same letter is added to a different box', () => {
        before(() => page.type('input.letter-box:nth-child(2)', 'o'));

        after(async () => {
          await page.click('input.letter-box:nth-child(2)');
          await page.keyboard.press('Delete');
        });

        it('marks both letters as used', async () => {
          const usedLetters = await page.$$('div.row div.letter.used');
          assert.lengthOf(usedLetters, 2);
          assert.equal(await getText(usedLetters[0]), 'O');
          assert.equal(await getText(usedLetters[1]), 'O');
        });

        it('does not show letter as incorrect', async () => {
          const incorrectBoxes = await page.$$('input.letter-box.incorrect');
          assert.lengthOf(incorrectBoxes, 0);
        });
      });

      describe('when the letter is changed', () => {
        before(async () => {
          await page.click('input.letter-box');
          await page.type('input.letter-box', 'w');
        });

        it('updates the marked letter', async () => {
          const usedLetters = await page.$$('div.row div.letter.used');
          assert.lengthOf(usedLetters, 1);
          assert.equal(await getText(usedLetters[0]), 'W');
        });

        it('does not show letter as incorrect', async () => {
          const incorrectBoxes = await page.$$('input.letter-box.incorrect');
          assert.lengthOf(incorrectBoxes, 0);
        });
      });

      describe('when a letter is entered which is not in the word', () => {
        let pageError;

        before(async () => {
          page.on('pageerror', e => pageError = e);

          await page.click('input.letter-box');
          await page.type('input.letter-box', 'q');
        });

        it('alerts the user the letter is not right', async () => {
          const incorrectBoxes = await page.$$('input.letter-box.incorrect');
          assert.lengthOf(incorrectBoxes, 1);
        });

        it('does not error', () => assert.isUndefined(pageError));

        describe('when the letter is removed', () => {
          before(async () => {
            await page.click('input.letter-box');
            await page.keyboard.press('Delete');
          });

          it('removes the alert', async () => {
            const incorrectBoxes = await page.$$('input.letter-box.incorrect');
            assert.lengthOf(incorrectBoxes, 0);
          });
        });

        describe('when the letter is changed to a valid letter', () => {
          before(async () => {
            await page.click('input.letter-box');
            await page.type('input.letter-box', 'm');
          });

          it('removes the alert', async () => {
            const incorrectBoxes = await page.$$('input.letter-box.incorrect');
            assert.lengthOf(incorrectBoxes, 0);
          });
        });
      });

      describe('when the letter is removed', () => {
        before(async () => {
          await page.type('input.letter-box', 'p');
          await page.click('input.letter-box');
          await page.keyboard.press('Delete');
        });

        it('unmarks the letter', async () => {
          const usedLetters = await page.$$('div.row div.letter.used');
          assert.lengthOf(usedLetters, 0);
        });

        it('does not show letter as incorrect', async () => {
          const incorrectBoxes = await page.$$('input.letter-box.incorrect');
          assert.lengthOf(incorrectBoxes, 0);
        });

        describe('when another letter is entered in the same box', () => {
          before(() => page.type('input.letter-box', 's'));

          it('marks the letter as used', async () => {
            const usedLetters = await page.$$('div.row div.letter.used');
            assert.lengthOf(usedLetters, 1);
            assert.equal(await getText(usedLetters[0]), 'S');
          });

          it('does not show letter as incorrect', async () => {
            const incorrectBoxes = await page.$$('input.letter-box.incorrect');
            assert.lengthOf(incorrectBoxes, 0);
          });
        });
      });
    });

    describe('when another word is entered', () => {
      before(() => enterNewWord(page, 'anotherthing'));

      it('shows the new jumbled word', async () => {
        const letters = await page.$$('div.row div.letter');
        const word = await Promise.all(letters.map(async letter => await getText(letter)));

        assert.notEqual(word.join(''), 'ANOTHERTHING');
        assert.equal(word.sort().join(''), 'AEGHHINNORTT');
      });

      it('shows a box for each letter', async () => {
        const boxes = await page.$$('div input.letter-box');
        assert.lengthOf(boxes, 12);
      });
    });

    describe('when a word with non-alphabetical characters is entered', () => {
      before(() => enterNewWord(page, 'a😀 -_+/b!"385£$%^&*(c  ~@:?><d'));

      it('strips the non-alphabetical characters', async () => {
        const letters = await page.$$('div.row div.letter');
        const word = await Promise.all(letters.map(async letter => await getText(letter)));

        assert.equal(word.sort().join(''), 'ABCD');
      });

      it('has the correct amount of rows for the sanitised word', async () => {
        const rows = await page.$$('div.row');
        assert.lengthOf(rows, 2);
      });
    });

    describe('when no valid characters are entered', () => {
      before(() => enterNewWord(page, '________'));

      it('shows a message', async () => {
        const alert = await page.$('.alert');
        assert.isNotNull(alert);

        const message = await getText(alert);
        assert.equal(message, 'No alphabetical characters entered');
      });

      describe('when a valid word is then entered', () => {
        before(() => enterNewWord(page, 'hello'));

        it('removes the message', async () => {
          const message = await page.$('.alert');
          assert.isNull(message);
        });
      });
    });

    [1, 2].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on one line', async () => {
          const rows = await page.$$('div.row');
          assert.lengthOf(rows, 1);
        });
      });
    });

    [3, 4, 5, 6].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on two lines', async () => {
          const rows = await page.$$('div.row');
          assert.lengthOf(rows, 2);
        });
      });
    });

    [7, 8, 9, 10, 11, 12].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on three lines', async () => {
          const rows = await page.$$('div.row');
          assert.lengthOf(rows, 3);
        });
      });
    });

    [13, 14, 15, 16].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on four lines', async () => {
          const rows = await page.$$('div.row');
          assert.lengthOf(rows, 4);
        });
      });
    });

    [17, 18, 19, 20, 30].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on five lines', async () => {
          const rows = await page.$$('div.row');
          assert.lengthOf(rows, 5);
        });
      });
    });
  });
});
