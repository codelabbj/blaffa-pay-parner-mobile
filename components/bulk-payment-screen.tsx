"use client"

import { useState, useEffect, useRef } from "react"
import {
    ArrowLeft,
    Plus,
    Trash2,
    Upload,
    Download,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronRight,
    ChevronLeft,
    X,
    History,
    Send,
    AlertTriangle,
    Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { useTheme, useTranslation } from "@/lib/contexts"
import { authService } from "@/lib/auth"
import { bulkPaymentService, BulkNetwork, BulkTransaction, BulkHistoryItem } from "@/lib/bulk-payments"
import { formatNumberWithSpaces } from "@/lib/utils"
import { toast } from "sonner"
import * as XLSX from 'xlsx'

interface BulkPaymentScreenProps {
    onNavigateBack: () => void
}

interface RowErrors {
    amount?: string
    recipient_phone?: string
    network_uid?: string
}

interface RowData {
    id: string
    amount: string
    recipient_phone: string
    network_uid: string
    objet: string
    isValid: boolean
    errors: RowErrors
}

export function BulkPaymentScreen({ onNavigateBack }: BulkPaymentScreenProps) {
    const [view, setView] = useState<"create" | "history">("create")
    const { theme } = useTheme()
    const { t } = useTranslation()
    const accessToken = authService.getAccessToken()

    const [networks, setNetworks] = useState<BulkNetwork[]>([])
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Creation State
    const [rows, setRows] = useState<RowData[]>([])
    const [createPage, setCreatePage] = useState(1)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const createItemsPerPage = 10
    const totalCreatePages = Math.ceil(rows.length / createItemsPerPage)
    const startIndex = (createPage - 1) * createItemsPerPage
    const paginatedRows = rows.slice(startIndex, startIndex + createItemsPerPage)

    // History State
    const [historyItems, setHistoryItems] = useState<BulkHistoryItem[]>([])
    const [historyPage, setHistoryPage] = useState(1)
    const [totalHistoryItems, setTotalHistoryItems] = useState(0)
    const [historyLoading, setHistoryLoading] = useState(false)
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<BulkHistoryItem | null>(null)

    // Initialization
    useEffect(() => {
        if (accessToken) {
            fetchData()
        }
    }, [accessToken])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await bulkPaymentService.getAuthorizedNetworks(accessToken!)
            const authorizedNetworks = response.networks
            setNetworks(authorizedNetworks)
            setIsAuthorized(authorizedNetworks.length > 0)

            // Initialize creation rows if authorized
            if (authorizedNetworks.length > 0) {
                initializeRows()
            }
        } catch (error) {
            console.error("Failed to fetch bulk payment data:", error)
            setIsAuthorized(false)
            toast.error("Échec de la vérification des autorisations")
        } finally {
            setIsLoading(false)
        }
    }

    const initializeRows = () => {
        const initialRows = Array.from({ length: 5 }, (_, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            amount: "",
            recipient_phone: "",
            network_uid: "",
            objet: "",
            isValid: false,
            errors: {}
        }))
        setRows(initialRows)
    }

    // Row Management
    const addRow = () => {
        const newRow = {
            id: Math.random().toString(36).substr(2, 9),
            amount: "",
            recipient_phone: "",
            network_uid: "",
            objet: "",
            isValid: false,
            errors: {}
        }
        setRows([...rows, newRow])

        // Navigate to the next page if this row starts it
        const newTotalPages = Math.ceil((rows.length + 1) / createItemsPerPage)
        if (newTotalPages > totalCreatePages) {
            setCreatePage(newTotalPages)
        }
    }

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter(r => r.id !== id))
        } else {
            setRows([{
                id: Math.random().toString(36).substr(2, 9),
                amount: "",
                recipient_phone: "",
                network_uid: "",
                objet: "",
                isValid: false,
                errors: {}
            }])
        }
    }

    const updateRow = (id: string, field: keyof RowData, value: string) => {
        setRows(rows.map(row => {
            if (row.id === id) {
                const updatedRow = { ...row, [field]: value }
                const { isValid, errors } = validateRow(updatedRow)
                return { ...updatedRow, isValid, errors }
            }
            return row
        }))
    }

    const validateRow = (row: RowData) => {
        const errors: RowErrors = {}

        // Skip validation if entirely empty
        if (!row.amount && !row.recipient_phone && !row.network_uid) {
            return { isValid: false, errors: {} }
        }

        if (!row.amount) {
            errors.amount = "Montant requis"
        } else if (isNaN(Number(row.amount)) || Number(row.amount) <= 0) {
            errors.amount = "Montant invalide"
        }

        if (!row.recipient_phone) {
            errors.recipient_phone = "Téléphone requis"
        } else if (row.recipient_phone.length < 10) {
            errors.recipient_phone = "Min. 10 chiffres"
        }

        if (!row.network_uid) {
            errors.network_uid = "Réseau requis"
        }

        if (!errors.amount && !errors.network_uid && row.amount && row.network_uid) {
            const network = networks.find(n => n.uid === row.network_uid)
            if (network) {
                const amount = Number(row.amount)
                if (network.min_montant && amount < network.min_montant) {
                    errors.amount = `Min: ${formatNumberWithSpaces(network.min_montant)} FCFA`
                } else if (network.max_montant && amount > network.max_montant) {
                    errors.amount = `Max: ${formatNumberWithSpaces(network.max_montant)} FCFA`
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    // Excel Import
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer)
                const workbook = XLSX.read(data, { type: 'array' })
                const sheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[sheetName]
                const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

                if (jsonData.length === 0) {
                    toast.error("Le fichier Excel est vide")
                    return
                }

                const newRows: RowData[] = jsonData.map(item => {
                    // Intelligent matching for headers based on template
                    const amountKey = Object.keys(item).find(k => /montant|amount|valeur/i.test(k))
                    const phoneKey = Object.keys(item).find(k => /phone|téléphone|numéro|numero|recipient/i.test(k))
                    const networkKey = Object.keys(item).find(k => /network|réseau|reseau|opérateur/i.test(k))
                    const objetKey = Object.keys(item).find(k => /objet|description|motif/i.test(k))

                    const rawNetwork = item[networkKey || ""]?.toString().trim().toLowerCase() || ""

                    // Prioritize exact code match, then fallback to name includes
                    const matchedNetwork = networks.find(n =>
                        n.code.toLowerCase() === rawNetwork ||
                        n.nom.toLowerCase() === rawNetwork ||
                        n.nom.toLowerCase().includes(rawNetwork) ||
                        rawNetwork.includes(n.code.toLowerCase())
                    )

                    const row = {
                        id: Math.random().toString(36).substr(2, 9),
                        amount: item[amountKey || ""]?.toString() || "",
                        recipient_phone: item[phoneKey || ""]?.toString().replace(/\s/g, "") || "",
                        network_uid: matchedNetwork?.uid || "",
                        objet: item[objetKey || ""]?.toString() || "Bulk Transfer",
                        isValid: false,
                        errors: {}
                    }
                    const { isValid, errors } = validateRow(row)
                    row.isValid = isValid
                    row.errors = errors
                    return row
                })

                setRows(prev => [...prev.filter(r => r.amount || r.recipient_phone), ...newRows])
                toast.success(`${newRows.length} lignes importées avec succès`)
            } catch (err) {
                console.error("Excel parsing error:", err)
                toast.error("Erreur lors de la lecture du fichier Excel")
            }
        }
        reader.readAsArrayBuffer(file)
    }

    // Submission
    const handleSubmit = async () => {
        const validRows = rows.filter(r => r.isValid)
        if (validRows.length === 0) {
            toast.error("Veuillez remplir au moins une ligne valide")
            return
        }

        setShowConfirmation(true)
    }

    const confirmSubmit = async () => {
        setIsSubmitting(true)
        try {
            const payload = {
                transactions: rows.filter(r => r.isValid).map(r => ({
                    amount: r.amount,
                    recipient_phone: r.recipient_phone,
                    network: r.network_uid,
                    objet: r.objet,
                    external_id: null
                }))
            }

            await bulkPaymentService.submitBulkPayment(accessToken!, payload)
            toast.success("Paiement groupé soumis avec succès")
            setShowConfirmation(false)
            initializeRows() // Clear rows
            setView("history") // Switch to history to track
            fetchHistory(1)
        } catch (error: any) {
            toast.error(error.message || "Échec de la soumission")
        } finally {
            setIsSubmitting(false)
        }
    }

    // History Fetching
    const fetchHistory = async (page: number) => {
        setHistoryLoading(true)
        try {
            const response = await bulkPaymentService.getBulkHistory(accessToken!, { page, page_size: 10 })
            setHistoryItems(response.results)
            setTotalHistoryItems(response.count)
            setHistoryPage(page)
        } catch (error) {
            console.error("History fetch error:", error)
            toast.error("Impossible de charger l'historique")
        } finally {
            setHistoryLoading(false)
        }
    }

    useEffect(() => {
        if (view === "history" && accessToken) {
            fetchHistory(1)
        }
    }, [view, accessToken])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                <p className="text-sm opacity-70">Vérification des accès...</p>
            </div>
        )
    }

    if (isAuthorized === false) {
        return (
            <div className="min-h-screen flex flex-col p-4">
                <div className="flex items-center gap-4 mb-8 pt-12">
                    <Button variant="ghost" size="icon" onClick={onNavigateBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold">Paiement Groupé</h1>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
                        <X className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Accès Non Autorisé</h2>
                    <p className="text-muted-foreground mb-8">
                        Vous n'avez pas l'autorisation d'utiliser le système de paiement groupé.
                        Veuillez contacter votre administrateur pour obtenir les droits nécessaires.
                    </p>
                    <Button onClick={onNavigateBack} className="w-full max-w-xs rounded-xl">
                        Retour au Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    const totalAmount = rows.reduce((sum, r) => sum + (r.isValid ? Number(r.amount) : 0), 0)
    const totalCount = rows.filter(r => r.isValid).length

    return (
        <div className={`min-h-screen flex flex-col ${theme === "dark"
            ? "bg-slate-900 text-white"
            : "bg-gray-50 text-gray-900"
            }`}>
            {/* Top Header */}
            <div className="px-4 pt-12 pb-4 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-opacity-80">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNavigateBack}
                        className="rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Paiement Groupé</h1>
                        <p className="text-xs opacity-60">
                            {view === "create" ? "Nouvelle transaction" : "Historique des dépôts"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView(view === "create" ? "history" : "create")}
                    className="rounded-xl gap-2 text-xs"
                >
                    {view === "create" ? (
                        <>
                            <History className="w-3.5 h-3.5" />
                            Historique
                        </>
                    ) : (
                        <>
                            <Plus className="w-3.5 h-3.5" />
                            Nouveau
                        </>
                    )}
                </Button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto pb-24">
                {view === "create" ? (
                    <div className="space-y-6">
                        {/* Quick Actions Card */}
                        <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                            <CardContent className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/5 dark:from-blue-500/20 dark:to-indigo-500/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                                            <FileSpreadsheet className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Import Intelligent</p>
                                            <p className="text-xs opacity-60">Excel ou CSV supportés</p>
                                        </div>
                                    </div>
                                    <label className="cursor-pointer">
                                        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2">
                                            <Upload className="w-3.5 h-3.5" />
                                            Choisir Fichier
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx, .xls, .csv"
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>
                            </CardContent>
                        </Card>

                        {/* List of Rows */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold opacity-60 uppercase tracking-wider">Destinataires</h2>
                                <div className="flex gap-2 text-xs font-medium px-2 py-1 bg-blue-500/10 rounded-lg text-blue-500">
                                    {totalCount}/{rows.length} valides
                                </div>
                            </div>

                            <div className="space-y-3">
                                {paginatedRows.map((row, index) => {
                                    const actualIndex = startIndex + index
                                    return (
                                        <Card key={row.id} className={`rounded-2xl border-none shadow-sm transition-all ${row.isValid ? "ring-2 ring-emerald-500/20" : ""
                                            }`}>
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold opacity-30">#{actualIndex + 1}</span>
                                                    <div className="flex gap-2">
                                                        {!row.isValid && (row.amount || row.recipient_phone) && (
                                                            <AlertCircle className="w-4 h-4 text-amber-500" />
                                                        )}
                                                        <button onClick={() => removeRow(row.id)} className="text-red-500 opacity-40 hover:opacity-100">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px]">Téléphone</Label>
                                                        <Input
                                                            value={row.recipient_phone}
                                                            onChange={(e) => updateRow(row.id, "recipient_phone", e.target.value)}
                                                            placeholder="0700000000"
                                                            className={`rounded-xl h-10 text-sm ${row.errors.recipient_phone ? "border-red-500 bg-red-50/10" : ""}`}
                                                        />
                                                        {row.errors.recipient_phone && (
                                                            <p className="text-[9px] text-red-500 font-bold ml-1">{row.errors.recipient_phone}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px]">Montant (FCFA)</Label>
                                                        <Input
                                                            value={row.amount}
                                                            onChange={(e) => updateRow(row.id, "amount", e.target.value)}
                                                            placeholder="Min 500"
                                                            className={`rounded-xl h-10 text-sm ${row.errors.amount ? "border-red-500 bg-red-50/10" : ""}`}
                                                            type="number"
                                                        />
                                                        {row.errors.amount && (
                                                            <p className="text-[9px] text-red-500 font-bold ml-1">{row.errors.amount}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px]">Réseau</Label>
                                                        <Select
                                                            value={row.network_uid}
                                                            onValueChange={(val) => updateRow(row.id, "network_uid", val)}
                                                        >
                                                            <SelectTrigger className={`rounded-xl h-10 text-sm ${row.errors.network_uid ? "border-red-500 bg-red-50/10" : ""}`}>
                                                                <SelectValue placeholder="Choisir" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl">
                                                                {networks.map(n => (
                                                                    <SelectItem key={n.uid} value={n.uid} className="text-sm">
                                                                        {n.nom} ({n.code})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {row.errors.network_uid && (
                                                            <p className="text-[9px] text-red-500 font-bold ml-1">{row.errors.network_uid}</p>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Label className="text-[10px]">Objet</Label>
                                                        <Input
                                                            value={row.objet}
                                                            onChange={(e) => updateRow(row.id, "objet", e.target.value)}
                                                            placeholder="Description"
                                                            className="rounded-xl h-10 text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>

                            {/* Pagination for Creation */}
                            {totalCreatePages > 1 && (
                                <div className="flex items-center justify-center gap-4 py-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={createPage === 1}
                                        onClick={() => setCreatePage(createPage - 1)}
                                        className="rounded-xl"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <span className="text-xs font-bold">
                                        Page {createPage} sur {totalCreatePages}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={createPage >= totalCreatePages}
                                        onClick={() => setCreatePage(createPage + 1)}
                                        className="rounded-xl"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                onClick={addRow}
                                className="w-full rounded-2xl h-12 border-dashed border-2 opacity-60 hover:opacity-100 gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter une ligne
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* History View */
                    <div className="space-y-4">
                        {historyLoading && historyItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : historyItems.length > 0 ? (
                            <>
                                {historyItems.map((item) => (
                                    <Card
                                        key={item.uid}
                                        className="rounded-2xl border-none shadow-sm overflow-hidden"
                                        onClick={() => setSelectedHistoryItem(item)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        item.status === 'failed' ? 'bg-red-500/10 text-red-500' :
                                                            'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                                    </div>
                                                    <span className="text-[10px] opacity-40 font-mono">#{item.uid.split('-')[0]}</span>
                                                </div>
                                                <span className="text-[10px] opacity-40">
                                                    {new Date(item.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                                        <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{item.total_count} transactions</p>
                                                        <p className="text-[10px] opacity-60">Réussis: {item.succeeded_count} / {item.total_count}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-black text-sm">{formatNumberWithSpaces(item.total_amount)} FCFA</p>
                                                    <p className="text-[10px] opacity-60">Progression: {item.progress_percent}%</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${item.status === 'completed' ? 'bg-emerald-500' :
                                                        item.status === 'failed' ? 'bg-red-500' :
                                                            'bg-blue-500'
                                                        }`}
                                                    style={{ width: `${item.progress_percent}%` }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Pagination */}
                                <div className="flex items-center justify-center gap-4 py-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={historyPage === 1 || historyLoading}
                                        onClick={() => fetchHistory(historyPage - 1)}
                                        className="rounded-xl"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <span className="text-xs font-bold">
                                        Page {historyPage} sur {Math.ceil(totalHistoryItems / 10)}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={historyPage >= Math.ceil(totalHistoryItems / 10) || historyLoading}
                                        onClick={() => fetchHistory(historyPage + 1)}
                                        className="rounded-xl"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                <History className="w-12 h-12 mb-4" />
                                <p className="text-sm font-bold">Aucun historique trouvé</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Floating Action Button for View 1 */}
            {view === "create" && (
                <div className={`fixed bottom-0 left-0 right-0 p-4 border-t ${theme === "dark" ? "bg-slate-900/80 border-slate-800" : "bg-white/80 border-gray-100"
                    } backdrop-blur-md z-30`}>
                    <div className="max-w-md mx-auto flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-[10px] opacity-60 font-medium">Total Estimé</p>
                            <p className="font-black text-lg">{formatNumberWithSpaces(totalAmount.toString())} FCFA</p>
                        </div>
                        <Button
                            disabled={totalCount === 0}
                            onClick={handleSubmit}
                            className="px-8 rounded-2xl h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 shadow-lg shadow-blue-500/20"
                        >
                            Suivant
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
                <DialogContent className="rounded-3xl max-w-[90vw] p-6 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Confirmer le Dépôt</DialogTitle>
                        <DialogDescription>
                            Vous allez traiter {totalCount} transactions pour un montant total de
                            <span className="font-bold text-foreground"> {formatNumberWithSpaces(totalAmount.toString())} FCFA</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[300px] overflow-y-auto my-4 space-y-2 pr-2 custom-scrollbar">
                        {rows.filter(r => r.isValid).map((row) => {
                            const network = networks.find(n => n.uid === row.network_uid)
                            return (
                                <div key={row.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center border border-gray-100 dark:border-slate-600 text-[10px] font-bold uppercase overflow-hidden">
                                            {network?.image ? <img src={network.image} className="w-full h-full object-cover" /> : network?.code}
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold">{row.recipient_phone}</p>
                                            <p className="text-[10px] opacity-60">{network?.nom}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs font-black">{formatNumberWithSpaces(row.amount)} FCFA</p>
                                </div>
                            )
                        })}
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-[10px] leading-relaxed">
                            Les transactions seront traitées de manière asynchrone. Vous pourrez suivre l'état de chaque transaction dans l'historique.
                        </p>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmation(false)}
                            className="rounded-xl h-11"
                        >
                            Annuler
                        </Button>
                        <Button
                            disabled={isSubmitting}
                            onClick={confirmSubmit}
                            className="rounded-xl h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lancer le traitement"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Details View Modal */}
            <Dialog open={!!selectedHistoryItem} onOpenChange={() => setSelectedHistoryItem(null)}>
                <DialogContent className="rounded-3xl max-w-[90vw] p-6 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Détails de la Transaction</DialogTitle>
                    </DialogHeader>

                    {selectedHistoryItem && (
                        <div className="space-y-4 pt-2">
                            <div className="text-center pb-4">
                                <div className={`w-16 h-16 rounded-3xl mx-auto mb-3 flex items-center justify-center ${selectedHistoryItem.status === 'completed' ? 'bg-emerald-500/10' :
                                    selectedHistoryItem.status === 'failed' ? 'bg-red-500/10' :
                                        'bg-amber-500/10'
                                    }`}>
                                    {selectedHistoryItem.status === 'completed' ? <CheckCircle2 className="w-8 h-8 text-emerald-500" /> :
                                        selectedHistoryItem.status === 'failed' ? <X className="w-8 h-8 text-red-500" /> :
                                            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />}
                                </div>
                                <h3 className="font-black text-2xl">{formatNumberWithSpaces(selectedHistoryItem.total_amount)} <span className="text-sm font-normal opacity-60">FCFA</span></h3>
                                <p className={`text-xs font-bold uppercase mt-1 tracking-widest ${selectedHistoryItem.status === 'completed' ? 'text-emerald-500' :
                                    selectedHistoryItem.status === 'failed' ? 'text-red-500' :
                                        'text-amber-500'
                                    }`}>
                                    {selectedHistoryItem.status.toUpperCase()} ({selectedHistoryItem.progress_percent}%)
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-xs opacity-60">UID Lot</span>
                                    <span className="text-xs font-mono font-bold">{selectedHistoryItem.uid}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-xs opacity-60">Total Transactions</span>
                                    <span className="text-xs font-bold">{selectedHistoryItem.total_count}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-xs opacity-60">Réussis</span>
                                    <span className="text-xs font-bold text-emerald-500">{selectedHistoryItem.succeeded_count}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-xs opacity-60">Échoués</span>
                                    <span className="text-xs font-bold text-red-500">{selectedHistoryItem.failed_count}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-xs opacity-60">Traités</span>
                                    <span className="text-xs font-bold">{selectedHistoryItem.processed_count} / {selectedHistoryItem.total_count}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-xs opacity-60">Montant Réussi</span>
                                    <span className="text-xs font-bold text-emerald-500">{formatNumberWithSpaces(selectedHistoryItem.succeeded_amount)} FCFA</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                    <span className="text-xs opacity-60">Date Création</span>
                                    <span className="text-xs font-bold">{new Date(selectedHistoryItem.created_at).toLocaleString()}</span>
                                </div>
                                {selectedHistoryItem.started_at && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                        <span className="text-xs opacity-60">Date Début</span>
                                        <span className="text-xs font-bold">{new Date(selectedHistoryItem.started_at).toLocaleString()}</span>
                                    </div>
                                )}
                                {selectedHistoryItem.completed_at && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800">
                                        <span className="text-xs opacity-60">Date Fin</span>
                                        <span className="text-xs font-bold">{new Date(selectedHistoryItem.completed_at).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-6">
                        <Button onClick={() => setSelectedHistoryItem(null)} className="w-full rounded-2xl h-11 font-bold">
                            Fermer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
