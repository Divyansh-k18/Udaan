// src/hooks/useShortcuts.js

import { useEffect, useRef } from "react";
import {
  SHORTCUTS,
  SHORTCUT_ACTIONS,
} from "../config/shortcuts.js";

/*
  Returns true when the user is currently typing.

  We do NOT want shortcuts such as Alt + N or Alt + S
  interfering with text fields.
*/
function isTypingElement(element) {
  if (!element) {
    return false;
  }

  const tagName = element.tagName?.toLowerCase();

  if (tagName === "input") {
    return true;
  }

  if (tagName === "textarea") {
    return true;
  }

  if (tagName === "select") {
    return true;
  }

  if (element.isContentEditable) {
    return true;
  }

  return false;
}

/*
  useShortcuts()

  Pass functions for only the shortcuts that the current page needs.

  Example:

  useShortcuts({
    next: handleNext,
    previous: handlePrevious,
    repeat: handleRepeat,
    option1: () => selectOption(0),
  });

  Missing handlers are simply ignored.
*/
export default function useShortcuts(handlers = {}, options = {}) {
  const handlersRef = useRef(handlers);

  /*
    Keep the latest handlers without constantly removing
    and re-adding the keyboard event listener.
  */
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const {
    enabled = true,

    /*
      Escape can stop speech and/or close a dialog.

      It is intentionally allowed even when the user
      is currently focused on an input or textarea.
    */
    onEscape,
  } = options;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    function handleKeyDown(event) {
      /*
        -------------------------------
        ESCAPE
        -------------------------------

        Escape does NOT require Alt.

        It also works while the user is typing because
        stopping speech / closing dialogs should always
        remain accessible.
      */
      if (event.code === "Escape") {
        const escapeHandler =
          onEscape ||
          handlersRef.current?.[SHORTCUT_ACTIONS.ESCAPE];

        if (typeof escapeHandler === "function") {
          event.preventDefault();
          escapeHandler(event);
        }

        return;
      }

      /*
        Ignore exam shortcuts while typing in:

        input
        textarea
        select
        contenteditable
      */
      if (isTypingElement(event.target)) {
        return;
      }

      /*
        Every normal Udaan shortcut requires Alt.
      */
      if (!event.altKey) {
        return;
      }

      /*
        We use event.code here, NOT event.key.

        Example:
        event.code === "KeyN"
      */
      const shortcut = SHORTCUTS[event.code];

      if (!shortcut) {
        return;
      }

      const handler =
        handlersRef.current?.[shortcut.action];

      /*
        If the current page does not implement this
        shortcut, do nothing.

        This means the same hook can safely be used
        on Dashboard, Prepare, Exam, etc.
      */
      if (typeof handler !== "function") {
        return;
      }

      /*
        Prevent browser/default behaviour only when
        Udaan actually handles the shortcut.
      */
      event.preventDefault();

      handler(event);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [enabled, onEscape]);
}