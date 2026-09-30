import { Icon, BrandMark } from "./Visuals";
import { useEffect, useRef } from "react";
import { NavLink, Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import HelpDialog from "./HelpDialog";
import VoiceStatus from "./VoiceStatus";
import AccessibilityToolbar from "./AccessibilityToolbar";
import { stopSpeaking } from "../services/speech";
import "../styles/components.css";

export default function Layout() {
  const mainRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const heading = mainRef.current?.querySelector('h1');
    document.title = `${heading?.textContent || 'Learning space'} | Udaan`;
    heading?.setAttribute('tabindex', '-1');
    (heading || mainRef.current)?.focus();
    const observer = new MutationObserver(() => {
      const title = mainRef.current?.querySelector('h1')?.textContent;
      if (title) document.title = `${title} | Udaan`;
    });
    observer.observe(mainRef.current, { childList: true, subtree: true, characterData: true });
    return () => { observer.disconnect(); stopSpeaking(); };
  }, [location.pathname]);

  function handleCommand(command) {
    const id = command.command || command.id;
    if (/^\/(exam|prepare)\//.test(location.pathname)) return;
    const routes = { PROGRESS: '/progress', SETTINGS: '/setup?edit=1', PRACTICE: '/exams', START_EXAM: '/exams' };
    if (routes[id]) navigate(routes[id]);
    if (id === 'STOP') stopSpeaking();
    if (id === 'HELP') window.dispatchEvent(new Event('udaan:open-help'));
  }
  return <div className="app-layout">
    
    <header className="app-header">
      <div className="app-brand-area">
        <Link to="/dashboard" className="app-brand" aria-label="Udaan dashboard"><BrandMark /> Udaan</Link>
        <p className="app-tagline">A little practice. A bigger future.</p>
      </div>
      <div className="app-header-actions"><VoiceStatus onCommand={handleCommand} /><HelpDialog /></div>
    </header>
    <div className="navigation-bar"><nav aria-label="Main navigation">
      <NavLink to="/dashboard"><Icon name="home" />Dashboard</NavLink><NavLink to="/exams"><Icon name="book" />Exams</NavLink>
      <NavLink to="/progress"><Icon name="chart" />Progress</NavLink><NavLink to="/setup?edit=1"><Icon name="settings" />Settings</NavLink>
    </nav><span className="demo-label">Practice demo</span></div>
    <div className="reading-bar"><AccessibilityToolbar /></div>
    <main ref={mainRef} id="main-content" className="app-main" tabIndex={-1}><Outlet /></main>
    <footer className="app-footer">Udaan · Learn with confidence. <Link to="/voice-check">Check voice support</Link></footer>
  </div>;
}
