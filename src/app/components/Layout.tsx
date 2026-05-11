import { Menu, Home, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={toggleMenu}
            className="text-gray-600 hover:text-gray-900 transition-colors z-50 relative"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/" className="text-gray-600 hover:text-gray-900" onClick={closeMenu}>
            <Home className="w-6 h-6" />
          </Link>
        </div>
      </header>

      {/* Side Navigation */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
            <button
              onClick={closeMenu}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="py-4">
            <Link
              to="/"
              onClick={closeMenu}
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/user-guide"
              onClick={closeMenu}
              className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              User Guide
            </Link>
          </nav>
        </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-6 md:pb-8">
        {children}
      </main>

      <footer className="bg-gray-900 text-white py-6 md:py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="space-y-2 mb-4">
            <Link to="/" className="block hover:text-gray-300 text-sm md:text-base transition-colors">
              Home
            </Link>
            <Link to="/about" className="block hover:text-gray-300 text-sm md:text-base transition-colors">
              About Us
            </Link>
            <Link to="/user-guide" className="block hover:text-gray-300 text-sm md:text-base transition-colors">
              User Guide
            </Link>
          </div>
          <div className="text-center text-gray-400 text-sm border-t border-gray-700 pt-4">
            @hawn 2025
          </div>
        </div>
      </footer>
    </div>
  );
}
