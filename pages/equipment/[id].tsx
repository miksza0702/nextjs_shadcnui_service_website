import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import { getDoc, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";


export default function EquipmentDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [equipment, setEquipment] = useState<{ id: string; name: string; location: string; serialNumber: string; type: string; business: string } | null>(null);
    const [repairs, setRepairs] = useState<{ id: string; date: string; location: string; description: string; cost: string }[]>([]);


    useEffect(() => {
        if (typeof id === "string"){
            const fetchEquipmentData = async () => {
                const equipmentRef = doc(db, "equipment", id);
                const equipmentSnap = await getDoc(equipmentRef);

                if(equipmentSnap.exists()) {
                    const equipmentData = equipmentSnap.data() as { name: string; location: string; serialNumber: string; type: string; business: string };
                    setEquipment({ id: equipmentSnap.id, ...equipmentData});
                } else {
                    console.log("No such equipment!");
                }
            };

            const fetchRepairs = async () => {
                const repairsRef = collection(db, "repairs");
                const q = query(repairsRef, where("equipmentId", "==", id));
                const querySnapshot = await getDocs(q);

                const repairData = querySnapshot.docs.map((doc) => ({ 
                    id: doc.id, 
                    date: doc.data().date,
                    location: doc.data().location,
                    description: doc.data().description,
                    cost: doc.data().cost
                }));
                setRepairs(repairData);
            };

            fetchEquipmentData();
            fetchRepairs();
        }


    }, [id]);

    const handleDeleteRepair = async (repairId: string) => {
        try {
            await deleteDoc(doc(db, "repairs", repairId));
            setRepairs((prevRepairs) => prevRepairs.filter((repair) => repair.id !== repairId));
        } catch (error) {
            console.error("Error deleting repair", error)
        }
    };

    const handleEditRepair = (repairId: string) => {
        router.push(`/equipment/${id}/edit/repair/${repairId}`);
    };

    if(!equipment) return <p>Ładowanie danych urządzenia...</p>

    return (
        <div className="p-6 space-y-4">
            <div className="bg-gray-100 p-4 rounded-md">
                <h2 className="text-xl font-bold">{equipment.name}</h2>
                <p>{equipment.business} {equipment.type}</p>
                <p>Lokalizacja: {equipment.location}</p>
                <p>Numer seryjny: {equipment.serialNumber}</p>
            </div>
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Lokalizacja</TableHead>
                        <TableHead>Opis</TableHead>
                        <TableHead>Koszt</TableHead>
                        <TableHead>Akcje</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {repairs.map((repair) => (
                        <TableRow>
                            <TableCell>{repair.date}</TableCell>
                            <TableCell>{repair.location}</TableCell>
                            <TableCell>{repair.description}</TableCell>
                            <TableCell>{repair.cost}</TableCell>
                            <TableCell>
                                <Button variant="default" onClick={() => handleEditRepair(repair.id)}>Edytuj</Button>
                                <Button variant="destructive" onClick={() => handleDeleteRepair(repair.id)} className="ml-2">Usuń</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

