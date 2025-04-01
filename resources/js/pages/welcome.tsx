import { Button } from '@/components/ui/button';
import { DotPattern } from "@/components/magicui/dot-pattern";
import { TypewriterEffect } from '@/components/ui/typewriter-effect';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    const words = [
        { text: 'Welcome' },
        { text: 'to' },
        { text: 'TitanSys', className: 'text-primary font-bold' },
        { text: 'Inventory' },
        { text: 'Management' },
    ];

    return (
        <>
            <div>
                <DotPattern
                    width={24}
                    height={24}
                    cx={1}
                    cy={1}
                    cr={1}
                    className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
                />
            </div>
            <Head title="Welcome to TitanSys">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
                <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-16">
                    <TypewriterEffect words={words} className="text-center text-4xl font-bold md:text-5xl lg:text-6xl" />
                    <p className="max-w-3xl text-center text-xl text-muted-foreground md:text-2xl">
                        Streamline your inventory processes, optimize stock levels, and boost your business efficiency with TitanSys - your ultimate inventory management solution.
                    </p>
                    <div className="flex w-full flex-col justify-center gap-6 sm:flex-row">
                        {auth.user ? (
                            <Button asChild size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105">
                                <Link href={route('dashboard')}>Access Your Inventory</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105">
                                    <Link href={route('login')}>Log In</Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8 py-4 text-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105">
                                    <Link href={route('register')}>Create Account</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
