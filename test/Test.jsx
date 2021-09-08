import React from 'react';
import AsyncButton from '@wojtekmaj/react-async-button/src';

import './Test.less';

import { Button } from './button.styles';

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function Test() {
  function onSyncClick() {
  }

  async function onAsyncClick() {
    await sleep(2000);
  }

  return (
    <div className="Test">
      <header>
        <h1>
          react-async-button test page
        </h1>
      </header>
      <div className="Test__container">
        <main className="Test__container__content">
          <AsyncButton
            onClick={onSyncClick}
            pendingConfig={pendingConfig}
            successConfig={successConfig}
            errorConfig={errorConfig}
          >
            Do sync stuff
          </AsyncButton>
          <AsyncButton
            onClick={onAsyncClick}
            pendingConfig={pendingConfig}
            successConfig={successConfig}
            errorConfig={errorConfig}
          >
            Do async stuff
          </AsyncButton>
          <AsyncButton
            as={Button}
            onClick={onAsyncClick}
            pendingConfig={pendingConfig}
            successConfig={successConfig}
            errorConfig={errorConfig}
          >
            I’m using
            {' '}
            <code>as</code>
            {' '}
            prop
          </AsyncButton>
        </main>
      </div>
    </div>
  );
}
