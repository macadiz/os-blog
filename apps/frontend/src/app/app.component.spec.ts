describe('AppComponent', () => {
  it('should pass a basic test', () => {
    // Simple test to verify Jest is working
    expect(1 + 1).toBe(2);
  });

  it('should have DOM testing working', () => {
    // Test that Jest DOM is available
    const div = document.createElement('div');
    div.textContent = 'Hello World';
    expect(div).toBeInTheDocument;
  });
});