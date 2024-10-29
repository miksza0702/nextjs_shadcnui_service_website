import { useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore"

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

const AddRepair = () => {
    const router = useRouter();
    const { id } = router.query;

    const [date, setDate] = useState(getTodayDate());
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState("");

    const handleAddRepair = async () => {
        await addDoc(collection(db, "repairs"),{
            equipmentId: id,
            date,
            location,
            description,
            cost: parseFloat(cost),
        });
        router.push(`/equipment/${id}`);
    };


    return (
        <div>
            <h1>Dodaj naprawę</h1>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Data" />
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Cost"/>
            <button onClick={handleAddRepair}>Dodaj naprawę</button>
        </div>
    );
};


export default AddRepair;