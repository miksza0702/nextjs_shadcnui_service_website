"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "../../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const AddRepair = () => {
    const router = useRouter();
    const params = useParams() as { id: string };
    const { id } = params;

    const formSchema = z.object({
        date: z.string().nonempty(
            "Data jest wymagana"
        ),
        location: z.string().nonempty(
            "Lokalizacja minimum 2 znaki"
        ),
        description: z.string().nonempty(
            "Podaj opis awarii!"
        ),
        cost: z.string().nonempty("Koszt musi być liczbą dodatnią").transform((val) => Number(val)).refine((val) => !isNaN(val), {
            message: "Koszt musi być liczbą",
        }),
    });

    type RepairFormData = z.infer<typeof formSchema>;

    async function addRepair(data: RepairFormData){
        await addDoc(collection(db, "repairs"),{
                equipmentId: id,
                ...data,
        });
    };

    const form = useForm<RepairFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split("T")[0],
            location: "",
            description: "",
            cost: 0,
        },
    });

    const handleSubmit = async (data: RepairFormData) => {
        console.log("Form data", data);
        data.cost = Number(data.cost);
        await addRepair(data);
        router.push(`/equipment/${id}`);
    };

    return (
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-6 bg-white shadow-md rounded-md">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data</FormLabel>
                                <FormControl>
                                    <Input placeholder="date" type="date" {...field}/>
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lokalizacja</FormLabel>
                                <FormControl>
                                    <Input placeholder="location" type="text" {...field}/>
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />  
                    
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Opis naprawy</FormLabel>
                                <FormControl>
                                    <Input placeholder="description" type="text" {...field} />
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />  

                    <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Koszt naprawy</FormLabel>
                                <FormControl>
                                    <Input placeholder="cost" type="number" {...field} />
                                </FormControl>
                                <FormDescription></FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />  

                    <Button type="submit" variant="secondary" className="w-full">
                        Dodaj naprawę
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AddRepair;