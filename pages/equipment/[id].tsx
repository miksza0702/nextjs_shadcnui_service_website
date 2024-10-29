import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

type RepairItem = {
    id: string;
    date: string;
    location: string;
    description: string;
    cost: number;
}

const EquipmentDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [repairs, setRepairs] = useState<RepairItem[]>([]);


    useEffect(() => {
        const fetchRepairs = async () => {
            const q = query(collection(db, "repairs"), where("equipmentId", "==", id));
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                equipmentId: doc.data().equipmentId ?? "",
                date: doc.data().date ?? "",
                location: doc.data().location ?? "",
                description: doc.data().description ?? "",
                cost: doc.data().cost ?? 0,
              })) as RepairItem[];
                
            setRepairs(items);
        };

        if (id) fetchRepairs();

    }, [id]);

    const handleDeleteRepair = async (repairId: string) => {
        await deleteDoc(doc(db, "repairs", repairId));
        setRepairs(repairs.filter((repair)=> repair.id !== repairId));
    };

    return (
        <div>
            {/* <h2>Repairs</h2>
            {repairs.length > 0 ? (
                repairs.map((repair, index) => (
                    <div key={index}>
                        <p>{repair.date}</p>
                        <p>{repair.description}</p>
                    </div>
            ))) : (
                <p>Brak napraw dla tego sprzętu</p>
            )}
            <a href={`/equipment/${id}/add-repair`}>Dodaj naprawę</a> */}
            <h2>Historia napraw</h2>
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Lokalizacja</th>
                        <th>Opis</th>
                        <th>Koszt</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    {repairs.map((repair) => (
                        <tr key={repair.id}>
                            <td>{repair.date}</td>
                            <td>{repair.location}</td>
                            <td>{repair.description}</td>
                            <td>{repair.cost}</td>
                            <td>
                                <button onClick={() => router.push(`/equipment/edit/equipment/${repair.id}`)}>Edytuj</button>
                                <button onClick={() => handleDeleteRepair(repair.id)}>Usuń</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        
        </div>
    );
};

export default EquipmentDetails;