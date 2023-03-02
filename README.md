[![npm](https://img.shields.io/npm/v/@wojtekmaj/react-async-button.svg)](https://www.npmjs.com/package/@wojtekmaj/react-async-button) ![downloads](https://img.shields.io/npm/dt/@wojtekmaj/react-async-button.svg) [![CI](https://github.com/wojtekmaj/react-async-button/workflows/CI/badge.svg)](https://github.com/wojtekmaj/react-async-button/actions)

# React-Async-Button

A button that handles Promises for your React app.

## tl;dr

- Install by executing `npm install @wojtekmaj/react-async-button` or `yarn add @wojtekmaj/react-async-button`.
- Use by adding `import AsyncButton from '@wojtekmaj/react-async-button'` and passing `pendingConfig`, `successConfig`.

## Getting started

### Compatibility

Your project needs to use React 16.8 or later.

React-Async-Button is also compatible with React Native.

### Installation

Add React-Async-Button to your project by executing `npm install @wojtekmaj/react-async-button` or `yarn add @wojtekmaj/react-async-button`.

### Usage

Here's an example of basic usage:

```js
import React from 'react';
import AsyncButton from '@wojtekmaj/react-async-button';

const pendingConfig = {
  children: 'Loading…',
  disabled: true,
};

const successConfig = {
  children: 'Done',
};

const errorConfig = {
  children: 'Try again',
};

function MyComponent() {
  async function onClick(event) {
    // Do some async stuff
  }

  return (
    <AsyncButton
      onClick={onClick}
      pendingConfig={pendingConfig}
      successConfig={successConfig}
      errorConfig={errorConfig}
    >
      Do async stuff
    </AsyncButton>
  );
}
```

## User guide

### AsyncButton

Renders a button.

#### Props

| Prop name     | Description                                                                                               | Default value | Example values                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------- |
| as            | Component to render button with.                                                                          | `"button"`    | <ul><li>String: `"custom-button"`</li><li>React component: `MyButton`</li></ul> |
| errorConfig   | Props to override default props with when `onClick` async function throws.                                | `{}`          | `{ children: 'Try again' }`                                                     |
| onClick       | A function, a function returning a Promise, or an async function.                                         | n/a           |                                                                                 |
| pendingConfig | Props to override default props when button has been clicked but `onClick` function did not yet resolve.  | `{}`          | `{ children: 'Loading…' }`                                                      |
| resetTimeout  | Time in milliseconds after which AsyncButton should stop using `errorConfig` / `successConfig` overrides. | `2000`        | `5000`                                                                          |
| successConfig | Props to override default props with when `onClick` async function resolves.                              | `{}`          | `{ children: 'Done' }`                                                          |

…and everything else a normal `<button>` would accept!

#### Accessibility

For accessibility purposes, we recommend setting `aria-live="polite"` and `aria-atomic="true"` props so that button label changes are announced to the user using assitive technologies.

## License

The MIT License.

## Author

<table>
  <tr>
    <td>
      <img src="https://github.com/wojtekmaj.png?s=100" width="100">
    </td>
    <td>
      Wojciech Maj<br />
      <a href="mailto:kontakt@wojtekmaj.pl">kontakt@wojtekmaj.pl</a><br />
      <a href="https://wojtekmaj.pl">https://wojtekmaj.pl</a>
    </td>
  </tr>
</table>
