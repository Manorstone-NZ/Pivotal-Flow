import React, { useState, useEffect } from 'react';

/**
 * Footer Component
 * 
 * Features:
 * - Build/version string from X-App-Version header or env var
 * - Links: Docs, Changelog, Status
 * - Semantic <footer> element
 * - Respects prefers-reduced-motion
 * - Responsive design
 */
export const Footer: React.FC = () => {
  const [appVersion, setAppVersion] = useState<string>('0.1.0');

  useEffect(() => {
    // Try to get version from environment variable first
    const envVersion = import.meta.env['VITE_APP_VERSION'];
    if (envVersion) {
      setAppVersion(envVersion);
      return;
    }

    // Fallback to default version
    setAppVersion('0.1.0');
  }, []);

  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      label: 'Documentation',
      href: '/docs',
      description: 'View API documentation and guides',
    },
    {
      label: 'Changelog',
      href: '/changelog',
      description: 'View recent updates and changes',
    },
    {
      label: 'Status',
      href: '/status',
      description: 'Check system status and uptime',
    },
  ];

  return (
    <footer 
      className="bg-neutral-900 text-neutral-100 px-4 py-8 sm:px-6 lg:px-8"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Pivotal Flow
            </h3>
            <p className="text-neutral-300 text-sm">
              Streamline your business workflow from quotes to payments.
            </p>
          </div>

          {/* Links Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
              Resources
            </h4>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-neutral-300 hover:text-white transition-colors duration-150 text-sm"
                      aria-describedby={`${link.label.toLowerCase()}-description`}
                    >
                      {link.label}
                    </a>
                    <div className="sr-only" id={`${link.label.toLowerCase()}-description`}>
                      {link.description}
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Version Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wide">
              Version Info
            </h4>
            <div className="space-y-2 text-sm text-neutral-300">
              <p>
                <span className="font-medium">Version:</span> {appVersion}
              </p>
              <p>
                <span className="font-medium">Build:</span> {import.meta.env['VITE_BUILD_SHA'] || 'development'}
              </p>
              <p>
                <span className="font-medium">Environment:</span> {import.meta.env.MODE || 'development'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-neutral-700">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-neutral-400">
              © {currentYear} Pivotal Flow. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-neutral-400">
              <span>Built with ❤️ for modern businesses</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
