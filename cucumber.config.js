const config = {
  require: [
    'tests/support/hooks.ts',
    'tests/step-definitions/**/*.ts'
  ],
  requireModule: ['ts-node/register'],
  format: [
    'progress-bar'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true
};

module.exports = {
  default: config
};
