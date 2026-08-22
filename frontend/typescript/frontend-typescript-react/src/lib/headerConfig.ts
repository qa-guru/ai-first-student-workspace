import type { HeaderConfig } from '@zero-design-system/react';
import { envNavItems } from '../../vendor/ds/js/env-hosts.js';
import { appPath } from './appBase';

/**
 * Canonical header config for the takeaway SPA.
 * Omit `active` — header.js derives it from location.
 * Stage/Prod come from `js/env-hosts.js`.
 */
export const headerConfig: HeaderConfig = {
  brand: { href: appPath('/'), label: 'Multistack' },
  nav: [
    { href: appPath('/'), label: 'Home', testid: 'header-nav-home' },
    { href: appPath('/login'), label: 'Login', testid: 'header-nav-login' },
    { href: appPath('/register'), label: 'Register', testid: 'header-nav-register' },
    ...envNavItems(),
  ],
  lang: { default: 'en' },
  theme: { default: 'dark' },
};
