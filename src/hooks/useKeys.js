import {useEventListener} from './useEventListener';
import {useState} from 'react';

export let pressedKeys = {};

export const useKeyHandlers = (element=window) => {
  useEventListener('keydown', ({key}) => {
    if (pressedKeys[key]) return;
    pressedKeys[key] = true;
  }, element);

  useEventListener('keyup', ({key}) => {
    pressedKeys[key] = false;
  }, element);

  useEventListener('blur', (e) => {
    pressedKeys = {};
  });
};

export const useKeyPress = (watchKey, handler, element) => {
  useEventListener('keyup', ({key}) => {
    if (pressedKeys['Control'] || pressedKeys['Shift']) return;
    const focusedTag = document.activeElement.tagName;
    if (focusedTag === 'INPUT' || focusedTag === 'TEXTAREA') return;
    if (key === watchKey) handler();
  }, element);
};

export const useCtrlKeyPress = (watchKey, handler, element) => {
  useEventListener('keydown', (e) => {
    if (pressedKeys['Control'] && e.key === watchKey) handler(e);
  }, element);
};

export const useShiftKeyPress = (watchKey, handler, element) => {
  useEventListener('keydown', (e) => {
    if (pressedKeys['Shift'] && e.key === watchKey) handler(e);
  }, element);
};

export const useKeyPressed = (key) => {
  return pressedKeys[key];
};

export const useKeyPressedNew = (watchKey) => {
  const [pressed, setPressed] = useState(false);
  useEventListener('keydown', ({key}) => {
    if (key === watchKey) {
      setPressed(true);
    }
  });
  useEventListener('keyup', ({key}) => {
    if (key === watchKey) {
      setPressed(false);
    }
  });
  return pressed;
};
