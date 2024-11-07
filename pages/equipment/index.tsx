import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";


type EquipmentItem = {
    id: string;
    business: string;
    name: string;
    type: string;
    serialNumber: string;
    location: string;
    inventoryNumber: string;
    dateOfPurchase: string;
    sellingCompany: string;
    warranty: string;
};


const EquipmentList = () => {
    const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
    const [filteredEquipments, setFilteredEquipments] = useState<EquipmentItem[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: keyof EquipmentItem; direction: "asc" | "desc" } | null>(null);


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

    useEffect(() => {
        let filteredData = equipment.filter((equipments) =>
            equipments.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) || equipments.type.toLowerCase().includes(searchQuery.toLowerCase()) || equipments.business.toLowerCase().includes(searchQuery.toLowerCase())
        );

        //sortowanie w zaleznosci od konfiguracji sortowania
        if (sortConfig) {
            filteredData = filteredData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (typeof aValue === "string" && typeof bValue ==="string") {
                    return sortConfig.direction === "asc"
                        ? aValue.localeCompare(bValue)
                        : bValue.localeCompare(aValue);
                }
                return 0;
            });
        }

        //ustawienia paginacji
        const calculatedTotalPages = Math.ceil(filteredData.length / itemsPerPage);
        setTotalPages(calculatedTotalPages);

        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
        setFilteredEquipments(paginatedData);
    }, [equipment, searchQuery, itemsPerPage, sortConfig, currentPage]);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        autoTable(doc, {
            startY: 40,
            head: [["Typ urządzenia", "Nazwa firmy", "Model", "Numer seryjny", "Lokalizacja"]],
            body: equipment.map((equipments) => [equipments.name, equipments.business, equipments.type, equipments.serialNumber, equipments.location])
        });
        doc.save(`lista_urzadzen.pdf`);
    };

    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(equipment);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Equipments");
        XLSX.writeFile(wb, `lista_urzadzen.xlsx`);
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages){
            setCurrentPage(newPage);
        }
    };

    const handleSort = (key: keyof EquipmentItem) => {
        setSortConfig((prevSortConfig) => {
            if (prevSortConfig?.key === key) {
                return { key, direction: prevSortConfig.direction === "asc" ? "desc" : "asc" };
            }
            return { key, direction: "asc" };
        });
    };

    return (
        <div>
            
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


                    <Table className="w-full border border-gray-300">
                        <TableHeader>
                            <TableRow className="bg-gray-200 ">
                                <TableHead className="font-bold p-2 text-center align-middle" onClick={() => handleSort("name")}>Name of device</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle" onClick={() => handleSort("business")}>Business</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle" onClick={() => handleSort("type")}>Model</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle" onClick={() => handleSort("serialNumber")}>Serial Number</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle" onClick={() => handleSort("location")}>Location</TableHead>
                                <TableHead className="font-bold p-2 text-center align-middle">Modify</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEquipments.map(item => (
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

                    {/* Paginacja strony */}
                    <div className="flex justify-between items-center mt-4">
                        <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
                    </div>
                    
                    <div className="mt-4">
                        <Button onClick={handleExportPDF} className="mr-2 btn btn-destructive font-bold">Export to PDF</Button>
                        <Button onClick={handleExportExcel} className="mr-2 btn btn-edit font-bold">Export to Excel</Button>
                        <Button className="btn btn-edit font-bold"><a href={`/equipment/add`}>Add Printer</a></Button>    
                    </div>


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