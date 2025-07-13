import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Driver, Vehicle } from "@/components/shared/types/company";

export function DriverManagement() {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });

  const drivers = useQuery(api.drivers.listByCompany) || [];
  const vehicles = useQuery(api.vehicles.listByCompany) || [];

  const inviteDriver = useMutation(api.drivers.inviteDriver);
  const removeDriver = useMutation(api.drivers.removeDriver);
  const assignVehicle = useMutation(api.vehicles.assignToUser);
  const unassignVehicle = useMutation(api.vehicles.unassignFromUser);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inviteDriver(formData);
      toast.success("Fahrer erfolgreich eingeladen!");
      setFormData({ email: "", name: "" });
      setShowInviteForm(false);
    } catch (error) {
      toast.error("Fehler beim Einladen des Fahrers");
      console.error(error);
    }
  };

  const handleRemoveDriver = async (driverId: Id<"user_profiles">) => {
    if (confirm("Sind Sie sicher, dass Sie diesen Fahrer entfernen möchten?")) {
      try {
        await removeDriver({ driverId });
        toast.success("Fahrer erfolgreich entfernt!");
      } catch (error) {
        toast.error("Fehler beim Entfernen des Fahrers");
        console.error(error);
      }
    }
  };

  const handleAssignVehicle = async (
    driverId: Id<"users">,
    vehicleId: Id<"vehicles">
  ) => {
    try {
      await assignVehicle({ userId: driverId, vehicleId });
      toast.success("Fahrzeug erfolgreich zugewiesen!");
    } catch (error) {
      toast.error("Fehler beim Zuweisen des Fahrzeugs");
      console.error(error);
    }
  };

  const handleUnassignVehicle = async (
    driverId: Id<"users">,
    vehicleId: Id<"vehicles">
  ) => {
    try {
      await unassignVehicle({ userId: driverId, vehicleId });
      toast.success("Fahrzeugzuweisung erfolgreich entfernt!");
    } catch (error) {
      toast.error("Fehler beim Entfernen der Fahrzeugzuweisung");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Fahrerverwaltung</h2>
        <button
          onClick={() => setShowInviteForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + Fahrer einladen
        </button>
      </div>

      {showInviteForm && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Neuen Fahrer einladen
          </h3>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-Mail *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Einladen
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-400 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {drivers.map((driver: Driver) => (
          <div key={driver._id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {driver.name}
                </h3>
                <p className="text-gray-600">{driver.email}</p>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {driver.role === "admin" ? "Administrator" : "Fahrer"}
                </span>
              </div>
              {driver.role !== "admin" && (
                <button
                  onClick={() => handleRemoveDriver(driver._id)}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Entfernen
                </button>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Zugewiesene Fahrzeuge ({driver.assignedVehicles?.length || 0})
              </h4>
              <div className="space-y-2">
                {driver.assignedVehicles
                  ?.filter((v): v is Vehicle => v !== null)
                  .map((vehicle) => (
                    <div
                      key={vehicle._id}
                      className="flex items-center justify-between bg-gray-50 rounded-md p-3"
                    >
                      <span className="text-sm text-gray-900">
                        {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                      </span>
                      <button
                        onClick={() =>
                          handleUnassignVehicle(
                            driver.userId,
                            vehicle._id as Id<"vehicles">
                          )
                        }
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
              </div>

              <div className="mt-3">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignVehicle(
                        driver.userId,
                        e.target.value as Id<"vehicles">
                      );
                      e.target.value = "";
                    }
                  }}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2"
                  defaultValue=""
                >
                  <option value="">Fahrzeug zuweisen...</option>
                  {vehicles
                    .filter(
                      (v) =>
                        !driver.assignedVehicles?.some(
                          (av) => av && av._id === v._id
                        )
                    )
                    .map((vehicle) => (
                      <option key={vehicle._id} value={vehicle._id}>
                        {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <p className="text-gray-500">Noch keine Fahrer eingeladen.</p>
        </div>
      )}
    </div>
  );
}
