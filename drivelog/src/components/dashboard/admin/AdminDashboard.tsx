"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { CompanySettings } from "./CompanySettings";
import { Company, UserWithProfile } from "@/components/shared/types/company";
import { DriverManagement } from "./DriverManagement";
import { TripOverview } from "./TripOverview";
import { VehicleManagement } from "./VehicleManagement";

interface AdminDashboardProps {
  user: UserWithProfile;
  company: Company;
}

type TabType = "overview" | "vehicles" | "drivers" | "trips" | "settings";

export function AdminDashboard({ user, company }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const vehicles = useQuery(api.vehicles.listByCompany) || [];
  const drivers = useQuery(api.drivers.listByCompany) || [];
  const trips = useQuery(api.fahrtenbuch.listByCompany, {}) || [];

  const tabs = [
    { id: "overview", label: "\u00dcbersicht", icon: "\ud83d\udcca" },
    { id: "vehicles", label: "Fahrzeuge", icon: "\ud83d\ude97" },
    { id: "drivers", label: "Fahrer", icon: "\ud83d\udc65" },
    { id: "trips", label: "Fahrten", icon: "\ud83d\udccb" },
    { id: "settings", label: "Einstellungen", icon: "\u2699\ufe0f" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Willkommen zurück, {user.profile?.name}! Verwalten Sie {company.name}.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">\ud83d\ude97</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">
                        Fahrzeuge
                      </p>
                      <p className="text-2xl font-semibold text-blue-900">
                        {vehicles.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">\ud83d\udc65</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">
                        Fahrer
                      </p>
                      <p className="text-2xl font-semibold text-green-900">
                        {drivers.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">\ud83d\udccb</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">
                        Fahrten
                      </p>
                      <p className="text-2xl font-semibold text-purple-900">
                        {trips.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Letzte Aktivit\u00e4ten
                </h3>
                {trips.slice(0, 5).map((trip) => (
                  <div
                    key={trip._id}
                    className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {trip.user?.name} - {trip.vehicle?.brand}{" "}
                        {trip.vehicle?.model}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trip.locationStart} → {trip.locationEnd}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {trip.date}
                      </p>
                      <p className="text-sm text-gray-500">
                        {trip.kmEnd - trip.kmStart} km
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "vehicles" && <VehicleManagement />}
          {activeTab === "drivers" && <DriverManagement />}
          {activeTab === "trips" && <TripOverview />}
          {activeTab === "settings" && <CompanySettings company={company} />}
        </div>
      </div>
    </div>
  );
}
