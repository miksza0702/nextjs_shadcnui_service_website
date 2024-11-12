import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebase";
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TonerExchangePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [equipment, setEquipment] = useState<any>(null);
    const [toners, setToners] = useState<any[]>([]);
    const [selectedTonerId, setSelectedTonerId] = useState<string>("");
    const [meterCount, setMeterCount] = useState<number | "">("");
    const [tonerExchanges, setTonerExchanges] = useState<any[]>([]);

    //pobieramy dane sprzetu
    useEffect(() => {
        if (!id) return;
        const fetchEquipmentData = async () => {
            const equipmentRef = doc(db, "equipment", id as string);
            const equipmentSnap = await getDoc(equipmentRef);
            if (equipmentSnap.exists()) {
                setEquipment(equipmentSnap.data());
            } else {
                console.log("Nie znaleziono sprzętu!");
            }
        };

        const fetchToners = async () => {
            const tonersRef = collection(db, "toners");
            const tonersSnap = await getDocs(tonersRef);
            const tonersData = tonersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setToners(tonersData);
        };

        const fetchTonerExchanges = async () => {
            const exchangesRef = query(collection(db, "tonerExchanges"), where("equipmentId", "==", id));
            const exchangesSnap = await getDocs(exchangesRef);
            const exchangesData = exchangesSnap.docs.map(doc => doc.data());
            setTonerExchanges(exchangesData);
        };

        fetchEquipmentData();
        fetchToners();
        fetchTonerExchanges();
    }, [id]);

    const handleAddTonerExchange = async () => {
        if (!selectedTonerId || meterCount === "") return;

        const toner = toners.find(t => t.id === selectedTonerId);
        if (!toner) return;

        // Pobieramy ostatnią wymianę tonera w danej drukarce (jeśli istnieje)
        const previousExchange = tonerExchanges.length > 0 ? tonerExchanges[tonerExchanges.length - 1] : null;
        const previousMeterCount = previousExchange ? previousExchange.meterCount : 0;

        // Obliczamy różnicę wydajności jako różnicę między aktualnym licznikiem a poprzednim licznikiem
        const performanceDifference = meterCount - previousMeterCount;

        // Sprawdzamy, czy wydajność tonera jest w porządku (jeśli różnica wydajności przekracza 5%, wyświetlamy alert)
        const isAlertRequired = performanceDifference < toner.performance * 0.95;

        // Dodajemy nową wymianę tonera
        await addDoc(collection(db, "tonerExchanges"), {
            equipmentId: id,
            tonerName: toner.name,
            meterCount,
            exchangeDate: new Date().toISOString(),
            performanceDifference,
        });

        // Zaktualizowanie ilości tonera w magazynie
        await updateDoc(doc(db, "toners", toner.id), { quantity: toner.quantity - 1 });

        // Jeśli różnica wydajności jest większa niż 5%, wyświetlamy ostrzeżenie
        if (isAlertRequired) {
            alert("UWAGA! Toner został wymieniony przed osiągnięciem sugerowanej wydajności.");
        }

        // Przekierowujemy użytkownika na stronę z danymi sprzętu
        router.push(`/equipment/${id}`);
    };

    return (
        <div>
            <h1>Wymiana tonera dla {equipment?.name} {equipment?.business} {equipment?.type}</h1>
            <div>
                <label>Wybierz toner: </label>
                <Select value={selectedTonerId} onValueChange={setSelectedTonerId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Wybierz toner" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        {toners.map(toner => (
                            <SelectItem key={toner.id} value={toner.id} className="hover:bg-gray-100">
                                {toner.name} - wydajność: {toner.performance}, ilość w magazynie: {toner.quantity}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <label>Aktualny licznik: </label>
                <Input type="number" value={meterCount} onChange={(e) => setMeterCount(parseInt(e.target.value))} />

                <Button onClick={handleAddTonerExchange}>Zarejestruj wymianę tonera</Button>
            </div>

            <h2>Historia wymian tonerów</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nazwa toneru</TableHead>
                        <TableHead>Data wymiany</TableHead>
                        <TableHead>Stan licznika</TableHead>
                        <TableHead>Różnica wydajności</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tonerExchanges.map((exchange, index) => (
                        <TableRow key={index}>
                            <TableCell>{exchange.tonerName}</TableCell>
                            <TableCell>{new Date(exchange.exchangeDate).toLocaleDateString()}</TableCell>
                            <TableCell>{exchange.meterCount}</TableCell>
                            <TableCell>{exchange.performanceDifference}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default TonerExchangePage;
