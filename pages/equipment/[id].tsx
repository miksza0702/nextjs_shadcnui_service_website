import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { db } from "../../firebase";
import { getDoc, collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type Repair = {
    id: string;
    date: string;
    location: string;
    description: string;
    cost: string;
}

export default function EquipmentDetails() {
    const router = useRouter();
    const { id } = router.query;
    const [equipment, setEquipment] = useState<{ id: string; name: string; location: string; serialNumber: string; type: string; business: string; inventoryNumber: string; dateOfPurchase: string; sellingCompany: string; warranty: string; } | null>(null);
    const [repairs, setRepairs] = useState<Repair[]>([]);
    const [filteredRepairs, setFilteredRepairs] = useState<Repair[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Repair; direction: "asc" | "desc" } | null>(null);

    useEffect(() => {
        if (typeof id === "string"){
            const fetchEquipmentData = async () => {
                const equipmentRef = doc(db, "equipment", id);
                const equipmentSnap = await getDoc(equipmentRef);

                if(equipmentSnap.exists()) {
                    const equipmentData = equipmentSnap.data() as { name: string; location: string; serialNumber: string; type: string; business: string; inventoryNumber: string; dateOfPurchase: string; sellingCompany: string; warranty: string; };
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
                    cost: doc.data().cost,
                }));
                setRepairs(repairData);
            };

            fetchEquipmentData();
            fetchRepairs();
        }


    }, [id]);

    useEffect(() => {
        let filteredData = repairs.filter((repair) =>
            repair.description.toLowerCase().includes(searchQuery.toLowerCase())
        );

        //Sortowanie w zależności od konfiguracji sortowania
        if (sortConfig) {
            filteredData = filteredData.sort((a, b) =>{
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
                return 0;
            });
        }

        setFilteredRepairs(filteredData);

        const calculatedTotalPages = Math.ceil(filteredData.length / itemsPerPage);
        setTotalPages(calculatedTotalPages);

        setCurrentPage(1);

    }, [repairs, searchQuery, itemsPerPage, sortConfig]);

    const currentRepairs = filteredRepairs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Equipment: ${equipment?.name}`, 10, 10);
        doc.text(`Location: ${equipment?.location}`, 10, 20);
        doc.text(`Serial Number: ${equipment?.serialNumber}`, 10, 30);
        autoTable(doc, {
            startY: 40,
            head: [["Date", "Location", "Description", "Cost"]],
            body: repairs.map((repair) => [repair.date, repair.location, repair.description, repair.cost]),
        });
        doc.save(`repair_history_${equipment?.serialNumber}.pdf`);
    }

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(repairs);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Repairs");
        XLSX.writeFile(wb, `repair_history_${equipment?.serialNumber}.xlsx`)
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages){
            setCurrentPage(newPage);
        }
    };

    const handleSort = (key: keyof Repair) => {
        setSortConfig((prevSortConfig) => {
            if (prevSortConfig?.key === key) {
                return { key, direction: prevSortConfig.direction === "asc" ? "desc" : "asc"};
            }
            return { key, direction: "asc" };
        });
    };

    if(!equipment) return <p>Ładowanie danych urządzenia...</p>

    return (
        <div className="p-6 space-y-4">
            {/* Karta sprzętu */}
            <div className="bg-gray-100 p-4 rounded-md">
                <h1 className="text-2xl font-bold">Karta sprzętu</h1>
                <h2 className="text-xl font-bold">{equipment.name}</h2>
                <p>{equipment.business} {equipment.type}</p>
                <p>Lokalizacja: {equipment.location}</p>
                <p>Numer seryjny: {equipment.serialNumber}</p>
                <p>Numer inwentarzowy: {equipment.inventoryNumber}</p>
                <p>Data zakupu: {equipment.dateOfPurchase}</p>
                <p>Firma z której zakupiono sprzęt: {equipment.sellingCompany}</p>
                <p>Gwarancja do: {equipment.warranty}</p>
            </div>
            <h1 className="text-xl font-bold text-center">Historia napraw</h1>
            {/* Opcje paginacji i wyszukiwania */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <label htmlFor="itemsPerPage">Items per page:</label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                        className="border p-1"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                    </select>
                </div>
                <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border p-1"
                />
                
            </div>
            {/* Stworzenie tabeli z historią napraw urządzenia */}
            <Table className="mt-4">
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bold" onClick={() => handleSort("date")}>Data {sortConfig?.key === "date" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</TableHead>
                        <TableHead className="font-bold" onClick={() => handleSort("location")}>Lokalizacja {sortConfig?.key === "location" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</TableHead>
                        <TableHead className="font-bold" onClick={() => handleSort("description")}>Opis {sortConfig?.key === "description" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</TableHead>
                        <TableHead className="font-bold" onClick={() => handleSort("cost")}>Koszt {sortConfig?.key === "cost" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}</TableHead>
                        <TableHead className="font-bold">Akcje</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentRepairs.map((repair) => (
                        <TableRow key={repair.id}>
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

            {/* Paginacja strony */}
            <div className="flex justify-between items-center mt-4">
                <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                <span>Page {currentPage} of {totalPages}</span>
                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
            </div>

            <div className="mt-4">
                <Button onClick={handleExportPDF} className="mr-2 btn btn-destructive font-bold">Export to PDF</Button>
                <Button onClick={handleExportExcel} className="mr-2 btn btn-edit font-bold">Export to Excel</Button>
                <Button className="btn btn-primary font-bold"><a href={`/equipment/${id}/add-repair`}>Dodaj awarię</a></Button>
                <Button><a href={`/equipment/${id}/meters`}>Liczniki drukarki</a></Button>
                {equipment?.name.toLowerCase().includes("drukarka") && (
                    <Button onClick={() => router.push(`/equipment/${id}/toner-exchange`)}
                    >
                        Wymień toner
                    </Button>
                )}
            </div>
        </div>
    );
};

