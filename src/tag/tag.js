/*
Copyright (c) 2018-2020 Uber Technologies, Inc.

This source code is licensed under the MIT license found in the
LICENSE file in the root directory of this source tree.
*/
// @flow
import * as React from 'react';
import {getOverrides} from '../helpers/overrides.js';
import {
  Action as StyledAction,
  Root as StyledRoot,
  ActionIcon as StyledActionIcon,
  Text as StyledText,
} from './styled-components.js';
import {KIND, VARIANT} from './constants.js';
import {getTextFromChildren} from './utils.js';
import type {PropsT, SharedPropsArgT} from './types.js';
import {isFocusVisible, forkFocus, forkBlur} from '../utils/focusVisible.js';

const Tag = React.forwardRef<PropsT, HTMLSpanElement>((props, ref) => {
  const {
    children,
    closeable = true,
    color,
    disabled = false,
    isFocused = false,
    isHovered = false,
    kind = KIND.primary,
    onActionClick = event => {},
    onActionKeyDown = event => {},
    onClick = null,
    onKeyDown = null,
    overrides = {},
    title,
    variant = VARIANT.light,
  } = props;
  const [focusVisible, setFocusVisible] = React.useState(false);

  function handleFocus(event: SyntheticEvent<>) {
    if (isFocusVisible(event)) {
      setFocusVisible(true);
    }
  }

  function handleBlur(event: SyntheticEvent<>) {
    if (focusVisible !== false) {
      setFocusVisible(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.currentTarget !== event.target) {
      return;
    }
    const key = event.key;
    if (onClick && key === 'Enter') {
      onClick(event);
    }
    if (closeable && (key === 'Backspace' || key === 'Delete')) {
      onActionClick(event);
      onActionKeyDown(event);
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  }

  const [Root, rootProps] = getOverrides(overrides.Root, StyledRoot);
  const [Action, actionProps] = getOverrides(overrides.Action, StyledAction);
  const [ActionIcon, actionIconProps] = getOverrides(
    overrides.ActionIcon,
    StyledActionIcon,
  );
  const [Text, textProps] = getOverrides(overrides.Text, StyledText);
  const clickable = typeof onClick === 'function';
  const rootHandlers = disabled
    ? {}
    : {
        onClick: onClick,
        onKeyDown: handleKeyDown,
      };
  const actionHandlers = disabled
    ? {}
    : {
        onClick: event => {
          // we don't want onClick to be called when the close icon is clicked
          event.stopPropagation();
          onActionClick(event);
        },
      };
  const sharedProps: SharedPropsArgT = {
    $clickable: clickable,
    $closeable: closeable,
    $color: color,
    $disabled: disabled,
    $isFocused: isFocused,
    $isHovered: isHovered,
    $kind: kind,
    $variant: variant,
    $isFocusVisible: focusVisible,
  };
  const titleText = title || getTextFromChildren(children);
  const isButton = (clickable || closeable) && !disabled;
  return (
    <Root
      // eslint-disable-next-line flowtype/no-weak-types
      ref={(ref: any)}
      data-baseweb="tag"
      aria-label={
        isButton && closeable
          ? `${
              typeof children === 'string' ? `${children}, ` : ''
            }close by backspace`
          : null
      }
      aria-disabled={disabled ? true : null}
      role={isButton ? 'button' : null}
      tabIndex={isButton ? 0 : null}
      {...rootHandlers}
      {...sharedProps}
      {...rootProps}
      onFocus={forkFocus(rootProps, handleFocus)}
      onBlur={forkBlur(rootProps, handleBlur)}
    >
      <Text title={titleText} {...textProps}>
        {children}
      </Text>
      {closeable ? (
        <Action
          aria-hidden={true}
          role="presentation"
          {...actionHandlers}
          {...sharedProps}
          {...actionProps}
        >
          <ActionIcon
            width={'10'}
            height={'10'}
            viewBox={'0 0 8 8'}
            fill={'none'}
            xmlns={'http://www.w3.org/2000/svg'}
            {...actionIconProps}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0.861278 0.862254C1.12163 0.601905 1.54374 0.601905 1.80409 0.862254L3.99935 3.05752L6.19461 0.862254C6.45496 0.601905 6.87707 0.601905 7.13742 0.862254C7.39777 1.1226 7.39777 1.54471 7.13742 1.80506L4.94216 4.00033L7.13742 6.19559C7.39777 6.45594 7.39777 6.87805 7.13742 7.1384C6.87707 7.39875 6.45496 7.39875 6.19461 7.1384L3.99935 4.94313L1.80409 7.1384C1.54374 7.39875 1.12163 7.39875 0.861278 7.1384C0.600928 6.87805 0.600928 6.45594 0.861278 6.19559L3.05654 4.00033L0.861278 1.80506C0.600928 1.54471 0.600928 1.1226 0.861278 0.862254Z"
              fill="currentColor"
            />
          </ActionIcon>
        </Action>
      ) : null}
    </Root>
  );
});
Tag.displayName = 'Tag';

export default Tag;
