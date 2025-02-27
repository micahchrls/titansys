import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const words = [
        { text: 'Streamline' },
        { text: 'your' },
        { text: 'sales' },
        { text: 'and' },
        { text: 'inventory' },
        { text: 'with' },
        { text: 'TitanSys', className: 'text-gray-500' },
    ];

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-black p-6 text-black dark:text-white">
                <div className="w-full max-w-4xl flex flex-col items-center justify-center gap-12">
                    <TypewriterEffect words={words} className="text-3xl md:text-4xl lg:text-5xl font-bold text-center" />
                    <p className="text-lg md:text-xl text-center text-gray-600 dark:text-gray-300 max-w-2xl">
                        Empower your business with our cutting-edge inventory and sales management solution.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                        {auth.user ? (
                            <Button asChild variant="default" size="lg">
                                <Link href={route('dashboard')}>Go to Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="default" size="lg">
                                    <Link href={route('login')}>Log in</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg">
                                    <Link href={route('register')}>Register</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
