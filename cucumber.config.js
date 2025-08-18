const config = {
  require: [
    'tests/step-definitions/**/*.ts',
    'tests/support/**/*.ts'
  ],
  requireModule: ['ts-node/register'],
  format: [
    'progress-bar',
    'html:test-results/cucumber-report.html',
    'json:test-results/cucumber-report.json'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true,
  parallel: 2
};

module.exports = {
  default: config
};
