import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";


const AddEquipment = () => {
    const [name, setName] = useState("");
    const [business, setBusiness] = useState("");
    const [type, setType] = useState("");
    const [serialNumber, setSerialNumber] = useState("");
    const [location, setLocation] = useState("");
    


    const handleAdd = async () => {
        try {
            await addDoc(collection(db, "equipment"), {
                name,
                business,
                type,
                serialNumber,
                location,                
            });
            alert("Equipment added!");
        } catch (error) {
            console.error("Error adding equipment", error);
        }
    };

    return (
        <div>
            <input 
                type="text"
                placeholder="Business"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
            />
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            <button onClick={handleAdd}>Add Equipment</button>
        </div>
    );
};

export default AddEquipment;