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

    const buttonText = await getText(await form.$('button'));
    assert.equal(buttonText, 'Jumble!');
  });

  describe('when a word is entered', () => {
    before(async () => {
      await page.type('form label input', 'someword');
      await page.click('button');
    });

    it('shows the jumbled word', async () => {
      const word = await getText(await page.$('div'));
      assert.notEqual(word, 'someword');
      assert.equal(word.split('').sort().join(''), 'demoorsw');
    });

    describe('when another word is entered', () => {
      before(async () => {
        await page.evaluate(() => document.querySelector('input').value = '');
        await page.type('input', 'anotherthing');
        await page.click('button');
      });

      it('shows the jumbled word', async () => {
        const word = await getText(await page.$('div'));
        assert.notEqual(word, 'anotherthing');
        assert.equal(word.split('').sort().join(''), 'aeghhinnortt');
      });
    });
  });
});
