/* eslint-env jest */

export function waitForAsync() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function waitForAsyncFakeTimers() {
  const promise = waitForAsync();
  jest.runAllTimers();
  return promise;
}
