"use client";

import { ReactNode, useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogOverlay, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import "../styles/globals.css";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Calendar, Home, Inbox, Search, Settings, Printer, BookText } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";

export default function RootLayout({ children }: { children: ReactNode }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState("toners");
    const [notifications, setNotifications] = useState<any[]>([]);
    const router = useRouter();
    const currentPath = usePathname() || "/";
    const breadcrumbItems = currentPath.split("")

    // Przykładowe notyfikacje
    useEffect(() => {
        setNotifications([
            { id: 1, message: "Nowa wymiana tonera w drukarce 12345", read: false },
            { id: 2, message: "Drukarka 98765 wymaga uzupełnienia tonera", read: false },
        ]);
    }, []);

    const handleNotificationClick = (id: number) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: !notification.read } : notification
        ));
    };
    const items = [
        {
            title: "Home",
            url: "#",
            icon: Home,
        },
        {
            title: "Sprzęt",
            url: "/equipment",
            icon: Printer,
        },
        {
            title: "Tonery",
            url: "/toners",
            icon: BookText,
        }
    ]

    return (
        <html lang="pl">
            <body className="flex h-screen bg-gray-50">
            <SidebarProvider>
                <Sidebar>
                    <SidebarContent className="bg-blue-400">
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-xl font-bold">Dashboard</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <Link 
                                                    href={item.url}                                                    
                                                    className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                                                        currentPath === item.url
                                                            ? "bg-white text-blue-700 font-bold"
                                                            : "hover:bg-blue-600" 
                                                    }`}
                                                >
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
                {/* Main content area */}
                <div className="flex flex-col flex-grow w-full">
                    {/* Top bar */}
                    <div className="h-16 shadow-md flex items-center justify-between px-6">
                        <div className="flex items-center space-x-4">
                            <Avatar>
                                <AvatarImage src="https://i.pravatar.cc/150?img=3" alt="User Avatar" />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <div className="text-sm font-semibold">Jan Kowalski</div>
                        </div>

                        {/* <Breadcrumb className="flex items-center space-x-2">
                            {breadcrumbItems.map((item, index) => (
                                <BreadcrumbItem key={index} isCurrent={index ===breadcrumbItems.length -1}>
                                    <BreadcrumbLink href={`/${breadcrumbItems.slice(0, index + 1).join("/")}`}>
                                        {item.charAt(0).toUpperCase() + item.slice(1)}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            ))}
                        </Breadcrumb> */}

                        {/* Notifications */}
                        <div className="relative">
                            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="relative">
                                <span className="material-icons">notifications</span>
                                {notifications.filter(notification => !notification.read).length > 0 && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full" />
                                )}
                            </Button>

                            {/* Notifications Dialog */}
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogOverlay />
                                <DialogContent className="max-w-sm w-full p-4 bg-white">
                                    <DialogTitle>Notyfikacje</DialogTitle>
                                    <h2 className="text-lg font-semibold">Notyfikacje</h2>
                                    <ul className="space-y-2 mt-4">
                                        {notifications.map((notification) => (
                                            <li
                                                key={notification.id}
                                                className={`p-2 rounded-md cursor-pointer ${
                                                    notification.read ? "bg-gray-100" : "bg-gray-200"
                                                }`}
                                                onClick={() => handleNotificationClick(notification.id)}
                                            >
                                                {notification.message}
                                            </li>
                                        ))}
                                    </ul>
                                    <DialogClose asChild>
                                        <Button variant="outline" className="mt-4 w-full">Zamknij</Button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Profile dropdown or settings */}
                        <div>
                            <Select value={selectedOption} onValueChange={setSelectedOption}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Opcje" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="toners">Tonery</SelectItem>
                                    <SelectItem value="equipment">Sprzęt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Main dashboard content */}
                    <div className="flex-grow p-6 w-full overflow-auto">
                        {children}
                        
                    </div>
                </div>
                </SidebarProvider>
            </body>
        </html>
    );
}
