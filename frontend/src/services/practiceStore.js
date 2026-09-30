import { storage } from "./storage.js";
const STATS_KEY = "udaan_practice_stats_v1";
const BOOKMARKS_KEY = "udaan_practice_bookmarks_v1";

function readJson(key, fallback) {
  try {
    const saved = storage.getItem(key);

    if (!saved) {
      return fallback;
    }

    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Could not save practice data:", error);
  }
}

/*
  Save one answered attempt.

  Skipped questions should NOT call this function.
*/
export function recordPracticeAttempt({
  examId,
  subject,
  topic,
  correct,
}) {
  if (!examId || !subject || !topic) {
    return;
  }

  const stats = readJson(STATS_KEY, {});

  if (!stats[examId]) {
    stats[examId] = {};
  }

  if (!stats[examId][subject]) {
    stats[examId][subject] = {};
  }

  if (!stats[examId][subject][topic]) {
    stats[examId][subject][topic] = {
      attempted: 0,
      correct: 0,
      lastPractisedAt: null,
    };
  }

  const topicStats = stats[examId][subject][topic];

  topicStats.attempted += 1;

  if (correct) {
    topicStats.correct += 1;
  }

  topicStats.lastPractisedAt = new Date().toISOString();

  writeJson(STATS_KEY, stats);
}

/*
  Get stats for one topic.
*/
export function getTopicStats(examId, subject, topic) {
  const stats = readJson(STATS_KEY, {});

  const saved = stats?.[examId]?.[subject]?.[topic];

  if (!saved) {
    return {
      attempted: 0,
      correct: 0,
      accuracy: 0,
    };
  }

  const accuracy =
    saved.attempted > 0
      ? Math.round((saved.correct / saved.attempted) * 100)
      : 0;

  return {
    ...saved,
    accuracy,
  };
}

/*
  Return all topic stats for one subject.
*/
export function getSubjectStats(examId, subject) {
  const stats = readJson(STATS_KEY, {});

  const subjectStats = stats?.[examId]?.[subject] || {};

  return Object.entries(subjectStats).map(([topic, value]) => {
    const attempted = value.attempted || 0;
    const correct = value.correct || 0;

    return {
      topic,
      attempted,
      correct,
      accuracy:
        attempted > 0
          ? Math.round((correct / attempted) * 100)
          : 0,
    };
  });
}

/*
  Weak topic = lowest accuracy among topics
  the student has actually attempted.
*/
export function getWeakTopic(examId, subject) {
  const topics = getSubjectStats(examId, subject)
    .filter((item) => item.attempted > 0)
    .sort((a, b) => {
      if (a.accuracy !== b.accuracy) {
        return a.accuracy - b.accuracy;
      }

      return b.attempted - a.attempted;
    });

  return topics[0] || null;
}

/*
  Bookmarks are stored separately from practice scores.
*/
export function getBookmarks() {
  return readJson(BOOKMARKS_KEY, []);
}

export function isBookmarked(questionId) {
  return getBookmarks().includes(questionId);
}

export function setBookmark(questionId, shouldBookmark = true) {
  const bookmarks = new Set(getBookmarks());

  if (shouldBookmark) {
    bookmarks.add(questionId);
  } else {
    bookmarks.delete(questionId);
  }

  const updated = Array.from(bookmarks);

  writeJson(BOOKMARKS_KEY, updated);

  return updated;
}