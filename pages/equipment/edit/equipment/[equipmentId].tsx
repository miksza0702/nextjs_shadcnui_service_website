import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EquipmentData {
    name: string;
    business: string;
    type: string;
    serialNumber: string;
    location: string;
    inventoryNumber: string;
    dateOfPurchase: string;
    sellingCompany: string;
    warranty: string; 
};


const UpdateEquipment = () => {
    const router = useRouter();
    const { equipmentId } = router.query;
    const [initialData, setInitialData] = useState<EquipmentData | null>(null);

    const formSchema = z.object({
        name: z.string().nonempty("Nazwa sprzętu jest wymagana"),
        business: z.string().nonempty("Nazwa firmy urządzenia jest wymagana"),
        type: z.string().nonempty("Nazwa modelu urządzenia jest wymagana"),
        serialNumber: z.string().nonempty("Numer seryjny urządzenia jest wymagany"),
        location: z.string().nonempty("Lokalizacja urządzenia jest wymagana"),
        inventoryNumber: z.string().nonempty("Numer inwentarzowy urządzenia jest wymagany"),
        dateOfPurchase: z.string().nonempty("Data zakupu urządzenia jest wymagana"),
        sellingCompany: z.string().nonempty("Nazwa firmy, skąd zakupiono urządzenie jest wymagana"),
        warranty: z.string().nonempty("Data zakończenia gwarancji urządzenia jest wymagana"),
    });

    type EquipmentFormData = z.infer<typeof formSchema>;

    const form = useForm<EquipmentFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            business: initialData?.business || "",
            type: initialData?.type || "",
            serialNumber: initialData?.serialNumber || "",
            location: initialData?.location || "",
            inventoryNumber: initialData?.inventoryNumber || "",
            dateOfPurchase: initialData?.dateOfPurchase || "",
            sellingCompany: initialData?.sellingCompany || "",
            warranty: initialData?.warranty || "",            
        },
    });

    useEffect(() => {
        const fetchEquipmentData = async () => {
            if(equipmentId) {
                const equipmentRef = doc(db, "equipment", equipmentId as string);
                const docSnap = await getDoc(equipmentRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as EquipmentData;
                    setInitialData(data);
                    form.reset(data);
                } else {
                    console.error("Sprzęt nie został znaleziony.");
                }
            }
        };

        fetchEquipmentData();
    }, [equipmentId, form]);

    const updateEquipment = async (data: EquipmentFormData) => {
        if (!equipmentId) return;

        const equipmentRef = doc(db, "equipment", equipmentId as string);
        await updateDoc(equipmentRef, {
            ...data,
        });

        router.push(`/equipment/${equipmentId}`);
    };

    const handleSubmit = async (data: EquipmentFormData) => {
        await updateEquipment(data);
    };

    if (!initialData) {
        return <div>Ładowanie danych...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edytuj sprzęt</h1>
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
                        Edytuj urządzenie
                    </Button>
                </form>
            </Form>
        </div>
    );

};

export default UpdateEquipment;




