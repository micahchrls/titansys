import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from '@/hooks/use-appearance';
import React from 'react';
import { LazyPages } from '@/utils/lazy-inertia';

declare global {
    const route: typeof routeFn;
}   

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Check if we have a pre-defined lazy loaded component
        const pageName = name.replace('/', '');
        if (pageName in LazyPages) {
            return LazyPages[pageName as keyof typeof LazyPages]();
        }
        
        // Fallback to dynamic import for pages not explicitly defined
        const pages = import.meta.glob('./pages/**/*.tsx');
        const page = pages[`./pages/${name}.tsx`];
        
        if (page) {
            return page();
        }
        
        throw new Error(`Page not found: ${name}`);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
