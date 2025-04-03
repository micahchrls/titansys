import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center justify-center h-9 w-9 overflow-hidden rounded-md">
                <AppLogoIcon className="h-full w-full object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate font-semibold leading-tight">Titan</span>
                <span className="truncate text-[10px] font-medium text-muted-foreground">Sales and Inventory Management</span>
            </div>
        </>
    );
}
