import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";


const EditRepair = () => {
    const router = useRouter();
    const { equipmentId, repairId } = router.query;

    const [date, setDate] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState("");

    useEffect(() => {
        const fetchRepair = async () => {
            if(!repairId) return;

            try {
                const docRef = doc(db, "repairs", repairId as string);
                const docSnap = await getDoc(docRef);

                if(docSnap.exists()) {
                    const data = docSnap.data();
                    setDate(data.date || "");
                    setLocation(data.location || "");
                    setDescription(data.description || "");
                    setCost(data.cost?.toString() || "0");
                }
            } catch (error) {
                console.error("Błąd pobierania danych naprawy:", error)
            }
        };
        fetchRepair();
    }, [repairId]);

    const handleUpdateRepair = async () => {
        if (!date || !location || !description || !cost){
            alert("Proszę uzupełnić wszystkie pola.");
            return;
        }

        try {
            const docRef = doc(db, "repairs", repairId as string);
            await updateDoc(docRef, {
                date,
                location,
                description,
                cost: parseFloat(cost),
            });
            router.push(`/equipment/${equipmentId}`);
        } catch (error) {
            console.error("Błąd podczas aktualizacji naprawy:", error);
            alert("Wystąpił błąd podczas aktualizacji. Spróbuj ponownie.");
        }
    };

    return (
        <div>
            <h1>Edytuj Naprawę</h1>
            <div>
                <label>Data naprawy:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
                <label>Lokalizacja:</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lokalizacja" />
            </div>
            <div>
                <label>Opis naprawy:</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opis naprawy" />
            </div>
            <div>
                <label>Koszt:</label>
                <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Koszt" />
            </div>
            <button onClick={handleUpdateRepair}>Zapisz zmiany</button>
        </div>
    );
};

export default EditRepair;