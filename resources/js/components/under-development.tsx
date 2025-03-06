export default function UnderDevelopment() {
    return (
        <div className="p-6">
            <main className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-center space-y-6 text-center">
                <div className="bg-muted rounded-full p-4">
                    <img
                        src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif"
                        width="120"
                        height="120"
                        alt="Maintenance"
                        className="rounded-full"
                        style={{ aspectRatio: '1', objectFit: 'cover' }}
                    />
                </div>
                <div className="max-w-md space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight">Under Development</h1>
                    <p className="text-muted-foreground">
                        This feature will be available soon. Please check back later or contact our development team for more information.
                    </p>
                </div>
            </main>
        </div>
    );
}
