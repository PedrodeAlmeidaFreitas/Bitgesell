import { useTheme } from '../state/ThemeContext';

function ThemeSwitch() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      className="theme-switch" 
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <div className="theme-switch-track">
        <div className="theme-switch-thumb">
          {theme === 'light' ? '☀️' : '🌙'}
        </div>
      </div>
    </button>
  );
}

export default ThemeSwitch;
