
'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ScrollArea } from "./ui/scroll-area";
import { OrderList } from "./admin/order-list";
import { ProductList } from "./admin/product-list";
import { ProductForm } from "./admin/product-form";

interface AdminPanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminPanelDialog({ open, onOpenChange }: AdminPanelDialogProps) {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
            <div className="flex justify-between items-center">
                <div>
                    <DialogTitle className="text-2xl font-bold">Admin Panel</DialogTitle>
                    <DialogDescription>Manage your store's orders and products.</DialogDescription>
                </div>
                <Button variant="ghost" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </DialogHeader>
        <div className="flex-grow overflow-hidden px-6 pb-6">
            <Tabs defaultValue="manage-orders" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="manage-orders">Manage Orders</TabsTrigger>
                    <TabsTrigger value="manage-products">Manage Products</TabsTrigger>
                    <TabsTrigger value="add-product">Add Product</TabsTrigger>
                </TabsList>
                <div className="flex-grow overflow-hidden mt-6">
                    <ScrollArea className="h-full pr-4">
                        <TabsContent value="manage-orders" className="mt-0">
                            <OrderList />
                        </TabsContent>
                        <TabsContent value="manage-products" className="mt-0">
                            <ProductList />
                        </TabsContent>
                        <TabsContent value="add-product" className="mt-0">
                            <ProductForm />
                        </TabsContent>
                    </ScrollArea>
                </div>
            </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
