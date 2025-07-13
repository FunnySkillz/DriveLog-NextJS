"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Company } from "@/components/shared/types/company";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface CompanySettingsProps {
  company: Company;
}

export function CompanySettings({ company }: CompanySettingsProps) {
  const [formData, setFormData] = useState({
    name: company.name,
    address: company.address || "",
    industry: company.industry || "",
    isRentalCompany: company.isRentalCompany,
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateCompany = useMutation(api.companies.update);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateCompany({
        companyId: company._id as Id<"companies">,
        name: formData.name,
        address: formData.address || undefined,
        industry: formData.industry || undefined,
        isRentalCompany: formData.isRentalCompany,
      });
      toast.success("Firmeneinstellungen erfolgreich aktualisiert!");
    } catch (error) {
      toast.error("Fehler beim Aktualisieren der Einstellungen");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Firmeneinstellungen</h2>

      <div className="bg-white border rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Firmenname *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Branche</Label>
            <Input
              id="industry"
              value={formData.industry}
              onChange={(e) =>
                setFormData({ ...formData, industry: e.target.value })
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isRentalCompany"
              checked={formData.isRentalCompany}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isRentalCompany: !!checked })
              }
            />
            <Label htmlFor="isRentalCompany">
              Autovermietung / Fahrzeugverleih
            </Label>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Wird gespeichert..." : "Einstellungen speichern"}
          </Button>
        </form>
      </div>
    </div>
  );
}
