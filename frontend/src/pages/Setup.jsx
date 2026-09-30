import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrandMark, LearningIllustration } from '../components/Visuals';
import { useAccessibility } from '../context/AccessibilityContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { storage } from '../services/storage.js';
import { speak, stopSpeaking } from '../services/speech.js';
import { profiles, themes, textSizes } from '../services/accessibilityPreferences.js';
import '../styles/themes.css';

export default function Setup() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editing = params.get('edit') === '1';
  const { preferences, updatePreference, applyProfile, resetPreferences, announce } = useAccessibility();
  const { language, setLanguage, languages, t } = useLanguage();
  const [started, setStarted] = useState(() => editing || storage.getItem('udaan-setup-complete') === 'true' || storage.getItem('udaan-setup-started') === 'true');
  const headingRef = useRef(null);
  const startRef = useRef(null);
  useEffect(() => {
    document.title = 'Accessibility setup | Udaan';
    if (started) headingRef.current?.focus();
    else startRef.current?.focus();
  }, [started]);
  useEffect(() => {
    if (started || preferences.voiceMode !== 'udaan' || storage.getItem('udaan-welcome-spoken') === 'true') return;
    const timer = setTimeout(() => {
      storage.setItem('udaan-welcome-spoken', 'true');
      speak('Welcome to Udaan. Press Enter to start.', 'en-IN', preferences.speechRate);
    }, 300);
    return () => { clearTimeout(timer); stopSpeaking(); };
  }, [started, preferences.voiceMode, preferences.speechRate]);
  function start() {
    stopSpeaking();
    storage.setItem('udaan-setup-started', 'true');
    setStarted(true);
  }
  function submit(event) {
    event.preventDefault();
    stopSpeaking();
    storage.setItem('udaan-setup-complete', 'true');
    navigate(editing ? '/dashboard' : '/login');
  }
  if (!started) return <main id="main-content" className="setup-page" tabIndex={-1}>
    <section className="start-card landscape-welcome">
      <div className="welcome-copy">
        <p className="brand"><BrandMark /> Udaan</p><h1>{t('setup.welcome')}</h1>
        <p className="welcome-promise">Your ambition. Your pace.<br />Your way to learn.</p>
        <p>Choose the reading, display and voice support that works for you. You can change it at any time.</p>
        <p>{t('setup.instructions')}</p>
        <button ref={startRef} className="primary-button start-button" onClick={start}>Press Enter to start</button>
      </div><div className="welcome-art"><LearningIllustration /></div>
    </section>
  </main>;
  return <main id="main-content" className="setup-page">
    <form className="setup-card landscape-setup" onSubmit={submit}>
      <header className="setup-header"><p className="brand"><BrandMark /> Udaan</p>
        <p className="eyebrow">{t('setup.title')}</p>
        <h1 ref={headingRef} tabIndex={-1}>How would you like Udaan to work for you?</h1>
        <p>Start with a preset, then make it yours. No diagnosis or disability disclosure needed.</p>
      </header>
      <fieldset className="setup-section profile-section"><legend>Choose a starting profile</legend>
        <p>Presets are optional. Custom keeps your current choices.</p>
        <div className="option-grid">{profiles.map(profile => <label className="option-card" key={profile.id}>
          <input type="radio" name="profile" checked={preferences.profile === profile.id} onChange={() => applyProfile(profile.id)} />
          <span>{profile.label}{preferences.profile === profile.id && <small className="selected-label" aria-hidden="true">Selected</small>}</span>
        </label>)}</div>
      </fieldset>
      <fieldset className="setup-section"><legend>{t('language.title')}</legend>
        <label htmlFor="language-select">{t('language.description')}</label>
        <select id="language-select" className="setup-select" value={language} onChange={event => {
          setLanguage(event.target.value);
          announce(`${languages.find(item => item.code === event.target.value)?.name} selected.`);
        }}>{languages.map(item => <option key={item.code} value={item.code}>{item.nativeName}</option>)}</select>
      </fieldset>
      <fieldset className="setup-section"><legend>{t('setup.theme')}</legend>
        <label htmlFor="setup-theme">Theme</label>
        <select id="setup-theme" className="setup-select" value={preferences.theme} onChange={event => updatePreference('theme', event.target.value)}>
          {themes.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select><p>Selection and status also use text, symbols and borders.</p>
      </fieldset>
      <fieldset className="setup-section"><legend>Reading &amp; controls</legend>
        <label htmlFor="text-size">{t('setup.textSize')}</label>
        <select id="text-size" className="setup-select" value={preferences.textSize} onChange={event => updatePreference('textSize', Number(event.target.value))}>
          {Array.from(new Set([...textSizes, preferences.textSize])).sort((a,b) => a-b).map(size => <option key={size} value={size}>{size}%</option>)}
        </select>
        <label htmlFor="line-spacing">Line spacing</label>
        <select id="line-spacing" className="setup-select" value={preferences.lineSpacing} onChange={event => updatePreference('lineSpacing', Number(event.target.value))}>
          {[1.5, 1.65, 2, 2.5].map(size => <option key={size} value={size}>{size} ×</option>)}
        </select>
        {[['readingComfort','Reading comfort'], ['reducedMotion','Reduced motion'], ['largeControls','Large controls']].map(([key,label]) =>
          <label className="switch-row" key={key}><input type="checkbox" checked={preferences[key]} onChange={event => updatePreference(key,event.target.checked)} /><span>{label}</span></label>)}
      </fieldset>
      <fieldset className="setup-section"><legend>{t('setup.voiceMode')}</legend>
        <div className="option-grid">{[['udaan','voice.udaan'],['screen-reader','voice.screenReader'],['silent','voice.silent']].map(([id,key]) =>
          <label className="option-card" key={id}><input type="radio" name="voiceMode" checked={preferences.voiceMode === id} onChange={() => updatePreference('voiceMode',id)} /><span>{t(key)}</span></label>)}</div>
        <p>Screen Reader uses your assistive technology without Udaan narration. Silent turns off Udaan narration.</p>
        <label htmlFor="speech-rate">{t('setup.speechRate')}: {preferences.speechRate}×</label>
        <input id="speech-rate" type="range" min="0.5" max="2" step="0.1" value={preferences.speechRate} onChange={event => updatePreference('speechRate',Number(event.target.value))} />
      </fieldset>
      <details className="setup-section profile-section"><summary>More options: voice commands &amp; extra time</summary>
        <label className="switch-row"><input type="checkbox" checked={preferences.voiceCommands} onChange={event => updatePreference('voiceCommands',event.target.checked)} /><span>{t('setup.voiceCommands')}</span></label>
        <label htmlFor="extra-time">{t('setup.extraTime')}: {preferences.extraTimePercent}%</label>
        <input id="extra-time" type="range" min="0" max="100" step="5" value={preferences.extraTimePercent} onChange={event => updatePreference('extraTimePercent',Number(event.target.value))} />
      </details>
      <div className="setup-actions"><button type="button" className="secondary-button" onClick={resetPreferences}>Reset settings</button><button type="submit" className="primary-button">{t('setup.saveContinue')}</button></div>
    </form>
  </main>;
}
