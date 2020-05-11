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
      await page.evaluate(() => document.querySelector('input').value = '');
      await page.type('input', word);
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
      const letters = await page.$$('div.row');
      assert.equal(letters.length, 3);
    });

    describe('when another word is entered', () => {
      before(() => enterNewWord(page, 'anotherthing'));

      it('shows the new jumbled word', async () => {
        const letters = await page.$$('div.row div.letter');
        const word = await Promise.all(letters.map(async letter => await getText(letter)));

        assert.notEqual(word.join(''), 'ANOTHERTHING');
        assert.equal(word.sort().join(''), 'AEGHHINNORTT');
      });
    });

    [1, 2].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on one line', async () => {
          const letters = await page.$$('div.row');
          assert.equal(letters.length, 1);
        });
      });
    });

    [3, 4, 5, 6].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on two lines', async () => {
          const letters = await page.$$('div.row');
          assert.equal(letters.length, 2);
        });
      });
    });

    [7, 8, 9, 10, 11, 12].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on three lines', async () => {
          const letters = await page.$$('div.row');
          assert.equal(letters.length, 3);
        });
      });
    });

    [13, 14, 15, 16].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on four lines', async () => {
          const letters = await page.$$('div.row');
          assert.equal(letters.length, 4);
        });
      });
    });

    [17, 18, 19, 20, 30].forEach(letterCount => {
      describe(`when a ${letterCount} letter word is entered`, () => {
        before(() => enterNewWord(page, Array(letterCount).fill('a').join('')));

        it('shows it on five lines', async () => {
          const letters = await page.$$('div.row');
          assert.equal(letters.length, 5);
        });
      });
    });
  });
});
