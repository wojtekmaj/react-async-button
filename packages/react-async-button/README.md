[![npm](https://img.shields.io/npm/v/@wojtekmaj/react-async-button.svg)](https://www.npmjs.com/package/@wojtekmaj/react-async-button) ![downloads](https://img.shields.io/npm/dt/@wojtekmaj/react-async-button.svg) [![CI](https://github.com/wojtekmaj/react-async-button/actions/workflows/ci.yml/badge.svg)](https://github.com/wojtekmaj/react-async-button/actions)

# @wojtekmaj/react-async-button

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

```tsx
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

### Usage with React Native

AsyncButton renders `<button>` by default, but by passing `as` prop you can render any component you want. Here's the same example, but using `<TouchableOpacity>` instead of `<button>`:

```tsx
import { TouchableOpacity } from 'react-native';
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
      as={TouchableOpacity}
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
| onClick       | A function, a function returning a Promise, or an async function to be called when the button is clicked. | n/a           |                                                                                 |
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
    <td >
      <img src="https://avatars.githubusercontent.com/u/5426427?v=4&s=128" width="64" height="64" alt="Wojciech Maj">
    </td>
    <td>
      <a href="https://github.com/wojtekmaj">Wojciech Maj</a>
    </td>
  </tr>
</table>
