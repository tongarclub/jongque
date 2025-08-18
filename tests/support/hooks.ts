import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { World } from './world';

BeforeAll(async function() {
  console.log('Starting test suite...');
});

Before(async function(this: World) {
  await this.init();
});

After(async function(this: World, scenario) {
  // Take screenshot on failure
  if (scenario.result?.status === 'FAILED') {
    const screenshot = await this.page.screenshot();
    this.attach(screenshot, 'image/png');
  }
  
  await this.cleanup();
});

AfterAll(async function() {
  console.log('Test suite completed.');
});
