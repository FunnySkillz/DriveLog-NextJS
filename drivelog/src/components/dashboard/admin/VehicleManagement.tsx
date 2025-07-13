"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Vehicle } from "@/components/shared/types/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@radix-ui/react-select";
import { Table } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function VehicleManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const vehicles = useQuery(api.vehicles.listByCompany) || [];
  const createVehicle = useMutation(api.vehicles.create);
  const updateVehicle = useMutation(api.vehicles.update);
  const removeVehicle = useMutation(api.vehicles.remove);

  const [formData, setFormData] = useState<
    Omit<Vehicle, "_id" | "_creationTime" | "companyId">
  >({
    brand: "",
    model: "",
    licensePlate: "",
    vin: "",
    fuelType: "Petrol",
    year: new Date().getFullYear(),
    mileage: 0,
    isPublic: false,
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      brand: "",
      model: "",
      licensePlate: "",
      vin: "",
      fuelType: "Petrol",
      year: new Date().getFullYear(),
      mileage: 0,
      isPublic: false,
      notes: "",
    });
    setEditingVehicle(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await updateVehicle({ vehicleId: editingVehicle._id, ...formData });
        toast.success("Fahrzeug erfolgreich aktualisiert!");
      } else {
        await createVehicle(formData);
        toast.success("Fahrzeug erfolgreich hinzugefügt!");
      }
      resetForm();
    } catch (error) {
      toast.error("Fehler beim Speichern des Fahrzeugs");
      console.error(error);
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setFormData({ ...vehicle });
    setEditingVehicle(vehicle);
    setShowAddForm(true);
  };

  const handleDelete = async (vehicleId: Id<"vehicles">) => {
    if (confirm("Sind Sie sicher, dass Sie dieses Fahrzeug löschen möchten?")) {
      try {
        await removeVehicle({ vehicleId });
        toast.success("Fahrzeug erfolgreich gelöscht!");
      } catch (error) {
        toast.error("Fehler beim Löschen des Fahrzeugs");
        console.error(error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Fahrzeugverwaltung</h2>
        <Button onClick={() => setShowAddForm(true)}>
          + Fahrzeug hinzufügen
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white border rounded-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingVehicle ? "Fahrzeug bearbeiten" : "Neues Fahrzeug"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <Label>Marke *</Label>
              <Input
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Modell *</Label>
              <Input
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Kennzeichen *</Label>
              <Input
                value={formData.licensePlate}
                onChange={(e) =>
                  setFormData({ ...formData, licensePlate: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>VIN *</Label>
              <Input
                value={formData.vin}
                onChange={(e) =>
                  setFormData({ ...formData, vin: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Label>Kraftstoffart *</Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    fuelType: value as Vehicle["fuelType"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Benzin</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Electric">Elektro</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Baujahr *</Label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) })
                }
                min={1900}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
            <div>
              <Label>Kilometerstand *</Label>
              <Input
                type="number"
                value={formData.mileage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mileage: parseInt(e.target.value),
                  })
                }
                min={0}
                required
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: !!checked })
                }
              />
              <Label htmlFor="isPublic">
                Öffentlich (für alle Fahrer sichtbar)
              </Label>
            </div>
            <div className="md:col-span-2">
              <Label>Notizen</Label>
              <Textarea
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit">
                {editingVehicle ? "Aktualisieren" : "Hinzufügen"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Abbrechen
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* List Table */}
      <div className="bg-white border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fahrzeug</TableHead>
              <TableHead>Kennzeichen</TableHead>
              <TableHead>Kraftstoff</TableHead>
              <TableHead>Kilometer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle._id}>
                <TableCell>
                  <div className="font-medium text-gray-900">
                    {vehicle.brand} {vehicle.model}
                  </div>
                  <div className="text-sm text-gray-500">
                    {vehicle.year} • VIN: {vehicle.vin}
                  </div>
                </TableCell>
                <TableCell>{vehicle.licensePlate}</TableCell>
                <TableCell>{vehicle.fuelType}</TableCell>
                <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      vehicle.isPublic
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {vehicle.isPublic ? "Öffentlich" : "Privat"}
                  </span>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleEdit(vehicle)}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDelete(vehicle._id)}
                  >
                    Löschen
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
