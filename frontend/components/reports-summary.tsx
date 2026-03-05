"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle, Clock, Check, ArrowLeft, User, FileText, ShieldAlert, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ApiReport = {
  id: number
  orderId?: number | null
  reporterId: number
  reportedId: number
  issueType: string
  description: string
  evidenceUrls?: string[] | null
  status: string
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"
  createdAt?: string
  resolvedAt?: string | null
  adminId?: number | null
  adminRemarks?: string | null
  actionTaken?: string | null
}

interface Report {
  id: number
  reporter: string
  reportedUser: string
  reason: string
  status: "pending" | "in-progress" | "resolved"
  date: string
  riskLevel?: "LOW" | "MEDIUM" | "HIGH"
  details: string
  evidence?: string[]
}

function normalizeStatus(s: string): Report["status"] {
  const v = (s || "").toUpperCase()
  if (v === "RESOLVED") return "resolved"
  if (v === "IN_PROGRESS" || v === "IN-PROGRESS") return "in-progress"
  return "pending"
}

function formatDate(iso?: string) {
  if (!iso) return ""
  return iso.slice(0, 10)
}

export function ReportsSummary() {
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Evidence Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)

  // Resolution Modal State
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [resolvingId, setResolvingId] = useState<number | null>(null)
  const [resolutionData, setResolutionData] = useState({
    remarks: "",
    action: ""
  })

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
  const zoomIn = () => setZoom((z) => clamp(Number((z + 0.2).toFixed(2)), 0.2, 4))
  const zoomOut = () => setZoom((z) => clamp(Number((z - 0.2).toFixed(2)), 0.2, 4))
  const resetZoom = () => setZoom(1)

  useEffect(() => {
    if (previewUrl) setZoom(1)
  }, [previewUrl])

  const API_BASE = process.env.NEXT_PUBLIC_MODERATION_API_BASE ?? "http://localhost:8080"

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const token = sessionStorage.getItem("token"); 

        const res = await fetch(`${API_BASE}/api/v1/moderation/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        });
        if (!res.ok) throw new Error(`Failed to load reports (${res.status})`);
        const data: ApiReport[] = await res.json();

        const userIds = Array.from(new Set([
          ...data.map(r => r.reporterId),
          ...data.map(r => r.reportedId)
        ]));

        const AUTH_API_BASE = "http://localhost:8080/auth"; 
        const nameRes = await fetch(`${AUTH_API_BASE}/fullnames?ids=${userIds.join(',')}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });
        
        let nameMap: Record<number, string> = {};
        if (nameRes.ok) {
          nameMap = await nameRes.json();
        }

        const mapped: Report[] = data.map((r) => ({
          id: r.id,
          reporter: nameMap[r.reporterId] || `User #${r.reporterId}`,
          reportedUser: nameMap[r.reportedId] || `User #${r.reportedId}`,
          reason: r.issueType?.replaceAll("_", " ") ?? "Unknown",
          status: normalizeStatus(r.status),
          date: formatDate(r.createdAt) || "",
          details: r.description ?? "",
          evidence: (r.evidenceUrls ?? []).filter(Boolean).map(String),
        }));

        if (!cancelled) setReports(mapped);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [API_BASE]);

  const handleResolveReport = async () => {
    if (!resolvingId) return

    try {
      const adminId = 1 
      const token = sessionStorage.getItem("token")

      const res = await fetch(
        `http://localhost:8080/api/v1/moderation/resolve/${resolvingId}?adminId=${adminId}&remarks=${encodeURIComponent(resolutionData.remarks)}&action=${encodeURIComponent(resolutionData.action)}`,
        {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      )

      if (!res.ok) throw new Error(`Resolve failed (${res.status})`)

      setReports((prev) => prev.map((r) => (r.id === resolvingId ? { ...r, status: "resolved" } : r)))
      if (selectedReport?.id === resolvingId) {
        setSelectedReport({ ...selectedReport, status: "resolved" })
      }

      setIsResolveDialogOpen(false)
      setResolutionData({ remarks: "", action: "" })
      setResolvingId(null)
    } catch (e: any) {
      alert(e?.message ?? "Resolve failed")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-orange-500" />
      case "in-progress": return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "resolved": return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-700"
      case "in-progress": return "bg-blue-100 text-blue-700"
      case "resolved": return "bg-green-100 text-green-700"
      default: return ""
    }
  }

  const filteredReports = useMemo(() => {
    if (activeTab === "all") return reports;
    return reports.filter(r => r.status === activeTab);
  }, [reports, activeTab]);

  const pendingCount = useMemo(() => reports.filter((r) => r.status === "pending").length, [reports])
  const progressCount = useMemo(() => reports.filter((r) => r.status === "in-progress").length, [reports])
  const resolvedCount = useMemo(() => reports.filter((r) => r.status === "resolved").length, [reports])

  if (loading) return <Card><CardContent className="pt-6 text-sm text-muted-foreground">Loading reports...</CardContent></Card>
  if (error) return <Card><CardContent className="pt-6 text-sm text-red-600">Error: {error}</CardContent></Card>

  return (
    <div className="space-y-6">
      {/* RESOLUTION MODAL WINDOW */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resolve Report #{resolvingId}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Action Taken</label>
              <select 
                className="w-full p-2 rounded-md border border-input bg-background text-sm"
                value={resolutionData.action}
                onChange={(e) => setResolutionData({...resolutionData, action: e.target.value})}
              >
                <option value="">Select an action...</option>
                <option value="WARNING_ISSUED">Warning Issued</option>
                <option value="USER_BANNED">User Banned</option>
                <option value="CONTENT_REMOVED">Content Removed</option>
                <option value="NO_ACTION_NEEDED">No Action Needed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Remarks</label>
              <textarea
                className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background text-sm"
                placeholder="Describe the resolution steps..."
                value={resolutionData.remarks}
                onChange={(e) => setResolutionData({...resolutionData, remarks: e.target.value})}
              />
            </div>
          </div>
          <CardFooter className="px-0 pb-0 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!resolutionData.action || !resolutionData.remarks}
              onClick={handleResolveReport}
            >
              Confirm Resolution
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>

      {selectedReport ? (
        <div className="space-y-6">
          <Button variant="ghost" className="pl-0 mb-2" onClick={() => setSelectedReport(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Reports List
          </Button>

          <Card className="border-border bg-card">
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                    Report #{selectedReport.id} Details
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Reported on {selectedReport.date}</p>
                </div>
                <Badge className={`${getStatusColor(selectedReport.status)} px-3 py-1 text-sm`}>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(selectedReport.status)}
                    {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                  </span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                    <User className="h-4 w-4" /> Reported User
                  </div>
                  <div className="text-lg font-medium">{selectedReport.reportedUser}</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                    <User className="h-4 w-4" /> Reported By
                  </div>
                  <div className="text-lg font-medium">{selectedReport.reporter}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Reason</h3>
                <div className="text-lg border-l-4 border-primary pl-4 py-1">{selectedReport.reason}</div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Description
                </h3>
                <div className="bg-muted/30 p-4 rounded-lg border leading-relaxed">{selectedReport.details}</div>
              </div>

              {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Evidence</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedReport.evidence.map((url, idx) => (
                      <button key={idx} onClick={() => setPreviewUrl(url)} className="rounded-lg border overflow-hidden bg-muted/20">
                        <img src={url} alt="Evidence" className="h-32 w-full object-cover hover:scale-105 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="bg-muted/10 border-t p-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedReport(null)}>Close</Button>
              {selectedReport.status !== "resolved" && (
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
                  onClick={() => { setResolvingId(selectedReport.id); setIsResolveDialogOpen(true); }}
                >
                  <Check className="h-4 w-4 mr-2" /> Mark as Resolved
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: "Pending", value: pendingCount, icon: Clock, color: "text-orange-600" },
              { label: "In Progress", value: progressCount, icon: AlertCircle, color: "text-blue-600" },
              { label: "Resolved", value: resolvedCount, icon: CheckCircle, color: "text-green-600" }
            ].map((item, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold">{item.value}</p>
                  </div>
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Reports Management</CardTitle>
              <Tabs defaultValue="all" className="w-[300px]" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Filter className="mb-2 h-10 w-10 opacity-20" />
                  <p>No {activeTab !== "all" ? activeTab : ""} reports found.</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div key={report.id} className="border-b pb-4 last:border-b-0 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{report.reportedUser}</h4>
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        {report.riskLevel && <Badge className={getStatusColor(report.riskLevel)}>{report.riskLevel}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Reporter: {report.reporter}</p>
                      <p className="text-sm text-muted-foreground">Reason: {report.reason}</p>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>View Details</Button>
                      {report.status !== "resolved" && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white" 
                          onClick={() => { setResolvingId(report.id); setIsResolveDialogOpen(true); }}
                        >
                          <Check className="h-4 w-4 mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Preview Sub-Dialog */}
<Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
  {/* Changed max-w-4xl to max-w-6xl and added w-[95vw] for better responsiveness */}
  <DialogContent className="max-w-7xl w-screen h-[90vh] flex flex-col">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        Evidence Preview
      </DialogTitle>
    </DialogHeader>
    
    <div className="flex justify-between mb-4">
      <div className="text-sm text-muted-foreground">
        Zoom: <span className="font-medium text-foreground">{Math.round(zoom * 100)}%</span>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={zoomOut}>-</Button>
        <Button variant="outline" size="sm" onClick={zoomIn}>+</Button>
        <Button variant="outline" size="sm" onClick={resetZoom}>Reset</Button>
      </div>
    </div>

    {/* Added flex-1 and overflow-auto to handle large images within the fixed height */}
    <div className="flex-1 overflow-auto flex justify-center items-center bg-muted/10 p-2 rounded border border-border">
      <img 
        src={previewUrl!} 
        alt="Preview" 
        style={{ 
          transform: `scale(${zoom})`, 
          transformOrigin: "center center",
          transition: "transform 0.2s ease-in-out" 
        }} 
        className="max-w-full h-auto" 
      />
    </div>
  </DialogContent>
</Dialog>
    </div>
  )
}