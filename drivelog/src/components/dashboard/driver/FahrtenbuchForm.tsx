"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Vehicle } from "@/components/shared/types/company";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface FahrtenbuchFormProps {
  vehicles: Vehicle[];
}

export function FahrtenbuchForm({ vehicles }: FahrtenbuchFormProps) {
  const [formData, setFormData] = useState({
    vehicleId: "" as Id<"vehicles"> | "",
    date: new Date().toISOString().split("T")[0],
    timeStart: "",
    timeEnd: "",
    locationStart: "",
    locationEnd: "",
    kmStart: 0,
    kmEnd: 0,
    purpose: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createEntry = useMutation(api.fahrtenbuch.create);
  const generateUploadUrl = useMutation(api.fahrtenbuch.generateUploadUrl);
  const addFile = useMutation(api.fahrtenbuch.addFile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicleId) {
      toast.error("Bitte wählen Sie ein Fahrzeug aus");
      return;
    }

    if (formData.kmStart >= formData.kmEnd) {
      toast.error(
        "End-Kilometerstand muss größer als Start-Kilometerstand sein"
      );
      return;
    }

    setIsLoading(true);

    try {
      const entryId = await createEntry({
        vehicleId: formData.vehicleId,
        date: formData.date,
        timeStart: formData.timeStart,
        timeEnd: formData.timeEnd,
        locationStart: formData.locationStart,
        locationEnd: formData.locationEnd,
        kmStart: formData.kmStart,
        kmEnd: formData.kmEnd,
        purpose: formData.purpose,
        notes: formData.notes || undefined,
      });

      for (const file of selectedFiles) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!result.ok) throw new Error(`Upload failed: ${result.statusText}`);
        const { storageId } = await result.json();

        await addFile({
          entryId,
          storageId,
          fileName: file.name,
          fileType: file.type.startsWith("image/") ? "image" : "pdf",
        });
      }

      toast.success("Fahrtenbuch-Eintrag erfolgreich erstellt!");

      setFormData({
        vehicleId: "",
        date: new Date().toISOString().split("T")[0],
        timeStart: "",
        timeEnd: "",
        locationStart: "",
        locationEnd: "",
        kmStart: 0,
        kmEnd: 0,
        purpose: "",
        notes: "",
      });
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast.error("Fehler beim Erstellen des Eintrags");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith("image/") || file.type === "application/pdf"
    );

    if (validFiles.length !== files.length) {
      toast.error("Nur Bilder und PDF-Dateien sind erlaubt");
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Neue Fahrt eintragen</h2>

      {vehicles.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            Ihnen wurden noch keine Fahrzeuge zugewiesen. Kontaktieren Sie Ihren
            Administrator.
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label>Fahrzeug *</Label>
                <Select
                  value={formData.vehicleId}
                  onValueChange={(value: Id<"vehicles">) =>
                    setFormData({ ...formData, vehicleId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Fahrzeug auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {v.brand} {v.model} ({v.licensePlate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Datum *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Startzeit *</Label>
                <Input
                  type="time"
                  value={formData.timeStart}
                  onChange={(e) =>
                    setFormData({ ...formData, timeStart: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Endzeit *</Label>
                <Input
                  type="time"
                  value={formData.timeEnd}
                  onChange={(e) =>
                    setFormData({ ...formData, timeEnd: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Startort *</Label>
                <Input
                  type="text"
                  value={formData.locationStart}
                  onChange={(e) =>
                    setFormData({ ...formData, locationStart: e.target.value })
                  }
                  placeholder="z.B. Büro, Zuhause"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Zielort *</Label>
                <Input
                  type="text"
                  value={formData.locationEnd}
                  onChange={(e) =>
                    setFormData({ ...formData, locationEnd: e.target.value })
                  }
                  placeholder="z.B. Kunde, Baustelle"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Kilometerstand Start *</Label>
                <Input
                  type="number"
                  value={formData.kmStart}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kmStart: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label>Kilometerstand Ende *</Label>
                <Input
                  type="number"
                  value={formData.kmEnd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kmEnd: parseInt(e.target.value) || 0,
                    })
                  }
                  min={0}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Zweck *</Label>
              <Input
                type="text"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
                placeholder="z.B. Kundenbesuch"
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Notizen</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Belege/Dokumente</Label>
              <Input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded-md"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Entfernen
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {formData.kmEnd > formData.kmStart && (
              <div className="bg-blue-50 p-4 rounded-lg text-blue-800 font-medium">
                Gefahrene Kilometer:{" "}
                {(formData.kmEnd - formData.kmStart).toLocaleString()} km
              </div>
            )}

            <div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Wird gespeichert..." : "Fahrt eintragen"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
