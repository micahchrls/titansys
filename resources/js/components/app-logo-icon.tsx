import { HTMLAttributes, useEffect, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    const { appearance } = useAppearance();
    const [isDark, setIsDark] = useState(false);
    
    useEffect(() => {
        // Check if we should use dark mode based on the current appearance setting
        const darkMode = appearance === 'dark' || 
            (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDark(darkMode);
        
        // Also listen for system changes if in system mode
        if (appearance === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => setIsDark(mediaQuery.matches);
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [appearance]);
    
    // Use the appropriate logo based on the current theme
    const logoSrc = isDark ? '/logo-for-dark.png' : '/logo-for-light.png';
    
    // Extract className and style from props to properly merge them
    const { className, style, ...otherProps } = props;
    
    return (
        <img 
            src={logoSrc} 
            alt="Titan Logo" 
            className={`w-100 h-100 ${className || ''}`}
            style={{ maxWidth: '100%', ...style }}
            {...otherProps} 
        />
    );
}
