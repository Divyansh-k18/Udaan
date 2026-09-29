// src/config/shortcuts.js

/*
  Central keyboard shortcut configuration for Udaan.

  IMPORTANT:
  We use event.code instead of event.key.

  Example:
  Alt + N => event.code === "KeyN"

  Keeping shortcuts here means we can change them later
  without searching through every page/component.
*/

export const SHORTCUT_ACTIONS = {
  NEXT: "next",
  PREVIOUS: "previous",
  REPEAT: "repeat",
  TIME_LEFT: "timeLeft",
  MARK: "mark",
  HELP: "help",
  LISTEN: "listen",
  LANGUAGE: "language",
  SUBMIT: "submit",
  GO_TO: "goTo",
  SECTION_STATUS: "sectionStatus",
  BOOKMARK: "bookmark",
  EXPLAIN: "explain",

  OPTION_1: "option1",
  OPTION_2: "option2",
  OPTION_3: "option3",
  OPTION_4: "option4",

  ESCAPE: "escape",
};

/*
  Keyboard shortcuts.

  event.code values:
  KeyN
  KeyP
  Digit1
  Escape
  etc.
*/
export const SHORTCUTS = {
  KeyN: {
    action: SHORTCUT_ACTIONS.NEXT,
    label: "Next question",
    display: "Alt + N",
  },

  KeyP: {
    action: SHORTCUT_ACTIONS.PREVIOUS,
    label: "Previous question",
    display: "Alt + P",
  },

  KeyR: {
    action: SHORTCUT_ACTIONS.REPEAT,
    label: "Repeat question",
    display: "Alt + R",
  },

  KeyT: {
    action: SHORTCUT_ACTIONS.TIME_LEFT,
    label: "Time remaining",
    display: "Alt + T",
  },

  KeyM: {
    action: SHORTCUT_ACTIONS.MARK,
    label: "Mark question",
    display: "Alt + M",
  },

  KeyH: {
    action: SHORTCUT_ACTIONS.HELP,
    label: "Open help",
    display: "Alt + H",
  },

  KeyV: {
    action: SHORTCUT_ACTIONS.LISTEN,
    label: "Start voice listening",
    display: "Alt + V",
  },

  KeyL: {
    action: SHORTCUT_ACTIONS.LANGUAGE,
    label: "Change language",
    display: "Alt + L",
  },

  KeyS: {
    action: SHORTCUT_ACTIONS.SUBMIT,
    label: "Submit exam",
    display: "Alt + S",
  },

  KeyG: {
    action: SHORTCUT_ACTIONS.GO_TO,
    label: "Go to question",
    display: "Alt + G",
  },

  KeyC: {
    action: SHORTCUT_ACTIONS.SECTION_STATUS,
    label: "Section status",
    display: "Alt + C",
  },

  KeyB: {
    action: SHORTCUT_ACTIONS.BOOKMARK,
    label: "Bookmark question",
    display: "Alt + B",
  },

  KeyE: {
    action: SHORTCUT_ACTIONS.EXPLAIN,
    label: "Explain again",
    display: "Alt + E",
  },

  Digit1: {
    action: SHORTCUT_ACTIONS.OPTION_1,
    label: "Select option 1",
    display: "Alt + 1",
  },

  Digit2: {
    action: SHORTCUT_ACTIONS.OPTION_2,
    label: "Select option 2",
    display: "Alt + 2",
  },

  Digit3: {
    action: SHORTCUT_ACTIONS.OPTION_3,
    label: "Select option 3",
    display: "Alt + 3",
  },

  Digit4: {
    action: SHORTCUT_ACTIONS.OPTION_4,
    label: "Select option 4",
    display: "Alt + 4",
  },
};

/*
  Useful later for HelpDialog.jsx.

  Example:
  SHORTCUT_LIST.map(...)
*/
export const SHORTCUT_LIST = Object.values(SHORTCUTS);