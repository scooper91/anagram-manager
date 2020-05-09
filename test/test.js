'use strict';
const path = require('path');
const {assert} = require('chai');
const puppeteer = require('puppeteer');

describe('anagram manager', () => {
  let browser, page;

  async function getText(el) {
    return (await el.getProperty('textContent')).jsonValue();
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

    const labelText = await getText(await form.$('label'));
    assert.equal(labelText, 'What\'s the word?');

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
  });
});
