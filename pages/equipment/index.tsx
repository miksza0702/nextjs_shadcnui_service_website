import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"


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
                                        <TableCell className="p-2 text-center align-middle">{item.business}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">{item.name}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">{item.type}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">{item.serialNumber}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">{item.location}</TableCell>
                                        <TableCell className="p-2 text-center align-middle">
                                            <div className="flex justify-center space-x-1">
                                                <Button className="btn btn-primary font-bold"><a href={`/equipment/${item.id}`}>View Repairs</a></Button> 
                                                <Button className="btn btn-edit font-bold"><a href={`/equipment/edit/equipment/${item.id}`}>Edit</a></Button>
                                                <Button className="btn btn-destructive font-bold">Delete</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Button className="btn btn-edit font-bold"><a href={`/equipment/add`}>Add Printer</a></Button>




            
        </div>
    )
}

export default EquipmentList;