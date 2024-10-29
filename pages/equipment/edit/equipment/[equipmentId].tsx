import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";


const EditEquimpent = () => {
    const router = useRouter();
    const { equipmentId } = router.query;

    const [name, setName] = useState("");
    const [business, setBusiness] = useState("");
    const [model, setModel] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
            const fetchEquipment = async () => {
                if(!equipmentId) return;

                try {
                    const docRef = doc(db, "equipment", equipmentId as string);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setName(data.name || "");
                        setBusiness(data.business || "");
                        setModel(data.model || "");
                        setSerialNumber(data.serialNumber || "");
                        setLocation(data.location || "");                     
                    } 
                } catch (error){
                    console.error("Błąd pobierania danych sprzętu")
                }
            };
            fetchEquipment();
        }, [equipmentId]);

    const handleUpdateEquipment = async () => {
        if (!name || !business || !model || !serialNumber || !location){
            alert("Proszę uzupełnić wszystkie pola.");
            return;
        }

        try {
            const docRef = doc(db, "equipment", equipmentId as string);
            await updateDoc(docRef, {
                name,
                business,                
                model,
                serialNumber,
                location,
            });
            router.push(`/equipment/`);
        } catch (error) {
            console.error("Błąd podczas aktualizacji sprzętu", error);
            alert("Wystąpił błąd podczas aktualizacji. Spróbuj ponownie.");
        }
    };

    return (
        <div>
            <h1>Edytuj sprzęt</h1>
            <div>
                <label>Name of device</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name of device"/>
            </div>
            <div>
                <label>Business</label>
                <input type="text" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Business"/>
            </div>
            <div>
                <label>Model</label>
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model"/>
            </div>
            <div>
                <label>Serial Number</label>
                <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="SN"/>
            </div>
            <div>
                <label>Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location"/>
            </div>
            <button onClick={handleUpdateEquipment}>Zapisz zmiany</button>
        </div>
    );
};

export default EditEquimpent;