'use strict';
const path = require('path');
const {assert} = require('chai');
const puppeteer = require('puppeteer');

describe('anagram manager', () => {
  let browser;

  async function launchPage() {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    return await browser.newPage();
  }

  async function goToSite(page) {
    await page.goto(`file:${path.join(__dirname, '../website/index.html')}`);
  }

  async function getText(el) {
    return (await el.getProperty('textContent')).jsonValue();
  }

  afterEach(() => browser.close());

  it('shows the title', async () => {
    const page = await launchPage();
    await goToSite(page);

    const heading = await getText(await page.$('h1'));
    assert.equal(heading, 'Anagram Manager');
  });

  it('shows a form', async () => {
    const page = await launchPage();
    await goToSite(page);

    const form = await page.$('form');

    const labelText = await getText(await form.$('label'));
    assert.equal(labelText, 'What\'s the word?');

    const buttonText = await getText(await form.$('button'));
    assert.equal(buttonText, 'Jumble!');
  });

  describe('when a word is entered', () => {
    let page;

    beforeEach(async () => {
      page = await launchPage();
      await goToSite(page);

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
