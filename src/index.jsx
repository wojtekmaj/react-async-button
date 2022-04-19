import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';

const STATES = {
  ERROR: 'error',
  INIT: 'init',
  PENDING: 'pending',
  SUCCESS: 'success',
};

const AsyncButton = React.forwardRef(
  (
    {
      as = 'button',
      errorConfig,
      onClick,
      pendingConfig,
      resetTimeout = 2000,
      successConfig,
      ...otherProps
    },
    ref,
  ) => {
    const [buttonState, setButtonState] = useState(STATES.INIT);
    const cancellablePromise = useRef();
    const timeout = useRef();

    useEffect(
      () => () => {
        if (cancellablePromise.current) {
          cancellablePromise.current.cancel();
        }
        clearTimeout(timeout.current);
      },
      [],
    );

    const onClickInternal = useCallback(
      async (event) => {
        clearTimeout(timeout.current);

        try {
          const result = onClick(event);
          setButtonState(STATES.PENDING);

          if (result instanceof Promise) {
            cancellablePromise.current = makeCancellable(result);
            await cancellablePromise.current.promise;
          }

          setButtonState(STATES.SUCCESS);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
          setButtonState(STATES.ERROR);
        }

        timeout.current = setTimeout(() => {
          setButtonState(STATES.INIT);
        }, resetTimeout);
      },
      [onClick, resetTimeout],
    );

    const buttonConfig = (() => {
      switch (buttonState) {
        case STATES.ERROR:
          return errorConfig;
        case STATES.PENDING:
          return pendingConfig;
        case STATES.SUCCESS:
          return successConfig;
        default:
          return null;
      }
    })();

    const Component = as;

    return (
      <Component
        ref={ref}
        onClick={onClick ? onClickInternal : null}
        {...otherProps}
        {...buttonConfig}
      />
    );
  },
);

AsyncButton.displayName = 'AsyncButton';

const configProps = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const isConfigObject = PropTypes.shape(configProps);

AsyncButton.propTypes = {
  ...configProps,
  errorConfig: isConfigObject,
  initConfig: isConfigObject,
  onClick: PropTypes.func,
  pendingConfig: isConfigObject,
  resetTimeout: PropTypes.number,
  successConfig: isConfigObject,
};

export default AsyncButton;
