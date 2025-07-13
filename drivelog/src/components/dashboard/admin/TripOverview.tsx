"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

// Filters type
type TripFilters = {
  vehicleId?: Id<"vehicles">;
  userId?: Id<"users">;
  dateFrom?: string;
  dateTo?: string;
};

export function TripOverview() {
  const [filters, setFilters] = useState<{
    vehicleId: string;
    userId: string;
    dateFrom: string;
    dateTo: string;
  }>({
    vehicleId: "",
    userId: "",
    dateFrom: "",
    dateTo: "",
  });

  const vehicles = useQuery(api.vehicles.listByCompany) || [];
  const drivers = useQuery(api.drivers.listByCompany) || [];

  const tripQueryArgs: TripFilters = {
    vehicleId: filters.vehicleId
      ? (filters.vehicleId as Id<"vehicles">)
      : undefined,
    userId: filters.userId ? (filters.userId as Id<"users">) : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
  };

  const trips = useQuery(api.fahrtenbuch.listByCompany, tripQueryArgs) || [];

  const totalKilometers = trips.reduce(
    (sum, trip) => sum + (trip.kmEnd - trip.kmStart),
    0
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Fahrtenübersicht</h2>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Filter</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label>Fahrzeug</Label>
            <Select
              value={filters.vehicleId}
              onValueChange={(value) =>
                setFilters({ ...filters, vehicleId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle Fahrzeuge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Fahrzeuge</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle._id} value={vehicle._id}>
                    {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Fahrer</Label>
            <Select
              value={filters.userId}
              onValueChange={(value) =>
                setFilters({ ...filters, userId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Alle Fahrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Alle Fahrer</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver._id} value={driver.userId}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Von Datum</Label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Bis Datum</Label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() =>
              setFilters({
                vehicleId: "",
                userId: "",
                dateFrom: "",
                dateTo: "",
              })
            }
          >
            Filter zurücksetzen
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">Gesamte Fahrten</p>
          <p className="text-2xl font-semibold text-gray-900">{trips.length}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">Gesamte Kilometer</p>
          <p className="text-2xl font-semibold text-gray-900">
            {totalKilometers.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <p className="text-sm font-medium text-gray-600">
            Ø Kilometer pro Fahrt
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            {trips.length > 0 ? Math.round(totalKilometers / trips.length) : 0}
          </p>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Fahrer</TableHead>
              <TableHead>Fahrzeug</TableHead>
              <TableHead>Strecke</TableHead>
              <TableHead>Kilometer</TableHead>
              <TableHead>Zweck</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip._id}>
                <TableCell>
                  {new Date(trip.date).toLocaleDateString("de-DE")}
                </TableCell>
                <TableCell>{trip.user?.name}</TableCell>
                <TableCell>
                  {trip.vehicle?.brand} {trip.vehicle?.model}
                  <div className="text-xs text-gray-500">
                    {trip.vehicle?.licensePlate}
                  </div>
                </TableCell>
                <TableCell>
                  {trip.locationStart}
                  <div className="text-xs text-gray-500">
                    → {trip.locationEnd}
                  </div>
                </TableCell>
                <TableCell>
                  {(trip.kmEnd - trip.kmStart).toLocaleString()} km
                  <div className="text-xs text-gray-500">
                    {trip.kmStart.toLocaleString()} →{" "}
                    {trip.kmEnd.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>{trip.purpose}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {trips.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Keine Fahrten gefunden.
          </div>
        )}
      </div>
    </div>
  );
}
