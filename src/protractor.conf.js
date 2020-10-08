// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  onPrepare() { async() => {
    const delay = ms => new Promise(res => setTimeout(res, ms));
    browser.driver.get(browser.baseUrl + 'login.html');

    browser.driver.findElement(by.id('username')).sendKeys('masterctv@bmo-offshore.com');
    browser.driver.findElement(by.id('password')).sendKeys('hanspasswordtocheck');
    browser.driver.findElement(by.id('clickme')).click();
  }}
};
