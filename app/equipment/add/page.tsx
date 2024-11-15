"use client";
import { useState } from "react";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";


const AddEquipment = () => {
    const router = useRouter();

    async function addEquipment(data: EquipmentFormData) {
        const equipmentRef = collection(db, "equipment");
        const docRef = await addDoc(equipmentRef, data);
        console.log("Equipment added with ID:", docRef.id);
    }

    const formSchema = z.object({
        name: z.string().min(2, {
            message: "Username must be at leeast 2 characters",
        }),
        business: z.string().min(2, {
            message: "Nazwa firmy urządzenia jest wymagana"
        }),
        type: z.string().min(2, {
            message: "Podaj model urządzenia"
        }),
        serialNumber: z.string().min(2, {
            message: "Podaj SN urządzenia"
        }),
        location: z.string().min(2, {
            message: "Podaj lokalizacje urządzenia"
        }),
        inventoryNumber: z.string().min(2, {
            message: "Podaj numer inwentarzowy"
        }),
        dateOfPurchase: z.string().nonempty(
            "Data zakupu jest wymagana"
        ),
        sellingCompany: z.string().min(2, {
            message: "Podaj nazwe firmy z ktorej zakupiono sprzet"
        }),
        warranty: z.string().nonempty(
            "Data gwarancji jest wymagana"
        ),
    })

    type EquipmentFormData = z.infer<typeof formSchema>;
    const form = useForm<EquipmentFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            business: "",
            type: "",
            serialNumber: "",
            location: "",
            inventoryNumber: "",
            dateOfPurchase: new Date().toISOString().split("T")[0],
            sellingCompany: "",
            warranty: new Date().toISOString().split("T")[0],
        },
    })

    const handleSubmit = async (data: EquipmentFormData) => {
        console.log("Form data: ", data);
        await addEquipment(data);
        router.push("/equipment");
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-6 bg-white shadow-md rounded-md">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nazwa urządzenia</FormLabel>
                            <FormControl>
                                <Input placeholder="name" {...field} />
                            </FormControl>
                            <FormDescription>
                                
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    

                    <FormField
                        control={form.control}
                        name="business"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nazwa firmy urządzenia</FormLabel>
                                <FormControl>
                                    <Input placeholder="business" {...field} />
                                </FormControl>
                                <FormDescription>
                                    
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model urządzenia</FormLabel>
                                <FormControl>
                                    <Input placeholder="type" {...field} />
                                </FormControl>
                                <FormDescription>
                                    
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="serialNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SN urządzenia</FormLabel>
                                <FormControl>
                                    <Input placeholder="serialNumber" {...field} />
                                </FormControl>
                                <FormDescription>
                                    
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lokalizacja urządzenia</FormLabel>
                                <FormControl>
                                    <Input placeholder="location" {...field} />
                                </FormControl>
                                <FormDescription>
                                    
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="inventoryNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Numer inwentarzowy urządzenia</FormLabel>
                                <FormControl>
                                    <Input placeholder="inventoryNumber" {...field} />
                                </FormControl>
                                <FormDescription>
                                    
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dateOfPurchase"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data zakupu sprzętu</FormLabel>
                                <FormControl>
                                    <Input placeholder="dateOfPurchase" type="date" {...field} />
                                </FormControl>
                                <FormDescription>
                                    
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="sellingCompany"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nazwa firmy, gdzie zakupiono sprzęt</FormLabel>
                                <FormControl>
                                    <Input placeholder="sellingCompany" {...field} />
                                </FormControl>
                                <FormDescription>
                                    
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="warranty"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Czas gwarancji</FormLabel>
                                <FormControl>
                                    <Input placeholder="warranty" type="date" {...field} />
                                </FormControl>
                                <FormDescription>
                                    
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            
                        )}
                    />
                    <Button type="submit" variant="secondary" className="w-full">
                        Dodaj urządzenie
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AddEquipment;