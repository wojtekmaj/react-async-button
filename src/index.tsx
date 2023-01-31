import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import makeCancellable from 'make-cancellable-promise';

// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
// A more precise version of just React.ComponentPropsWithoutRef on its own
export type PropsOf<C extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>> =
  JSX.LibraryManagedAttributes<C, React.ComponentPropsWithoutRef<C>>;

type AsProp<C extends React.ElementType> = {
  /**
   * An override of the default HTML tag.
   * Can also be another React component.
   */
  as?: C;
};

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type ExtendableProps<ExtendedProps = unknown, OverrideProps = unknown> = OverrideProps &
  Omit<ExtendedProps, keyof OverrideProps>;

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
export type InheritableElementProps<C extends React.ElementType, Props = unknown> = ExtendableProps<
  PropsOf<C>,
  Props
>;

/**
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included
 */
export type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = unknown,
> = InheritableElementProps<C, Props & AsProp<C>>;

/**
 * Utility type to extract the `ref` prop from a polymorphic component
 */
export type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];
/**
 * A wrapper of `PolymorphicComponentProps` that also includes the `ref`
 * prop for the polymorphic component
 */
export type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = unknown,
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };

type Config<T extends React.ElementType> = React.ComponentPropsWithoutRef<T>;

type Props<T extends React.ElementType> = {
  errorConfig?: Config<T>;
  onClick?: (event: React.MouseEvent) => void | Promise<void>;
  pendingConfig?: Config<T>;
  resetTimeout?: number;
  successConfig?: Config<T>;
} & Config<T>;

type AsyncButtonProps<C extends React.ElementType = 'button'> = PolymorphicComponentPropsWithRef<
  C,
  Props<C>
>;

const STATES = {
  ERROR: 'error',
  INIT: 'init',
  PENDING: 'pending',
  SUCCESS: 'success',
} as const;

const AsyncButton = React.forwardRef(
  <T extends React.ElementType = 'button'>(
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
  ) => {
    const [buttonState, setButtonState] = useState<typeof STATES[keyof typeof STATES]>(STATES.INIT);
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

    const buttonConfig: Config<typeof Component> | null | undefined = (() => {
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
  onClick: PropTypes.func,
  pendingConfig: isConfigObject,
  resetTimeout: PropTypes.number,
  successConfig: isConfigObject,
};

export default AsyncButton as <T extends React.ElementType>(
  props: AsyncButtonProps<T> & { ref?: PolymorphicRef<T> },
) => React.ReactElement;
