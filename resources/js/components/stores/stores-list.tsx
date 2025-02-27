import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Store {
    id: string;
    name: string;
    address: string;
    city: string;
    pincode: string;
    phone: string;
}

const stores: Store[] = [
    {
        id: '1',
        name: 'Singanallur Branch',
        address: '1A/K/Vinnarajapuram, 3 rd street sulur',
        city: 'Coimbatore',
        pincode: '631403',
        phone: '044- 653578'
    },
    {
        id: '2',
        name: 'Slur Branch',
        address: '54 Raman colony, 3 rd street sulur',
        city: 'Coimbatore',
        pincode: '63133452',
        phone: '044- 653763'
    },
    {
        id: '3',
        name: 'Gaandipuram Branch',
        address: '32/ Venkataamy layout, 3 rd street sulur',
        city: 'Coimbatore',
        pincode: '631403',
        phone: '044- 653578'
    }
];

export function StoresList() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">Store Locations</CardTitle>
                    <Button size="sm" variant="default">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Store
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {stores.map((store) => (
                        <div key={store.id} className="flex items-start gap-4 rounded-lg border p-4">
                            <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-muted" />
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-sm font-medium">{store.name}</h3>
                                        <p className="text-sm text-muted-foreground">{store.address}</p>
                                        <p className="text-sm text-muted-foreground">{store.city} - {store.pincode}</p>
                                        <p className="text-sm text-muted-foreground">{store.phone}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-primary">
                                        Edit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
