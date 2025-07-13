import { Company, UserWithProfile } from "../shared/types/company";
import { AdminDashboard } from "./admin/AdminDashboard";
import { DriverDashboard } from "./driver/DriverDashboard";

interface DashboardProps {
  user: UserWithProfile;
  company: Company;
}

export function Dashboard({ user, company }: DashboardProps) {
  const userRole = user?.profile?.role;

  if (!userRole) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Profil wird eingerichtet...
        </h2>
        <p className="text-gray-600">
          Ihr Benutzerprofil wird gerade konfiguriert. Bitte warten Sie einen
          Moment.
        </p>
      </div>
    );
  }

  if (userRole === "admin") {
    return <AdminDashboard user={user} company={company} />;
  }

  if (userRole === "driver") {
    return <DriverDashboard user={user} company={company} />;
  }

  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Unbekannte Benutzerrolle
      </h2>
      <p className="text-gray-600">
        Ihre Benutzerrolle konnte nicht erkannt werden. Bitte kontaktieren Sie
        den Support.
      </p>
    </div>
  );
}
