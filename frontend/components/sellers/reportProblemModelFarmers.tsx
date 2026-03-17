"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, Upload, AlertTriangle, X } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ISSUE_TYPES specifically for Farmers reporting Buyers
const ISSUE_TYPES = [
  { id: "PAYMENT_DELAY_OR_DEFAULT", label: "Payment Delay or Default" },
  { id: "UNFAIR_BARGAINING_AFTER_DELIVERY", label: "Price Change After Delivery" },
  { id: "GHOSTING_NON_COLLECTION", label: "Buyer Did Not Collect Produce" },
  { id: "UNAVAILABLE_ON_DELIVERY", label: "Buyer unavailable on delivery" }, 
  { id: "FRAUDULENT_ORDER", label: "Fake or Fraudulent Order" },
  { id: "OTHER", label: "Other Issues" },
];

export default function ReportBuyerModal({ orderId, reporterId, reportedId, isOpen, onClose }: any) {
  const [selectedIssue, setSelectedIssue] = useState("")
  const [details, setDetails] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) throw new Error("Cloudinary upload failed");
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (!selectedIssue || !details) {
      toast.error("Please select an issue and provide details.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadPromises = files.map(file => uploadToCloudinary(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      // Matches your existing moderation endpoint
      const response = await fetch(`${API_URL}/api/v1/moderation/user/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderId || null,
          reporterId,
          reportedId,
          issueType: selectedIssue,
          description: details,
          evidenceUrls: uploadedUrls 
        }),
      });

      if (response.ok) {
        toast.success("Buyer report submitted successfully!");
        onClose();
        setSelectedIssue("");
        setDetails("");
        setFiles([]);
      } else {
        throw new Error("Failed to save report");
      }
    } catch (error) {
      toast.error("Process failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white shadow-2xl border-none flex flex-col max-h-[90vh] overflow-hidden rounded-2xl animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="p-5 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle size={22} className="fill-orange-50" />
            <h3 className="font-bold text-lg text-gray-800">Report Buyer</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-orange-500 transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Select Issue Type</p>
            <div className="grid gap-2">
              {ISSUE_TYPES.map((issue) => (
                <label 
                  key={issue.id} 
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedIssue === issue.id 
                    ? 'border-orange-500 bg-orange-50/30' 
                    : 'hover:border-gray-200 border-gray-100 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="issueType" 
                    checked={selectedIssue === issue.id} 
                    onChange={() => setSelectedIssue(issue.id)} 
                    className="w-4 h-4 accent-orange-600" 
                  />
                  <span className={`text-sm font-semibold ${selectedIssue === issue.id ? 'text-orange-700' : 'text-gray-700'}`}>
                    {issue.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Description</p>
            <textarea 
              className="w-full p-4 border-2 border-gray-100 rounded-xl text-sm min-h-[120px] focus:border-orange-500 focus:bg-white bg-gray-50/50 outline-none resize-none transition-all" 
              placeholder="Provide details about the buyer's behavior..." 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
            />
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Evidence ({files.length})</p>
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {files.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-100">
                    <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                    <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50/10 transition-all">
              <Upload className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-[11px] text-gray-500 font-bold uppercase">Upload Proof (e.g. Chat logs)</span>
              <input 
                type="file" className="hidden" multiple accept="image/*" 
                onChange={(e) => e.target.files && setFiles([...files, ...Array.from(e.target.files)])}
              />
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex gap-3 shrink-0">
          <Button variant="outline" className="flex-1 h-12 font-bold rounded-xl" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="flex-[2] h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-widest rounded-xl" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Submit Report"}
          </Button>
        </div>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}