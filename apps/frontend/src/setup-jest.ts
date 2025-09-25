// Use the jest-preset-angular zone setup
require('jest-preset-angular/setup-env/zone');
import "@testing-library/jest-dom";

// Initialize Angular Testing Environment for Angular Testing Library
beforeAll(async () => {
  const { TestBed } = await import("@angular/core/testing");
  const { BrowserDynamicTestingModule, platformBrowserDynamicTesting } =
    await import("@angular/platform-browser-dynamic/testing");

  // Initialize TestBed if not already done
  try {
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting()
    );
  } catch (error) {
    // TestBed already initialized - this is fine
  }
});

// Clean up after each test
afterEach(async () => {
  const { TestBed } = await import("@angular/core/testing");
  TestBed.resetTestingModule();
});
