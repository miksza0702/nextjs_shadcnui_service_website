import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";


type EquipmentItem = {
    id: string;
    business: string;
    name: string;
    type: string;
    serialNumber: string;
    location: string;
};


const EquipmentList = () => {
    const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);


    const handleDeleteEquipment = async () => {
        if (!selectedEquipment) return;

        try {
            await deleteDoc(doc(db, "equipment", selectedEquipment.id));
            setEquipment((prevEquipment) => prevEquipment.filter((equipment) => equipment.id !== selectedEquipment.id));
            setIsDialogOpen(false);
        } catch (error){
            console.log("Error deleting equipment", error);
        }
    };

    const openDialog = (equipment: EquipmentItem) => {
        setSelectedEquipment(equipment);
        setIsDialogOpen(true);
    };

    useEffect(() => {
        const fetchEquipment = async () => {
            const querySnapshot = await getDocs(collection(db, "equipment"));
            const items = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as EquipmentItem[];
            setEquipment(items);
        };

        fetchEquipment();
    }, []);

    return (
        <div>
            
                
                    {/* <h3>{item.business}</h3>
                    <p>{item.name}</p>
                    <p>{item.type}</p>
                    <p>{item.serialNumber}</p>
                    <p>{item.location}</p>
                    <a href={`/equipment/${item.id}`}>View Repairs</a> */}
                    <Table className="w-full border border-gray-300">
                        <TableHeader>
                            <TableRow className="bg-gray-200 ">
                                <TableHead className="font-bold p-2 text-center align-middle">Name of device</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle">Business</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle">Model</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle">Serial Number</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle">Location</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle">Modify</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipment.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="p-2 text-center align-middle">{item.name}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">{item.business}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">{item.type}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">{item.serialNumber}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">{item.location}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">
                                            <div className="flex justify-center space-x-1">
                                                <Button className="btn btn-primary font-bold"><a href={`/equipment/${item.id}`}>View Repairs</a></Button> 
                                                <Button className="btn btn-edit font-bold"><a href={`/equipment/edit/equipment/${item.id}`}>Edit</a></Button>
                                                <Button className="btn btn-destructive font-bold" onClick={() => openDialog(item)}>Delete</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Button className="btn btn-edit font-bold"><a href={`/equipment/add`}>Add Printer</a></Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="bg-white shadow-lg rounded-md p-6">
                            <DialogTitle>Potwierdzenie usunięcia</DialogTitle>
                            <DialogDescription>
                                Czy na pewno chcesz usunąć urządzenie "{selectedEquipment?.name}" o numerze seryjnym "{selectedEquipment?.serialNumber}"?
                            </DialogDescription>
                            <DialogFooter>
                                <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
                                <Button variant="destructive" onClick={handleDeleteEquipment}>Usuń</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>


            
        </div>
    )
}

export default EquipmentList;