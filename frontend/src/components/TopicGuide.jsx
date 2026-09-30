import { topicGuides } from '../data/topicGuides';

export default function TopicGuide({ subject, topic, questions }) {
  const guide = topicGuides[`${subject}/${topic}`];
  if (!guide) return null;
  const count = questions.filter(question => question.subject === subject && question.topic === topic).length;
  return <section className="prepare-message" aria-labelledby="topic-guide-title" lang="en">
    <h2 id="topic-guide-title">{topic}: quick study guide</h2>
    <p><strong>{count} practice questions</strong> available. New questions and study notes are in English; existing translations remain available.</p>
    <p><strong>Key idea:</strong> {guide.concept}</p>
    <p><strong>Worked example:</strong> {guide.example}</p>
    <p><strong>Common mistake:</strong> {guide.pitfall}</p>
  </section>;
}
