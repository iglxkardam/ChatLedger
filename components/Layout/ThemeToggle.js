import { FiMoon, FiSun } from 'react-icons/fi';
import useTheme from '../../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-3"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;
