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

  it('shows the title', async () => {
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
      await page.type('input.letter-box', 'ab');

      const inputValue = await page.evaluate(() =>
        document.querySelector('input.letter-box').value
      );
      assert.equal(inputValue, 'a');
    });

    it('selects the text when clicking in the letter box', async () => {
      await page.type('input.letter-box', 'ab');
      await page.click('input.letter-box');

      const selectedText = await page.evaluate(() => document.getSelection().toString());
      assert.equal(selectedText, 'A');
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
