"use client";

import { useState } from "react";
import { useQuery } from "convex/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Company,
  EnrichedTrip,
  UserWithProfile,
  Vehicle,
} from "@/components/shared/types/company";
import { Separator } from "@radix-ui/react-select";
import { api } from "../../../../convex/_generated/api";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { FahrtenbuchForm } from "./FahrtenbuchForm";
import { TripHistory } from "./TripHistory";

interface DriverDashboardProps {
  user: UserWithProfile;
  company: Company;
}

export function DriverDashboard({ user, company }: DriverDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const assignedVehicles = useQuery(api.vehicles.listAssignedToUser) || [];
  const myTrips = useQuery(api.fahrtenbuch.listByUser) || [];

  const totalKilometers = myTrips.reduce(
    (sum, trip) => sum + (trip.kmEnd - trip.kmStart),
    0
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fahrer Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground">
            Willkommen zurück, {user.profile?.name}! Verwalten Sie Ihre Fahrten
            für {company.name}.
          </p>
        </CardHeader>
      </Card>

      <Card>
        <TabsList className="px-4">
          <TabsTrigger value="overview">📊 Übersicht</TabsTrigger>
          <TabsTrigger value="new-trip">➕ Neue Fahrt</TabsTrigger>
          <TabsTrigger value="history">📋 Meine Fahrten</TabsTrigger>
        </TabsList>
      </Card>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Verfügbare Fahrzeuge
              </p>
              <p className="text-2xl font-semibold">
                {assignedVehicles.length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Meine Fahrten</p>
              <p className="text-2xl font-semibold">{myTrips.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Gesamte Kilometer</p>
              <p className="text-2xl font-semibold">
                {totalKilometers.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verfügbare Fahrzeuge</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assignedVehicles.map((vehicle) => {
                    if (!vehicle) return null;
                    return (
                      <div
                        key={vehicle._id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">
                            {vehicle.brand} {vehicle.model}
                          </h4>
                          {vehicle.isPublic && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Öffentlich
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Kennzeichen: {vehicle.licensePlate}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Kraftstoff: {vehicle.fuelType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Kilometerstand: {vehicle.mileage.toLocaleString()} km
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ihnen wurden noch keine Fahrzeuge zugewiesen. Kontaktieren Sie
                  Ihren Administrator.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Letzte Fahrten</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 pr-4">
                {myTrips.slice(0, 5).map((trip: EnrichedTrip) => (
                  <div
                    key={trip._id}
                    className="flex justify-between py-2 border-b last:border-b-0 text-sm"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {trip.vehicle?.brand} {trip.vehicle?.model}
                      </p>
                      <p className="text-muted-foreground">
                        {trip.locationStart} → {trip.locationEnd}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">{trip.date}</p>
                      <p className="text-muted-foreground">
                        {trip.kmEnd - trip.kmStart} km
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="new-trip">
        <FahrtenbuchForm
          vehicles={assignedVehicles.filter(Boolean) as Vehicle[]}
        />
      </TabsContent>

      <TabsContent value="history">
        <TripHistory trips={myTrips} />
      </TabsContent>
    </Tabs>
  );
}
