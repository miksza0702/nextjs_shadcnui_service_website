import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { db } from "../../../firebase";
import { collection, doc, getDocs, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type PageCount = {
    id: string;
    totalPrintedPages: number;
    totalCopiedPages: number;
    date: string;
};

const EquipmentMetersPage = () => {
    const router = useRouter();
    const { id } = router.query; // Equipment ID z URL-a
    const [pageCounts, setPageCounts] = useState<PageCount[]>([]);
    const [totalPagesPrinted, setTotalPagesPrinted] = useState(0);
    const [totalCopiedPages, setTotalCopiedPages] = useState(0);
    const [newTotalPrintedPages, setNewTotalPrintedPages] = useState<number | "">("");
    const [newTotalCopiedPages, setNewTotalCopiedPages] = useState<number | "">("");
    const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);


    // Pobierz dane liczników dla danej drukarki
    useEffect(() => {
        if (!id) return;            
        const pageCountsRef = collection(db, "equipment", id as string, "pageCounts");
        const orderedQuery = query(pageCountsRef, orderBy("date", "asc"));

        const unsubscribe = onSnapshot(orderedQuery, (snapshot) => {
            const counts = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as PageCount[];

            setPageCounts(counts);
            if (counts.length > 0) {
                setTotalPagesPrinted(counts[counts.length - 1].totalPrintedPages);
                setTotalCopiedPages(counts[counts.length - 1].totalCopiedPages);
            }
        });

        return () => unsubscribe();
    }, [id]);

    // Dodaj nowy licznik do drukarki
    const handleAddPageCount = async () => {
        if (!id || newTotalPrintedPages === "" || newTotalCopiedPages === "" || !newDate) return;

        if (newTotalPrintedPages < totalPagesPrinted){
            alert("Nowy licznik wydruków nie może być mniejszy niż poprzedni.");
            return;
        }

        if (newTotalCopiedPages < totalCopiedPages){
            alert("Nowy licznik kopii nie może być mniejszy niż poprzedni.");
            return;
        }
        try {
            const pageCountsRef = collection(db, "equipment", id as string, "pageCounts");
            await addDoc(pageCountsRef, {
                totalPrintedPages: newTotalPrintedPages,
                totalCopiedPages: newTotalCopiedPages,
                date: newDate,
            });
            setNewTotalPrintedPages("");
            setNewTotalCopiedPages("");
            setNewDate(new Date().toISOString().split("T")[0]);
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Błąd podczas dodawania liczników stron:", error);
        }
    };

    // Oblicz miesięczne różnice wydruków
    const calculateMonthlyDifferences = (type: "printed" | "copied") => {
        return pageCounts.map((count, index) => {
            if (index === 0) return 0;
            return type === "printed"
                ? count.totalPrintedPages - pageCounts[index - 1].totalPrintedPages
                : count.totalCopiedPages - pageCounts[index - 1].totalCopiedPages;
        });
    };

    //oblicz sumy i srednie dla roznych wykresow
    const calcualtePeriodStats = (months: number, type: "printed" | "copied") => {
        const currentDate = new Date();
        const cutoffDate = new Date(currentDate);
        cutoffDate.setMonth(currentDate.getMonth() - months);

        const filteredCounts = pageCounts.filter((count) => new Date(count.date) >= cutoffDate).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const monthlyDifferences = calculateMonthlyDifferences(type).slice(
            Math.max(pageCounts.length - months, 0)
        );

        const total = monthlyDifferences.reduce((acc, value) => acc + value, 0);
        const average = monthlyDifferences.length > 0 ? total /monthlyDifferences.length : 0;
        return { total, average: Math.round(average) };
    }

    // Przygotowanie danych do wykresu
    const chartData = {
        labels: pageCounts.slice(-12).map((count) => new Date(count.date).toLocaleDateString("pl-PL", { month: "short", year: "numeric" })),
        datasets: [
            {
                label: "Liczba stron wydrukowanych w danym miesiącu",
                data: calculateMonthlyDifferences("printed").slice(-12),
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
            },
            {
                label: "Liczba stron skerowanych w danym miesiącu",
                data: calculateMonthlyDifferences("copied").slice(-12),
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.2)",
            },
        ],
    };

    return (
        <div>
            <h1 className="text-xl font-bold mb-4">Licznik stron dla drukarki</h1>
            <Table className="w-full border border-gray-300 mb-4">
                <TableHeader>
                    <TableRow className="bg-gray-200">
                        <TableHead className="p-2 text-center">Data</TableHead>
                        <TableHead className="p-2 text-center">Licznik całkowity (wydruk)</TableHead>
                        <TableHead className="p-2 text-center">Licznik całkowity (kopia)</TableHead>
                        <TableHead className="p-2 text-center">Wydrukowane strony</TableHead>
                        <TableHead className="p-2 text-center">Skserowane strony</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pageCounts.map((count, index) => (
                        <TableRow key={count.id}>
                            <TableCell className="p-2 text-center">{new Date(count.date).toLocaleDateString("pl-PL")}</TableCell>
                            <TableCell className="p-2 text-center">{count.totalPrintedPages}</TableCell>
                            <TableCell className="p-2 text-center">{count.totalCopiedPages}</TableCell>
                            <TableCell className="p-2 text-center">
                                {index === 0 ? 0 : count.totalPrintedPages - pageCounts[index - 1].totalPrintedPages}
                            </TableCell>
                            <TableCell className="p-2 text-center">
                                {index === 0 ? 0 : count.totalCopiedPages - pageCounts[index - 1].totalCopiedPages}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Button onClick={() => setIsDialogOpen(true)}>Dodaj licznik</Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Dodaj nowy licznik</DialogTitle>
                        </DialogHeader>
                        <Input 
                            type="date"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="mb-4"
                        />
                        <Input 
                            type="number"
                            placeholder="Nowy licznik wydruków"
                            value={newTotalPrintedPages}
                            onChange={(e) => setNewTotalPrintedPages(parseInt(e.target.value))}
                            className="mb-2"
                        />
                        <Input 
                            type="number"
                            placeholder="Nowy licznik kopii"
                            value={newTotalCopiedPages}
                            onChange={(e) => setNewTotalCopiedPages(parseInt(e.target.value))}
                            className="mb-2"
                        />
                    <DialogFooter>
                        <Button onClick={handleAddPageCount}>Dodaj</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <h2 className="text-lg font-bold mt-8 mb-2">Wykres miesięcznych wydruków i kopii</h2>
            <div className="bg-white p-4 shadow-md rounded">
                    <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: "top"} }}} />
            </div>

            <h2 className="text-lg font-bold mt-8 mb-4">Statystyki</h2>
            <div className="space-y-4">
                    {[1, 3, 6, 12].map((months) => (
                        <div key={months} className="p-4 bg-gray-100 rounded">
                            <h3 className="font-bold">{months === 1 ? "Ostatni miesiąc" : `Ostaatnie ${months} miesiące`}</h3>
                            <p>Wydrukowane strony: {calcualtePeriodStats(months, "printed").total} (średnia miesięczna: {calcualtePeriodStats(months, "printed").average})</p>
                            <p>Skserowane strony: {calcualtePeriodStats(months, "copied").total} (średnia miesięczna: {calcualtePeriodStats(months, "copied").average})</p>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default EquipmentMetersPage;


