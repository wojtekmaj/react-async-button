import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';

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
    const component = shallow(
      <AsyncButton {...defaultProps} />,
    );

    expect(component.find('button')).toHaveLength(1);
  });

  it('calls onClick properly', () => {
    const onClick = jest.fn();

    const component = shallow(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = component.find('button');

    const mockEvent = {};
    button.simulate('click', mockEvent);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(mockEvent);
  });

  it('changes button state to success on click if onClick is synchronous', () => {
    const onClick = jest.fn();

    const component = mount(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = component.find('button');

    button.simulate('click');

    expect(button.text()).toBe('Success!');
  });

  it('changes button state to default after refresh timeout has passed', () => {
    const onClick = jest.fn();

    const component = mount(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = component.find('button');

    button.simulate('click');

    const button2 = component.find('button');
    expect(button2.text()).toBe('Success!');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    component.update();

    const button3 = component.find('button');
    expect(button3.text()).toBe('Success!');

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    component.update();

    const button4 = component.find('button');
    expect(button4.text()).toBe('Click me');
  });

  it('changes button state to pending on click if onClick is asynchronous', async () => {
    const onClick = jest.fn();
    onClick.mockImplementation(async () => {});

    const component = mount(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = component.find('button');

    button.simulate('click');

    const button2 = component.find('button');
    expect(button2.text()).toBe('Loading…');

    await act(async () => {
      await waitForAsyncFakeTimers();
    });
  });

  it('changes button state to success after asynchronous onClick is resolved', async () => {
    const onClick = jest.fn();
    onClick.mockImplementation(async () => {});

    const component = mount(
      <AsyncButton
        {...defaultProps}
        onClick={onClick}
      />,
    );

    const button = component.find('button');

    button.simulate('click');

    const button2 = component.find('button');
    expect(button2.text()).toBe('Loading…');

    await act(async () => {
      await waitForAsyncFakeTimers();
    });

    const button3 = component.find('button');
    expect(button3.text()).toBe('Success!');
  });
});
