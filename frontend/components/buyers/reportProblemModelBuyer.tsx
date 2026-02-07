"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, Upload, AlertTriangle, X } from "lucide-react" // Added X icon
import { toast } from "sonner"
import Image from "next/image" // Use Next.js Image component for optimization

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

  if (!isOpen) return null

  // Function to remove a specific image from the selection
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
        toast.success("Report submitted with evidence!");
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white shadow-2xl border-none flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-red-600 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">Report Order #{orderId}</h3>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <XCircle size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* ... Select Issue Type Section ... */}
          <div className="space-y-3">
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Select Issue Type</p>
            <div className="grid gap-2">
              {ISSUE_TYPES.map((issue) => (
                <label key={issue.id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${selectedIssue === issue.id ? 'border-red-500 bg-red-50/50' : 'hover:bg-gray-50 border-gray-100'}`}>
                  <input type="radio" name="issueType" checked={selectedIssue === issue.id} onChange={() => setSelectedIssue(issue.id)} className="w-4 h-4 accent-red-600" />
                  <span className="text-sm font-semibold text-gray-700">{issue.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ... Description Section ... */}
          <div className="space-y-2">
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Detailed Description</p>
            <textarea className="w-full p-3 border border-gray-200 rounded-xl text-sm min-h-[120px] focus:ring-2 focus:ring-red-100 outline-none resize-none" placeholder="Please provide details..." value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>

          {/* EVIDENCE SECTION WITH PREVIEW */}
          <div className="space-y-3 pb-2">
            <p className="text-xs font-black uppercase text-gray-400 tracking-widest">Evidence ({files.length})</p>
            
            {/* Image Preview Grid */}
            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-2">
                {files.map((file, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt="preview" 
                      className="object-cover w-full h-full"
                    />
                    <button 
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-[10px] text-gray-500 font-medium">Add more screenshots</span>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files) {
                    // Append new files to existing ones
                    setFiles([...files, ...Array.from(e.target.files)]);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex gap-3 shrink-0">
          <Button variant="ghost" className="flex-1 font-bold text-gray-500" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="flex-[2] bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Submit Report"}
          </Button>
        </div>
      </Card>
    </div>
  )
}