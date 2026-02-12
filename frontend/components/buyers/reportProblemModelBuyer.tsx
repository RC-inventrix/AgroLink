"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, Upload, AlertTriangle, X } from "lucide-react"
import { toast } from "sonner"

const ISSUE_TYPES = [
  { id: "FAKE_OR_MISLEADING_PRODUCE", label: "Fake or Misleading Produce" },
  { id: "INCORRECT_WEIGHT_OR_QUANTITY", label: "Incorrect Weight/Quantity" },
  { id: "UNFAIR_PRICE_MANIPULATION", label: "Unfair Price Manipulation" },
  { id: "UNSAFE_CHEMICAL_USE", label: "Unsafe Chemical Use" },
  { id: "NON_DELIVERY_AFTER_PAYMENT", label: "Non-delivery After Payment" },
  { id: "OTHER", label: "Other Issues" },
];

export default function ReportProblemModal({ orderId, reporterId, reportedId, isOpen, onClose }: any) {
  const [selectedIssue, setSelectedIssue] = useState("")
  const [details, setDetails] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 1. Ensure the portal only renders on the client side to avoid Hydration errors
  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
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

      const response = await fetch("http://localhost:8080/api/v1/moderation/user/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          reporterId,
          reportedId,
          issueType: selectedIssue,
          description: details,
          evidenceUrls: uploadedUrls 
        }),
      });

      if (response.ok) {
        toast.success("Report submitted successfully!");
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

  // 2. Wrap the entire UI in the Portal content
  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white shadow-2xl border-none flex flex-col max-h-[90vh] overflow-hidden rounded-2xl animate-in zoom-in-95 duration-300">
        
        {/* HEADER */}
        <div className="p-5 flex justify-between items-center border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={22} className="fill-red-50" />
            <h3 className="font-bold text-lg text-gray-800">Report Issue</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <XCircle size={24} />
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar bg-white">
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Select Issue Type</p>
            <div className="grid gap-2">
              {ISSUE_TYPES.map((issue) => (
                <label 
                  key={issue.id} 
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedIssue === issue.id 
                    ? 'border-red-500 bg-red-50/30' 
                    : 'hover:border-gray-200 border-gray-100 bg-white'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="issueType" 
                    checked={selectedIssue === issue.id} 
                    onChange={() => setSelectedIssue(issue.id)} 
                    className="w-4 h-4 accent-red-600" 
                  />
                  <span className={`text-sm font-semibold ${selectedIssue === issue.id ? 'text-red-700' : 'text-gray-700'}`}>
                    {issue.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Description</p>
            <textarea 
              className="w-full p-4 border-2 border-gray-100 rounded-xl text-sm min-h-[120px] focus:border-red-500 focus:bg-white bg-gray-50/50 outline-none resize-none transition-all" 
              placeholder="Tell us what happened..." 
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
            />
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase text-gray-500 tracking-wider">Evidence ({files.length})</p>
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {files.map((file, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-100 shadow-sm">
                    <img src={URL.createObjectURL(file)} alt="preview" className="object-cover w-full h-full" />
                    <button onClick={() => removeFile(index)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full shadow-lg">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/10 transition-all">
              <Upload className="w-5 h-5 text-gray-400 mb-1" />
              <span className="text-[11px] text-gray-500 font-bold uppercase">Upload Photos</span>
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
          <Button className="flex-[2] h-12 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-red-100" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Submit Report"}
          </Button>
        </div>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
}