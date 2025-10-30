import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { createRef } from 'react';

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

  it('renders button properly', async () => {
    await render(<AsyncButton {...defaultProps} />);

    expect(page.getByRole('button')).toBeInTheDocument();
  });

  it('passes ref correctly', async () => {
    const ref = createRef<HTMLButtonElement>();

    await render(<AsyncButton {...defaultProps} ref={ref} />);

    const button = page.getByRole('button');

    expect(ref.current).toBe(button.element());
  });

  it('calls onClick properly', async () => {
    const onClick = vi.fn();

    await render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = page.getByRole('button');

    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(expect.any(Object));
  });

  it('changes button state to success on click if onClick is synchronous', async () => {
    const onClick = () => {
      // Intentionally empty
    };

    await render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = page.getByRole('button');

    await userEvent.click(button);

    const button2 = page.getByRole('button');
    expect(button2).toHaveTextContent('Success!');
  });

  it('changes button state to default after refresh timeout has passed', async () => {
    const onClick = () => {
      // Intentionally empty
    };

    await render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = page.getByRole('button');

    await userEvent.click(button);

    await expect.element(button).toHaveTextContent('Success!');

    vi.advanceTimersByTime(1000);

    await expect.element(button).toHaveTextContent('Success!');

    vi.advanceTimersByTime(1000);

    await expect.element(button).toHaveTextContent('Click me');
  });

  it('changes button state to pending on click if onClick is asynchronous', async () => {
    const onClick = () =>
      new Promise<void>(() => {
        // Intentionally empty
      });

    await render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = page.getByRole('button');

    await userEvent.click(button);

    await expect.element(button).toHaveTextContent('Loading…');
  });

  it('changes button state to success after asynchronous onClick is resolved', async () => {
    let resolve: (() => void) | undefined;
    const onClick = () =>
      new Promise<void>((res) => {
        resolve = res;
      });

    await render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = page.getByRole('button');

    await userEvent.click(button);

    await expect.element(button).toHaveTextContent('Loading…');

    resolve?.();

    await expect.element(button).toHaveTextContent('Success!');
  });

  it('changes button state to default after refresh timeout has passed', async () => {
    let resolve: (() => void) | undefined;
    const onClick = () =>
      new Promise<void>((res) => {
        resolve = res;
      });

    await render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = page.getByRole('button');

    await userEvent.click(button);

    await expect.element(button).toHaveTextContent('Loading…');

    resolve?.();

    await expect.element(button).toHaveTextContent('Success!');

    vi.advanceTimersByTime(1000);

    await expect.element(button).toHaveTextContent('Success!');

    vi.advanceTimersByTime(1000);

    await expect.element(button).toHaveTextContent('Click me');
  });

  it('should allow button props to be passed by default', () => {
    <AsyncButton {...defaultProps} type="submit" />;
  });

  it('should allow button props to be passed given as="button"', () => {
    <AsyncButton {...defaultProps} as="button" disabled />;
  });

  it('should not allow link props to be passed given as="button"', () => {
    // @ts-expect-error-next-line
    <AsyncButton {...defaultProps} as="button" href="https://example.com" />;

    // Sanity check
    // @ts-expect-error-next-line
    <button href="https://example.com" type="submit" />;
  });

  it('should allow link props to be passed given as="a"', () => {
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
      return <button type="submit" />;
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

    <AsyncButton {...defaultProps} onClick={onClick} />;
  });

  it('should allow async HTMLButtonElement event handlers to be passed by default', () => {
    async function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

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

    <AsyncButton {...defaultProps} as="button" onClick={onClick} />;
  });

  it('should allow async HTMLButtonElement event handlers to be passed given as="button"', () => {
    async function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

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
    <button onClick={onClick} type="submit" />;
  });

  it('should allow sync HTMLAnchorElement event handlers to be passed given as="a"', () => {
    function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
    }

    <AsyncButton {...defaultProps} as="a" onClick={onClick} />;
  });

  it('should allow async HTMLAnchorElement event handlers to be passed given as="a"', () => {
    async function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
      event.preventDefault();
    }

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
      return <button onClick={onClick} type="submit" />;
    }

    function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

    <AsyncButton {...defaultProps} as={MyButton} onClick={onClick} />;
  });

  it('should allow async HTMLButtonElement event handlers to be passed given as={MyButton} that handles onClick', () => {
    function MyButton({
      onClick,
    }: {
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    }) {
      return <button onClick={onClick} type="submit" />;
    }

    async function onClick(event: React.MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
    }

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
