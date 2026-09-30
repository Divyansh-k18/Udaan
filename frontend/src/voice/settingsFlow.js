// src/voice/settingsFlow.js

/**
 * Voice setting chooser.
 *
 * Holds the "waiting for a value" state for a voice-settable
 * preference and broadcasts what happened, so any page can start
 * a choice and the single chooser UI in Layout can render it.
 *
 * It never touches React or the accessibility context itself.
 * Applying the value is left to the chooser component, which is
 * the only place that decides whether speech is allowed.
 *
 * IMPORTANT:
 * Voice commands must always have keyboard/button alternatives.
 */

import {
  SETTING_COMMANDS,
  getSetting,
  settingChoices,
  settingLabel,
  settingPrompt,
  matchSettingValue,
} from "./settingsCommands.js";

let pendingSettingId = null;

function emit(type, detail) {
  if (typeof window !== "undefined" && window.dispatchEvent) {
    window.dispatchEvent(
      new CustomEvent(`udaan:voice-setting-${type}`, { detail }),
    );
  }
}

export function getPendingSetting() {
  return pendingSettingId;
}

export function isWaitingForSettingValue() {
  return pendingSettingId !== null;
}

/**
 * Step 1: the user named a setting, so ask which value.
 */
export function beginSettingChoice(settingId, langCode = "en-IN") {
  const setting = getSetting(settingId);

  if (!setting) {
    return false;
  }

  const prompt = settingPrompt(settingId, langCode);

  pendingSettingId = settingId;

  emit("pending", {
    settingId,
    label: settingLabel(settingId, langCode),
    prompt,
    choices: settingChoices(settingId),
  });
  emit("prompt", { text: prompt, settingId });

  return true;
}

export function cancelSettingChoice(reason = "cancelled") {
  if (pendingSettingId === null) {
    return false;
  }

  const settingId = pendingSettingId;

  pendingSettingId = null;
  emit("settled", { settingId, reason });

  return true;
}

/**
 * Step 2, shared by speech and by clicking a chooser button.
 */
export function chooseSettingValue(settingId, value) {
  const setting = getSetting(settingId);

  if (!setting) {
    return false;
  }

  const choice = setting.choices.find(
    (item) => String(item.value) === String(value),
  );

  if (!choice) {
    return false;
  }

  if (pendingSettingId !== null) {
    pendingSettingId = null;
  }

  emit("apply", {
    key: setting.key,
    value: choice.value,
    label: choice.label,
  });
  emit("settled", { settingId: setting.key, reason: "applied" });

  return true;
}

/**
 * Feed a matched command into the chooser.
 *
 * Returns true when the chooser consumed the command, so callers
 * know not to also treat it as an exam or navigation command.
 */
export function handleSettingsCommand(command, langCode = "en-IN") {
  const commandId = command?.command || command?.id;

  if (!commandId) {
    return false;
  }

  if (commandId === SETTING_COMMANDS.SET_SETTING) {
    const requested = command.setting || command.settingId;

    if (requested && getSetting(requested)) {
      cancelSettingChoice("replaced");
      return beginSettingChoice(requested, langCode);
    }

    // No setting named, but a choice is already open: repeat it.
    if (pendingSettingId) {
      return beginSettingChoice(pendingSettingId, langCode);
    }

    return false;
  }

  if (commandId === SETTING_COMMANDS.SET_SETTING_VALUE) {
    // A pending choice is replaced rather than answered with a
    // value that belongs to a different setting.
    cancelSettingChoice("replaced");
    return chooseSettingValue(command.setting, command.value);
  }

  if (pendingSettingId === null) {
    return false;
  }

  if (commandId === "NO" || commandId === "STOP") {
    return cancelSettingChoice("cancelled");
  }

  // Any other command closes the chooser and is handled normally,
  // so the flow can never get stuck open.
  cancelSettingChoice("dismissed");

  return false;
}

/**
 * Used by the two-step flow when the transcript is matched against
 * a specific, currently open setting.
 */
export function matchPendingValue(transcript, langCode = "en-IN") {
  if (pendingSettingId === null) {
    return null;
  }

  return matchSettingValue(transcript, langCode, pendingSettingId);
}
