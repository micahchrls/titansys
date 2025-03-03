export function useInitials() {
    const getInitials = (firstName?: string, middleName?: string, lastName?: string): string => {
        if (!firstName && !lastName) return '';

        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';

        return `${firstInitial}${lastInitial}`;
    };

    return getInitials;
}
