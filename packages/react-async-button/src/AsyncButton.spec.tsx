import { beforeEach, describe, expect, it, vi } from 'vitest';
import React, { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AsyncButton from './index.js';

vi.useFakeTimers();

const pendingConfig = {
  children: 'Loading…',
};

const successConfig = {
  children: 'Success!',
};

const errorConfig = {
  children: 'Try again',
};

describe('<AsyncButton /> component', () => {
  const defaultProps = {
    children: 'Click me',
    pendingConfig,
    successConfig,
    errorConfig,
  } satisfies React.ComponentProps<typeof AsyncButton>;

  let user: ReturnType<typeof userEvent.setup>;
  beforeEach(() => {
    // See https://github.com/testing-library/react-testing-library/issues/1195
    (globalThis.jest as Record<string, unknown>) = {
      advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
    };

    user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime.bind(vi),
    });
  });

  it('renders button properly', () => {
    render(<AsyncButton {...defaultProps} />);

    expect(screen.queryByRole('button')).toBeInTheDocument();
  });

  it('passes ref correctly', () => {
    const ref = createRef<HTMLButtonElement>();

    render(<AsyncButton {...defaultProps} ref={ref} />);

    const button = screen.getByRole('button');

    expect(ref.current).toBe(button);
  });

  it('calls onClick properly', async () => {
    const onClick = vi.fn();

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(expect.any(Object));
  });

  it('changes button state to success on click if onClick is synchronous', async () => {
    const onClick = () => {
      // Intentionally empty
    };

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    const button2 = screen.getByRole('button');
    expect(button2).toHaveTextContent('Success!');
  });

  it('changes button state to default after refresh timeout has passed', async () => {
    const onClick = () => {
      // Intentionally empty
    };

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    const button2 = screen.getByRole('button');
    expect(button2).toHaveTextContent('Success!');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const button3 = screen.getByRole('button');
    expect(button3).toHaveTextContent('Success!');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const button4 = screen.getByRole('button');
    expect(button4).toHaveTextContent('Click me');
  });

  it('changes button state to pending on click if onClick is asynchronous', async () => {
    let resolve: () => void;
    const onClick = () =>
      new Promise<void>((res) => {
        resolve = res;
      });

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    const button2 = screen.getByRole('button');
    expect(button2).toHaveTextContent('Loading…');

    await act(async () => {
      resolve();
    });
  });

  it('changes button state to success after asynchronous onClick is resolved', async () => {
    let resolve: () => void;
    const onClick = () =>
      new Promise<void>((res) => {
        resolve = res;
      });

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    const button2 = screen.getByRole('button');
    expect(button2).toHaveTextContent('Loading…');

    await act(async () => {
      resolve();
    });

    const button3 = screen.getByRole('button');
    expect(button3).toHaveTextContent('Success!');
  });

  it('changes button state to default after refresh timeout has passed', async () => {
    let resolve: () => void;
    const onClick = () =>
      new Promise<void>((res) => {
        resolve = res;
      });

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    const button2 = screen.getByRole('button');
    expect(button2).toHaveTextContent('Loading…');

    await act(async () => {
      resolve();
    });

    const button3 = screen.getByRole('button');
    expect(button3).toHaveTextContent('Success!');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const button4 = screen.getByRole('button');
    expect(button4).toHaveTextContent('Success!');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const button5 = screen.getByRole('button');
    expect(button5).toHaveTextContent('Click me');
  });

  it('should allow button props to be passed by default', () => {
    // @ts-expect-no-error
    <AsyncButton {...defaultProps} type="submit" />;
  });

  it('should allow button props to be passed given as="button"', () => {
    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as="button" disabled />;
  });

  it('should not allow link props to be passed given as="button"', () => {
    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} as="button" href="https://example.com" />;

    // Sanity check
    // @ts-expect-error-next-line
    <button href="https://example.com"></button>;
  });

  it('should allow link props to be passed given as="a"', () => {
    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as="a" href="https://example.com" />;
  });

  it('should not allow button props to be passed given as="a"', () => {
    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} as="a" disabled href="https://example.com" />;

    // Sanity check
    // @ts-expect-error-next-line
    <a disabled href="https://example.com">
      Click me
    </a>;
  });

  it('should not allow button props to be passed given as={MyButton}', () => {
    function MyButton() {
      return <button type="submit"></button>;
    }

    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} as={MyButton} type="submit" />;

    // Sanity check
    function MyCustomComponent({ as, ...otherProps }: { as: React.ElementType }) {
      const Component = as || 'div';
      return <Component {...otherProps} />;
    }

    // @ts-expect-error-next-line
    <MyCustomComponent as={MyButton} type="submit" />;
  });

  it('should not allow invalid values for as', () => {
    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} as={5} type="submit" />;

    // Sanity check
    function MyCustomComponent({ as }: { as: React.ElementType }) {
      const Component = as || 'div';
      return <Component />;
    }

    // @ts-expect-error-next-line
    <MyCustomComponent as={5} />;
  });

  it('should allow sync HTMLButtonElement event handlers to be passed by default', () => {
    function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} onClick={onClick} />;
  });

  it('should allow async HTMLButtonElement event handlers to be passed by default', () => {
    async function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} onClick={onClick} />;
  });

  it('should not allow HTMLAnchorElement event handlers to be passed by default', () => {
    function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
    }

    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} onClick={onClick} />;
  });

  it('should allow sync HTMLButtonElement event handlers to be passed given as="button"', () => {
    function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as="button" onClick={onClick} />;
  });

  it('should allow async HTMLButtonElement event handlers to be passed given as="button"', () => {
    async function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as="button" onClick={onClick} />;
  });

  it('should not allow HTMLAnchorElement event handlers to be passed given as="button"', () => {
    function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
    }

    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} as="button" onClick={onClick} />;

    // Sanity check
    // @ts-expect-error-next-line
    <button onClick={onClick}></button>;
  });

  it('should allow sync HTMLAnchorElement event handlers to be passed given as="a"', () => {
    function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as="a" onClick={onClick} />;
  });

  it('should allow async HTMLAnchorElement event handlers to be passed given as="a"', () => {
    async function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as="a" onClick={onClick} />;
  });

  it('should not allow HTMLButtonElement event handlers to be passed given as="a"', () => {
    function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} as="a" onClick={onClick} />;

    // Sanity check
    // @ts-expect-error-next-line
    <a href="https://example.com" onClick={onClick}>
      Click me
    </a>;
  });

  it('should allow sync HTMLButtonElement event handlers to be passed given as={MyButton} that handles onClick', () => {
    function MyButton({
      onClick,
    }: {
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    }) {
      return <button onClick={onClick} type="submit"></button>;
    }

    function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as={MyButton} onClick={onClick} />;
  });

  it('should allow async HTMLButtonElement event handlers to be passed given as={MyButton} that handles onClick', () => {
    function MyButton({
      onClick,
    }: {
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    }) {
      return <button onClick={onClick} type="submit"></button>;
    }

    async function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as={MyButton} onClick={onClick} />;
  });

  it('should allow HTMLAnchorElement event handlers to be passed given as={MyAnchor} that handles onClick', () => {
    function MyAnchor({
      onClick,
    }: {
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    }) {
      return (
        <a href="https://example.com" onClick={onClick}>
          Click me
        </a>
      );
    }

    function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
    }

    // @ts-expect-no-error
    <AsyncButton {...defaultProps} as={MyAnchor} onClick={onClick} />;
  });

  it('should not allow event handlers to be passed given as={MyButton} that does not handle onClick', () => {
    function MyAnchor() {
      return <a href="https://example.com">Click me</a>;
    }

    function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
    }

    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} as={MyAnchor} onClick={onClick} />;

    // Sanity check
    // @ts-expect-error-next-line
    <MyAnchor onClick={onClick} />;
  });
});
