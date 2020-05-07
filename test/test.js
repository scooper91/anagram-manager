'use strict';
const path = require('path');
const {assert} = require('chai');
const puppeteer = require('puppeteer');

describe('anagram manager', () => {
  let browser;

  after(() => browser.close());

	it('shows the title', async () => {
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`file:${path.join(__dirname, '../index.html')}`);

    const heading = await (await (await page.$('h1')).getProperty('textContent')).jsonValue();
    assert.equal(heading, 'Anagram Manager');
	});
});
