'use client';

import React, { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';

type Config<T extends React.ElementType> = Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'onClick'
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => void;

type AsyncMaybe<T extends AnyFunction | unknown> = T extends AnyFunction
  ? (...args: Parameters<T>) => ReturnType<T> | Promise<ReturnType<T>>
  : never;

type OnClickType<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>['onClick'];

export type AsyncButtonProps<T extends React.ElementType> = {
  /**
   * Component to render button with.
   */
  as?: T;
  /**
   * Props to override default props with when `onClick` async function throws.
   *
   * @default {}
   * @example { children: 'Try again' }
   */
  errorConfig?: Config<T>;
  /**
   * A function, a function returning a Promise, or an async function to be called when the button is clicked.
   */
  onClick?: AsyncMaybe<OnClickType<T>>;
  /**
   * Props to override default props when button has been clicked but `onClick` function did not yet resolve.
   *
   * @default {}
   * @example { children: 'Loading…' }
   */
  pendingConfig?: Config<T>;
  /**
   * Time in milliseconds after which AsyncButton should stop using `errorConfig` / `successConfig` overrides.
   *
   * @default 2000
   * @example 5000
   */
  resetTimeout?: number;
  /**
   * Props to override default props with when `onClick` async function resolves.
   *
   * @default {}
   * @example { children: 'Done' }
   */
  successConfig?: Config<T>;
} & Config<T>;

type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>['ref'];

const STATES = {
  ERROR: 'error',
  INIT: 'init',
  PENDING: 'pending',
  SUCCESS: 'success',
} as const;

/**
 * Renders a button.
 */
const AsyncButton = forwardRef(function AsyncButton<T extends React.ElementType = 'button'>(
  {
    as,
    errorConfig,
    onClick,
    pendingConfig,
    resetTimeout = 2000,
    successConfig,
    ...otherProps
  }: AsyncButtonProps<T>,
  ref?: PolymorphicRef<T>,
) {
  const [buttonState, setButtonState] = useState<(typeof STATES)[keyof typeof STATES]>(STATES.INIT);
  const cancellablePromise = useRef<ReturnType<typeof makeCancellable>>();
  const timeout = useRef<ReturnType<typeof setTimeout>>();

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
    (event: React.MouseEvent) => {
      if (!onClick) {
        return;
      }

      clearTimeout(timeout.current);

      const onSuccess = () => {
        setButtonState(STATES.SUCCESS);
      };

      const onError = () => {
        setButtonState(STATES.ERROR);
      };

      const finallyCallback = () => {
        timeout.current = setTimeout(() => {
          setButtonState(STATES.INIT);
        }, resetTimeout);
      };

      try {
        const result = onClick(event);
        setButtonState(STATES.PENDING);

        if (result instanceof Promise) {
          cancellablePromise.current = makeCancellable(result);
          cancellablePromise.current.promise
            .then(onSuccess)
            .catch(onError)
            .finally(finallyCallback);
        } else {
          onSuccess();
          finallyCallback();
        }
      } catch (error) {
        onError();
        finallyCallback();
      }
    },
    [onClick, resetTimeout],
  );

  const Component = as || 'button';

  const buttonConfig: Config<T> | null | undefined = (() => {
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

  return (
    <Component
      ref={ref}
      onClick={onClick ? onClickInternal : undefined}
      {...otherProps}
      {...buttonConfig}
    />
  );
});

AsyncButton.displayName = 'AsyncButton';

const configProps = {
  children: PropTypes.node,
  className: PropTypes.string,
};

const isConfigObject = PropTypes.shape(configProps);

AsyncButton.propTypes = {
  ...configProps,
  errorConfig: isConfigObject,
  onClick: PropTypes.func,
  pendingConfig: isConfigObject,
  resetTimeout: PropTypes.number,
  successConfig: isConfigObject,
};

export default AsyncButton as <T extends React.ElementType = 'button'>(
  props: AsyncButtonProps<T> & React.RefAttributes<React.ElementRef<T>>,
) => React.ReactElement | null;
