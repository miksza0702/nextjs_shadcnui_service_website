import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";


const AddEquipment = () => {
    const [name, setName] = useState("");
    const [business, setBusiness] = useState("");
    const [type, setType] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [location, setLocation] = useState("");
    const router = useRouter();


    // const handleAdd = async () => {
    //     try {
    //         await addDoc(collection(db, "equipment"), {
    //             name,
    //             business,
    //             type,
    //             serialNumber,
    //             location,                
    //         });
    //         alert("Equipment added!");
    //         router.push('/equipment');
    //     } catch (error) {
    //         console.error("Error adding equipment", error);
    //     }
    // };


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
        })
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
        },
    })

    const handleSubmit = async (data: EquipmentFormData) => {
        console.log("Form data: ", data);
        await addEquipment(data);
        router.push("/equipment");
    };

    return (
        <div>
            {/* <input 
                type="text"
                placeholder="Name of device"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Business"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
            />
            <input
                type="text"
                placeholder="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
            />
            <input 
                type="text"
                placeholder="Serial Number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
            />
            <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />
            <button onClick={handleAdd}>Add Equipment</button> */}

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
                    <Button type="submit" variant="secondary" className="w-full">
                        Dodaj urządzenie
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AddEquipment;