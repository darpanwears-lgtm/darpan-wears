
'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function UserList() {
    const firestore = useFirestore();
    const usersCollection = useMemoFirebase(() => (firestore ? collection(firestore, 'users') : null), [firestore]);
    const { data: users, isLoading } = useCollection<UserProfile>(usersCollection);

    if (isLoading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Customer Profiles</CardTitle>
                    <CardDescription>View details of all registered customers.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                             <div key={i} className="flex items-center space-x-4 p-2">
                                <div className="space-y-2 flex-grow">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customer Profiles</CardTitle>
                <CardDescription>View details of all registered customers.</CardDescription>
            </CardHeader>
            <CardContent>
                 {users && users.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email || '-'}</TableCell>
                                    <TableCell>{user.phone || '-'}</TableCell>
                                    <TableCell>{user.address || '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 ) : (
                    <p className="text-muted-foreground text-center">No customers have signed up yet.</p>
                 )}
            </CardContent>
        </Card>
    );
}
