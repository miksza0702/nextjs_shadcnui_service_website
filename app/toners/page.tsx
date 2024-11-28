"use client";
import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where, Query, CollectionReference, DocumentData } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogOverlay, DialogClose } from "@/components/ui/dialog";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

type TonerItem = {
    id: string;
    name: string;
    performance: string;
    quantity: string;
}

const TonerManagementPage = () => {
    const [tonerName, setTonerName] = useState<string>("");
    const [tonerPerformance, setTonerPerformance] = useState<number | "">("");
    const [tonerQuantity, setTonerQuantity] = useState<number | "">("");
    const [toners, setToners] = useState<any[]>([]);
    const [selectedToner, setSelectedToner] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<"edit" | "delete" | "adjustQuantity">("edit");
    const [timeRange, setTimeRange] = useState<string>("3");

    const [tonerExchanges, setTonerExchanges] = useState<any[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof TonerItem; direction: "asc" | "desc" } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedToners, setPaginatedToners] = useState<TonerItem[]>([]);
    const [totalPages, setTotalPages] = useState(1);

    const [targetDate, setTargetDate] = useState(new Date());
    const [tonerNeeds, setTonerNeeds] = useState<any[]>([]);



    //pobieramy dane o tonerach z naszej bazy
    useEffect(() => {
        const fetchToners = async () => {
            const querySnapshot = await getDocs(collection(db, "toners"));
            const items = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as TonerItem[];
            setToners(items);
        };

        const fetchTonerExchanges = async () => {
            const exchangesRef = collection(db, "tonerExchanges");
            const exchangesSnap = await getDocs(exchangesRef);
            const exchangesData = exchangesSnap.docs.map(doc => doc.data());
            setTonerExchanges(exchangesData);
        };
        

        fetchToners();
        fetchTonerExchanges();
    }, []);

    useEffect(() => {
        let filteredData = toners.filter((toner) => 
            toner.name.toLowerCase().includes(searchQuery.toLocaleLowerCase())
        );

        if(sortConfig) {
            filteredData = filteredData.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (typeof aValue === "string" && typeof bValue === "string") {
                    return sortConfig.direction === "asc"
                        ? String(aValue).localeCompare(bValue)
                        : String(bValue).localeCompare(aValue);
                }
                return 0;
            });
        }

        //ustawienie paginacji
        const calculatedTotalPages = Math.ceil(filteredData.length / itemsPerPage);
        setTotalPages(calculatedTotalPages);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
        setPaginatedToners(paginatedData);
    }, [toners, searchQuery, sortConfig, currentPage, itemsPerPage]);

    useEffect(() => {
        if (timeRange && targetDate) {
            const needs = calculateTonerNeeds(Number(timeRange), targetDate);
            setTonerNeeds(needs);
        }
    }, [timeRange, targetDate]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages){
            setCurrentPage(newPage);
        }
    };

    const handleSort = (key: keyof TonerItem) => {
        setSortConfig((prevConfig) => {
            if (prevConfig && prevConfig.key === key) {
                return {
                    key,
                    direction: prevConfig.direction === "asc" ? "desc" : "asc",
                };
            };
            return { key, direction: "asc" };
        });
    };

    //filtracja danych wymiany tonerow wedlug wybranego okresu
    const filterExchangesByTime = (months: number) => {
        const filteredExchanges = tonerExchanges.filter((exchange) => {
            const exchangeDate = new Date(exchange.exchangeDate);
            const currentDate = new Date();
            const diffMonths = (currentDate.getFullYear() - exchangeDate.getFullYear()) * 12 + currentDate.getMonth() - exchangeDate.getMonth();
            return diffMonths <= months;
        });
        return filteredExchanges;
    }

    //funkcja tworzenia danych do wykresu na podstawie tonerorw, ktore zostaly wydane
    const getTonerExchangesData = () => {
        const filteredExchanges = filterExchangesByTime(Number(timeRange));

        //grupowanie danych po nazwie tonera i robienie sumy ilosci wydanych tonerow
        const tonerStats = filteredExchanges.reduce((acc: any, exchange: any) => {
            if (!acc[exchange.tonerName]) {
                acc[exchange.tonerName] = 0;
            }
            acc[exchange.tonerName] += 1;
            return acc;
        }, {});

        return Object.entries(tonerStats).map(([tonerName, quantity]) => ({
            name: tonerName,
            quantity,
        }));
    };

    //funkcja tworzenia danych do wykresu - najczesniej wymieniany toner w drukarkach (po serialNumber)
    const getMostFrequentPrintersData = () => {
        const filteredExchanges = filterExchangesByTime(Number(timeRange));

        //grupowanie i sumowanie po numerze seryjnym
        const printerStats = filteredExchanges.reduce((acc: any, exchange: any) => {
            if (!acc[exchange.equipmentSerialNumber]) {
                acc[exchange.equipmentSerialNumber] = 0;
            }
            acc[exchange.equipmentSerialNumber] += 1;
            return acc;
        }, {});

        return Object.entries(printerStats).map(([serialNumber, exchanges]) => ({
            serialNumber,
            exchanges,
        }));
    };

    //dane do wykresu - wydane tonery
    const tonerExchangesData = getTonerExchangesData();
    const tonerExchangesChartData = {
        labels: tonerExchangesData.map((data) => data.name),
        datasets: [
            {
                label: "Ilość wydanych tonerów",
                data: tonerExchangesData.map((data) => data.quantity),
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                fill: true,
            },
        ],
    };

    //dane do wykresu - najczesciej wymieniany toner w drukarkach
    const printerExchangesData = getMostFrequentPrintersData();
    const printerExchangesChartData = {
        labels: printerExchangesData.map((data) => data.serialNumber),
        datasets: [
            {
                label: "Ilość wymian",
                data: printerExchangesData.map((data) => data.exchanges),
                borderColor: "rgba(153, 102, 255, 1)",
                backgroundColor: "rgba(153, 102, 255, 0.2)",
                fill: true,
            },
        ],
    };

    //obsluga zmiany zakresu czasu
    const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTimeRange(e.target.value);
    };

    //funkcja dodawania tonera do magazynu
    const handleAddToner = async () => {
        if (!tonerName || tonerPerformance === "" || tonerQuantity === "") return;

        try {
            const docRef = await addDoc(collection(db, "toners"), {
                name: tonerName,
                performance: tonerPerformance,
                quantity: tonerQuantity,
            });
            setToners([...toners, { id: docRef.id, name: tonerName, performance: tonerPerformance, quantity: tonerQuantity}]);
            setTonerName("");
            setTonerPerformance("");
            setTonerQuantity("");
        } catch (error) {
            console.error("Błąd dodawania toneru: ", error);
        }
    };

    // otwieranie modalu z odpowiednim trybem
    const openDialog = (toner: any, mode: "edit" | "delete" | "adjustQuantity") => {
        setSelectedToner(toner);
        setDialogMode(mode);
        setIsDialogOpen(true);
    };

    const handleUpdateToner = async () => {
        if (!selectedToner) return;

        try {
            const tonerRef = doc(db, "toners", selectedToner.id);
            await updateDoc(tonerRef, { name: selectedToner.name, performance: selectedToner.performance, quantity: selectedToner.quantity});
            setToners(toners.map(t => (t.id === selectedToner.id ? selectedToner : t)));
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Błąd podczas aktualizowania danych tonera:", error);
        }
    };

    const handleDeleteToner = async () => {
        if (!selectedToner) return;

        try {
            await deleteDoc(doc(db, "toners", selectedToner.id));
            setToners(toners.filter(t => t.id !== selectedToner.id));
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Problem z usunięciem tonera błąd:", error)
        }
    };

    const handleAdjustQuantity = async (amount: number) => {
        if (!selectedToner) return;

        try {
            const tonerRef = doc(db, "toners", selectedToner.id);
            await updateDoc(tonerRef, {quantity: selectedToner.quantity + amount });
            setToners(toners.map(t => (t.id === selectedToner.id ? { ...t, quantity: t.quantity + amount } : t )));
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Problem ze zmianą wielkości: ", error)
        }
    }

    const calculateTonerNeeds = (months: number, targetDate: Date) => {
        const filteredExchanges = filterExchangesByTime(months);

        const tonerStats = filteredExchanges.reduce((acc: any, exchange: any) => {
            if (!acc[exchange.tonerName]) {
                acc[exchange.tonerName] = 0;
            }
            acc[exchange.tonerName] += 1;
            return acc;
        }, {});

        const currentDate = new Date();
        const totalMonths = 
            (targetDate.getFullYear() - currentDate.getFullYear()) * 12 +
            (targetDate.getMonth() - currentDate.getMonth());
        
        const tonerNeeds = Object.entries(tonerStats).map(([tonerName, totalExchanges]) => {
            const averageMonthlyUsage = Math.ceil(Number(totalExchanges) / months); 
            const neededToners = Math.ceil(averageMonthlyUsage * totalMonths);
            
            const stock = toners.find((item) => item.name === tonerName);
            const quantity = stock?.quantity || 0;

            const mustBuy = Math.max(0, neededToners - quantity);

            return { tonerName, neededToners, quantity, mustBuy };
        });

        return tonerNeeds;
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Zarządzanie tonerami</h1>

            {/* Formularz do dodawania tonera */}
            <div className="space-y-4">
                <div>
                    <label className="block">Nazwa tonera</label>
                    <Input 
                        value={tonerName}
                        onChange={(e) => setTonerName(e.target.value)}
                        className="border p-2"
                        placeholder="Wprowadź nazwę tonera"
                    />
                </div>

                <div>
                    <label className="block">Wydajność tonera</label>
                    <Input 
                        value={tonerPerformance}
                        onChange={(e) => setTonerPerformance(Number(e.target.value))}
                        className="border p-2"
                        placeholder="Wprowadź nazwę tonera"
                    />
                </div>

                <div>
                    <label className="block">Ilość w magazynie</label>
                    <Input 
                        value={tonerQuantity}
                        onChange={(e) => setTonerQuantity(Number(e.target.value))}
                        className="border p-2"
                        placeholder="Wprowadź nazwę tonera"
                    />
                </div>

                <Button onClick={handleAddToner} className="bg-blue-500 text-white">Dodaj toner</Button>
            </div>

            {/* Opcje maginacji i wyszukiwania */}
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
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border p-1"
                    />
                </div>
            </div>

            {/* Tabela z zapasem tonerów */}
            <div className="mt-8">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nazwa tonera</TableHead>
                    <TableHead>Wydajność</TableHead>
                    <TableHead>Ilość w magazynie</TableHead>
                    <TableHead>Akcje</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedToners.map((toner) => (
                    <TableRow key={toner.id}>
                        <TableCell>{toner.name}</TableCell>
                        <TableCell>{toner.performance}</TableCell>
                        <TableCell>{toner.quantity}</TableCell>
                        <TableCell>
                            <Button onClick={() => openDialog(toner, "edit")}>Edycja</Button>
                            <Button onClick={() => openDialog(toner, "delete")}>Usuń</Button>
                            <Button onClick={() => openDialog(toner, "adjustQuantity")}>Dostosuj ilość</Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
                {/* Paginacja strony */}
                <div className="flex justify-between items-center mt-4">
                    <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                    <span>Page {currentPage} of {Math.ceil(toners.length / itemsPerPage)}</span>
                    <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === Math.ceil(toners.length / itemsPerPage)}>Next</Button>
                </div>

                {/* Modal dla róznych operacji */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogOverlay />
                    <DialogContent className="bg-white">
                        {selectedToner && dialogMode === "edit" && (
                            <>
                                <h2>Edycja tonera</h2>
                                <Input 
                                    value={selectedToner.name}
                                    onChange={(e) => setSelectedToner( {...selectedToner, name: e.target.value })}
                                />
                                <Input 
                                    type="number"
                                    value={selectedToner.performance}
                                    onChange={(e) => setSelectedToner({ ...selectedToner, performance: Number(e.target.value)})}
                                />
                                <Button onClick={handleUpdateToner}>Zapisz zmiany</Button>
                            </>
                        )}
                        {selectedToner && dialogMode === "delete" && (
                            <>
                                <h2>Usuwanie tonera</h2>
                                <p>Czy na pewno chcesz usunąć ten toner?</p>
                                <Button onClick={handleDeleteToner}>Tak usuń</Button>
                            </>
                        )}
                        {selectedToner && dialogMode === "adjustQuantity" && (
                            <>
                                <h2>Dostosuj ilość tonera</h2>
                                <Button onClick={() => handleAdjustQuantity(1)}>Zwiększ o 1</Button>
                                <Button onClick={() => handleAdjustQuantity(-1)}>Zmniejsz o 1</Button>
                            </>
                        )}
                        <DialogClose />
                    </DialogContent>
                </Dialog>
            </div>
            <div>
                <div className="mt-4">
                    <label className="block">Wybierz zakres czasowy</label>
                    <select 
                        value={timeRange}
                        onChange={handleTimeRangeChange}
                        className="border p-2"
                    >
                        <option value="3">3 miesiące</option>
                        <option value="6">6 miesiący</option>
                        <option value="12">12 miesiący</option>
                    </select>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl font-bold">Wydane tonery</h2>
                    <Line data={tonerExchangesChartData} options={{ responsive: true }} />

                    <h2 className="text-xl font-bold mt-8">Najczęsciej wymieniane tonery w drukarkach</h2>
                    <Line data={printerExchangesChartData} options={{ responsive: true }} />
                </div>
            </div>
            

            <div className="p-6 space-y-4">
                <h1 className="text-2xl font-bold">Prognoza zużycia tonerów</h1>
                <div className="space-y-4">
                    <div>
                        <label className="block">Zakres czasu (miesiące)</label>
                        <select 
                            value={timeRange}
                            onChange={handleTimeRangeChange}
                            className="border p-2"
                        >
                            <option value="3">Ostatnie 3 miesiące</option>
                            <option value="6">Ostatnie 6 miesięcy</option>
                            <option value="12">Ostatnie 12 miesięcy</option>
                        </select>
                    </div>
                    <div>
                        <label className="block">Data końcowa</label>
                        <Input 
                            type="date"
                            onChange={(e) => setTargetDate(new Date(e.target.value))}
                            className="border p-2"
                        />
                    </div>
                </div>
                <div>
                    {tonerNeeds.length > 0 && (
                        <>
                            <h2 className="text-lg font-bold">Potrzebne tonery</h2>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Toner</TableHead>
                                        <TableHead>Potrzebna liczba</TableHead>
                                        <TableHead>Stan na magyznie</TableHead>
                                        <TableHead>Musimy zakupić (tonerów)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tonerNeeds.map((toner) => (
                                        <TableRow key={toner.tonerName}>
                                            <TableCell>{toner.tonerName}</TableCell>
                                            <TableCell>{toner.neededToners}</TableCell>
                                            <TableCell>{toner.quantity}</TableCell>
                                            <TableCell>{toner.mustBuy}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </>
                    )}
                </div>

                <div>
                    {tonerNeeds.length > 0 && (
                        // <Line
                        //     data={{
                        //         labels: tonerNeeds.map((toner) => toner.tonerName),
                        //         datasets: [
                        //             {
                        //                 label: "Potrzebna liczba tonerów",
                        //                 data: tonerNeeds.map((toner) => toner.neededToners),
                        //                 borderColor: "rgba(54, 162, 235, 1)",
                        //                 backgroundColor: "rgba(54, 162, 235, 0.2)",
                        //                 fill: true,
                        //             },
                        //         ],
                        //     }}
                        //     options={{
                        //         responsive: true,
                        //         plugins: {
                        //             legend: {position: "top"},
                        //         }
                        //     }}
                        // />

                        <Bar
                            data={{
                                labels: tonerNeeds.map((toner) => toner.tonerName),
                                datasets: [
                                    {
                                        label: "Stan na magazynie",
                                        data: tonerNeeds.map((toner) => toner.quantity),
                                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                                        borderColor: "rgba(75, 192, 192, 1)",
                                        borderWidth: 1,
                                    },
                                    {
                                        label: "Muismy zakupić",
                                        data: tonerNeeds.map((toner) => toner.mustBuy),
                                        backgroundColor: "rgba(255, 99, 132, 0.6)",
                                        borderColor: "rgba(255, 99, 132, 1)",
                                        borderWidth: 1,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: "top",
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw}`,
                                        },
                                    },
                                },
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Nazwa tonerów",
                                        },
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: "Ilość",
                                        },
                                        beginAtZero: true,
                                    },
                                },
                            }}
                        />
                    )}
                </div>

            </div>
        </div>
    );
};

export default TonerManagementPage;