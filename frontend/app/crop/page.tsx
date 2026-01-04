"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CropRecommendationSystem() {
    const [temperature, setTemperature] = useState("")
    const [humidity, setHumidity] = useState("")
    const [rainfall, setRainfall] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handlePredict = async () => {
        setLoading(true)
        setResult(null)
        setError(null)

        try {
            const response = await fetch("http://localhost:8080/api/crop/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    temperature: Number(temperature),
                    humidity: Number(humidity),
                    rainfall: Number(rainfall),
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to get crop prediction")
            }

            const data = await response.json()
            setResult(`🌾 Recommended Crop: ${data.crop}`)
        } catch (err: any) {
            setError(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md rounded-2xl shadow-xl">
                <CardContent className="p-6 space-y-5">
                    <h1 className="text-2xl font-bold text-center text-green-700">
                        🌱 Crop Recommendation System
                    </h1>

                    <p className="text-sm text-center text-gray-500">
                        Enter current weather conditions to get the most suitable crop
                    </p>

                    <div className="space-y-2">
                        <Label>Temperature (°C)</Label>
                        <Input
                            placeholder="e.g. 28"
                            value={temperature}
                            onChange={e => setTemperature(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Humidity (%)</Label>
                        <Input
                            placeholder="e.g. 70"
                            value={humidity}
                            onChange={e => setHumidity(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Rainfall (mm)</Label>
                        <Input
                            placeholder="e.g. 120"
                            value={rainfall}
                            onChange={e => setRainfall(e.target.value)}
                        />
                    </div>

                    <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handlePredict}
                        disabled={loading}
                    >
                        {loading ? "Analyzing Weather..." : "Recommend Crop"}
                    </Button>

                    {result && (
                        <div className="mt-4 text-center text-lg font-semibold text-green-700">
                            {result}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-center text-sm font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    <p className="text-xs text-center text-gray-400">
                        Powered by ML • Python API • Spring Boot Backend
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
