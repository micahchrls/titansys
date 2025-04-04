import { DotPattern } from '@/components/magicui/dot-pattern';
import { useAppearance } from '@/hooks/use-appearance';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';

interface Quote {
    message: string;
    author: string;
}

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    const page = usePage<SharedData & {name?: string; quote?: Quote}>();
    const quote = page.props.quote;
    const { appearance } = useAppearance();
    
    // Determine if dark mode is active based on the app's native appearance system
    const isDarkMode = appearance === 'dark' || 
        (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);


    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className={`relative hidden h-full flex-col p-10 lg:flex border-r ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
                <div className={`absolute inset-0 ${!isDarkMode ? 'bg-black' : 'bg-zinc-100'}`} />
                <DotPattern
                    width={24}
                    height={24}
                    cx={1}
                    cy={1}
                    cr={1}
                    className="absolute inset-0 h-full w-full text-zinc-600/20 dark:text-zinc-300/20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                />
                <div className="relative z-20 flex h-full flex-col items-center justify-center">
                    <Link href={route('home')} className="flex flex-col items-center gap-3 text-lg font-medium">
                        <div className="flex h-52 w-52 items-center justify-center">
                            <img 
                                src={`${!isDarkMode ? '/logo-for-dark.png' : '/logo-for-light.png'}`} 
                                alt="Titan Logo" 
                                className="h-full w-full object-contain" 
                            />
                        </div>
                    </Link>
                </div>
                {quote && (
                    <div className="absolute z-20 bottom-10 left-10 right-10">
                        <blockquote className="space-y-2">
                            <p className={`text-lg ${!isDarkMode ? 'text-white' : 'text-zinc-800'}`}>&ldquo;{quote.message}&rdquo;</p>
                            <footer className={`text-sm ${!isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={route('home')} className="relative z-20 flex items-center justify-center lg:hidden">
                        <div className="flex h-24 w-24 items-center justify-center">
                            <img 
                                src={`${!isDarkMode ? '/logo-for-dark.png' : '/logo-for-light.png'}`} 
                                alt="Titan Logo" 
                                className="h-full w-full object-contain" 
                            />
                        </div>
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
