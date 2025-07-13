"use client";

import { EnrichedTrip } from "@/components/shared/types/company";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";

interface TripHistoryProps {
  trips: EnrichedTrip[];
}

export function TripHistory({ trips }: TripHistoryProps) {
  const [editingTrip, setEditingTrip] = useState<EnrichedTrip | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<EnrichedTrip | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    timeStart: "",
    timeEnd: "",
    locationStart: "",
    locationEnd: "",
    kmStart: 0,
    kmEnd: 0,
    purpose: "",
    notes: "",
  });

  const updateEntry = useMutation(api.fahrtenbuch.update);
  const removeEntry = useMutation(api.fahrtenbuch.remove);

  //   const tripFiles = useQuery(
  //     api.fahrtenbuch.getFilesByEntry,
  //     selectedTrip
  //       ? { entryId: selectedTrip._id as Id<"fahrtenbuch_entries"> }
  //       : "skip"
  //   );

  const handleEdit = (trip: EnrichedTrip) => {
    setFormData({
      date: trip.date,
      timeStart: trip.timeStart ?? "",
      timeEnd: trip.timeEnd ?? "",
      locationStart: trip.locationStart,
      locationEnd: trip.locationEnd,
      kmStart: trip.kmStart,
      kmEnd: trip.kmEnd,
      purpose: trip.purpose || "",
      notes: trip.notes || "",
    });
    setEditingTrip(trip);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.kmStart >= formData.kmEnd) {
      toast.error(
        "End-Kilometerstand muss größer als Start-Kilometerstand sein"
      );
      return;
    }

    try {
      await updateEntry({
        entryId: editingTrip!._id as Id<"fahrtenbuch_entries">,
        ...formData,
        notes: formData.notes || undefined,
      });
      toast.success("Fahrt erfolgreich aktualisiert!");
      setEditingTrip(null);
    } catch (error) {
      toast.error("Fehler beim Aktualisieren der Fahrt");
      console.error(error);
    }
  };

  const handleDelete = async (tripId: Id<"fahrtenbuch_entries">) => {
    if (confirm("Sind Sie sicher, dass Sie diese Fahrt löschen möchten?")) {
      try {
        await removeEntry({ entryId: tripId });
        toast.success("Fahrt erfolgreich gelöscht!");
      } catch (error) {
        toast.error("Fehler beim Löschen der Fahrt");
        console.error(error);
      }
    }
  };

  const totalKilometers = trips.reduce(
    (sum, trip) => sum + (trip.kmEnd - trip.kmStart),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Meine Fahrten</h2>
        <div className="text-sm text-gray-600">
          Gesamt: {trips.length} Fahrten • {totalKilometers.toLocaleString()} km
        </div>
      </div>

      {/* Editing form */}
      {editingTrip && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fahrt bearbeiten
          </h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Reuse your existing form layout */}
            {/* ... keep unchanged form rendering logic ... */}
          </form>
        </div>
      )}

      {/* Trip details */}
      {selectedTrip && (
        <div className="bg-white border rounded-lg p-6">
          {/* ... keep unchanged details layout ... */}
        </div>
      )}

      {/* Trips Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fahrzeug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strecke
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kilometer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zweck
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trips.map((trip) => (
                <tr key={trip._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(trip.date).toLocaleDateString("de-DE")}
                    <div className="text-xs text-gray-500">
                      {trip.timeStart} - {trip.timeEnd}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.vehicle?.brand} {trip.vehicle?.model}
                    <div className="text-xs text-gray-500">
                      {trip.vehicle?.licensePlate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{trip.locationStart}</div>
                    <div className="text-xs text-gray-500">
                      → {trip.locationEnd}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(trip.kmEnd - trip.kmStart).toLocaleString()} km
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {trip.purpose}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedTrip(trip)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => handleEdit(trip)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(trip._id as Id<"fahrtenbuch_entries">)
                      }
                      className="text-red-600 hover:text-red-900"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {trips.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <p className="text-gray-500">Noch keine Fahrten eingetragen.</p>
        </div>
      )}
    </div>
  );
}
