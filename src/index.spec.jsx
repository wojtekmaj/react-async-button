import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AsyncButton from './index';

import { waitForAsyncFakeTimers } from '../test-utils';

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

  it('renders button properly', () => {
    render(
      <AsyncButton {...defaultProps} />,
    );

    expect(screen.queryByRole('button')).toBeInTheDocument();
  });

  it('calls onClick properly', () => {
    const onClick = jest.fn();

    render(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button');

    userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(expect.any(Object));
  });

  it('changes button state to success on click if onClick is synchronous', () => {
    const onClick = jest.fn();

    render(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button');

    userEvent.click(button);

    expect(button).toHaveTextContent('Success!');
  });

  it('changes button state to default after refresh timeout has passed', () => {
    const onClick = jest.fn();

    render(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button');

    userEvent.click(button);

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
    const onClick = jest.fn();
    onClick.mockImplementation(async () => {});

    render(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button');

    userEvent.click(button);

    const button2 = screen.getByRole('button');
    expect(button2).toHaveTextContent('Loading…');

    await act(waitForAsyncFakeTimers);
  });

  it('changes button state to success after asynchronous onClick is resolved', async () => {
    const onClick = jest.fn();
    onClick.mockImplementation(async () => {});

    render(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = screen.getByRole('button');

    userEvent.click(button);

    const button2 = screen.getByRole('button');
    expect(button2).toHaveTextContent('Loading…');

    await act(waitForAsyncFakeTimers);

    const button3 = screen.getByRole('button');
    expect(button3).toHaveTextContent('Success!');
  });
});
