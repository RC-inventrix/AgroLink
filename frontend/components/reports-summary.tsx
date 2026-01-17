"use client"

import { useState } from "react"
import { AlertCircle, CheckCircle, Clock, Check, ArrowLeft, User, Calendar, FileText, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator" // Note: Separator eka nathnam div ekak use karamu ( පහල code eke man div ekak damme safe wenna)

// Report type eka define karamu (Typescript nisa)
interface Report {
  id: number;
  reporter: string;
  reportedUser: string;
  reason: string;
  status: string;
  date: string;
  details: string;
  // Thawa extra details onanam methana danna puluwan
  evidence?: string; 
}

export function ReportsSummary() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      reporter: "John Farmer",
      reportedUser: "Suspicious Buyer",
      reason: "Fraudulent payment",
      status: "pending",
      date: "2024-12-22",
      details: "User attempted to pay with invalid card. I have attached the screenshots of the chat.",
      evidence: "Chat_Screenshot_01.jpg",
    },
    {
      id: 2,
      reporter: "Market Admin",
      reportedUser: "Aggressive Seller",
      reason: "Abusive language",
      status: "resolved",
      date: "2024-12-21",
      details: "User used inappropriate language in chat section regarding a price negotiation.",
      evidence: "Chat_Log_Export.txt",
    },
    {
      id: 3,
      reporter: "Buyer Network",
      reportedUser: "Product Quality Issue",
      reason: "Unverified product quality",
      status: "in-progress",
      date: "2024-12-20",
      details: "Product photos appear to be fake and downloaded from Google images.",
      evidence: "Image_Comparison.pdf",
    },
  ])

  // Select karapu report eka thiyaganna state ekak
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const handleResolveReport = (reportId: number) => {
    if (confirm("Mark this issue as resolved?")) {
      setReports(reports.map((report) => 
        report.id === reportId ? { ...report, status: "resolved" } : report
      ));
      
      // Update selected report as well if it's open
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: "resolved" });
      }
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

  // --- DETAIL VIEW COMPONENT ---
  if (selectedReport) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent hover:text-primary mb-2" 
            onClick={() => setSelectedReport(null)}
        >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports List
        </Button>

        <Card className="border-border bg-card">
            <CardHeader className="border-b border-border pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                           <ShieldAlert className="h-5 w-5 text-muted-foreground"/>
                           Report #{selectedReport.id} Details
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Reported on {selectedReport.date}
                        </p>
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
                {/* User Details Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                            <User className="h-4 w-4" /> Reported User (Suspect)
                        </div>
                        <div className="text-lg font-medium text-foreground">{selectedReport.reportedUser}</div>
                        <div className="text-sm text-red-500 mt-1">Account Status: Under Review</div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-muted-foreground">
                            <User className="h-4 w-4" /> Reported By
                        </div>
                        <div className="text-lg font-medium text-foreground">{selectedReport.reporter}</div>
                        <div className="text-sm text-green-600 mt-1">Verified User</div>
                    </div>
                </div>

                {/* Reason & Details */}
                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Report Reason</h3>
                    <div className="text-foreground font-medium text-lg border-l-4 border-primary pl-4 py-1">
                        {selectedReport.reason}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                        <FileText className="h-4 w-4"/> Full Description
                    </h3>
                    <div className="bg-muted/30 p-4 rounded-lg border border-border text-foreground leading-relaxed">
                        {selectedReport.details}
                    </div>
                </div>
                
                {/* Evidence (Dummy) */}
                {selectedReport.evidence && (
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">Attached Evidence</h3>
                        <div className="flex items-center gap-3 p-3 border border-border rounded bg-muted/20 w-fit">
                            <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold text-xs">IMG</div>
                            <span className="text-sm underline cursor-pointer hover:text-primary">{selectedReport.evidence}</span>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="bg-muted/10 border-t border-border p-6 flex justify-end gap-3">
                 <Button variant="outline" onClick={() => setSelectedReport(null)}>
                    Close
                 </Button>
                 
                 {selectedReport.status !== 'resolved' && (
                    <Button 
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[150px]"
                        onClick={() => handleResolveReport(selectedReport.id)}
                    >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Resolved
                    </Button>
                 )}
            </CardFooter>
        </Card>
      </div>
    );
  }

  // --- MAIN LIST VIEW (Parana code eka tikak update karala) ---
  
  // Calculate dynamic stats based on current state
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const progressCount = reports.filter(r => r.status === 'in-progress').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Report Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Pending Reports", value: pendingCount, icon: Clock, color: "text-orange-600" },
          { label: "In Progress", value: progressCount, icon: AlertCircle, color: "text-blue-600" },
          { label: "Resolved", value: resolvedCount, icon: CheckCircle, color: "text-green-600" },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <Card key={idx} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${item.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Reports Table List */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{report.reportedUser}</h4>
                      <Badge className={getStatusColor(report.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(report.status)}
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-medium">Reporter:</span> {report.reporter}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Reason:</span> {report.reason}
                    </p>
                  </div>
                  
                  {/* --- ACTION BUTTONS --- */}
                  <div className="flex flex-col gap-2 ml-4">
                     <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setSelectedReport(report)} // Me line eken thama athulata yanne
                     >
                        View Details
                    </Button>

                    {report.status !== 'resolved' && (
                        <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white w-full"
                            onClick={() => handleResolveReport(report.id)}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            Resolve
                        </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}