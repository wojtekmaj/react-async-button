import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AsyncButton from './index';

jest.useFakeTimers();

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
  };

  let user;
  beforeEach(() => {
    user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    });
  });

  it('renders button properly', () => {
    render(<AsyncButton {...defaultProps} />);

    expect(screen.queryByRole('button')).toBeInTheDocument();
  });

  it('passes ref correctly', () => {
    const ref = React.createRef();

    render(<AsyncButton {...defaultProps} ref={ref} />);

    const button = screen.getByRole('button');

    expect(ref.current).toBe(button);
  });

  it('calls onClick properly', async () => {
    const onClick = jest.fn();

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(expect.any(Object));
  });

  it('changes button state to success on click if onClick is synchronous', async () => {
    const onClick = () => {};

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    expect(button).toHaveTextContent('Success!');
  });

  it('changes button state to default after refresh timeout has passed', async () => {
    const onClick = () => {};

    render(<AsyncButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');

    await user.click(button);

    const button2 = screen.getByRole('button');
    expect(button2).toHaveTextContent('Success!');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const button3 = screen.getByRole('button');
    expect(button3).toHaveTextContent('Success!');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const button4 = screen.getByRole('button');
    expect(button4).toHaveTextContent('Click me');
  });

  it('changes button state to pending on click if onClick is asynchronous', async () => {
    let resolve;
    const onClick = () =>
      new Promise((res) => {
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
    let resolve;
    const onClick = () =>
      new Promise((res) => {
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
});
