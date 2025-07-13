"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@radix-ui/react-checkbox";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Textarea } from "../ui/textarea";

export function CompanySetup() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    industry: "",
    isRentalCompany: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const createCompany = useMutation(api.companies.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Firmenname ist erforderlich");
      return;
    }

    setIsLoading(true);
    try {
      await createCompany({
        name: formData.name,
        address: formData.address || undefined,
        industry: formData.industry || undefined,
        isRentalCompany: formData.isRentalCompany,
      });
      toast.success("Firma erfolgreich erstellt!");
    } catch (error) {
      toast.error("Fehler beim Erstellen der Firma");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Firma einrichten</CardTitle>
          <CardDescription>
            Erstellen Sie Ihr Firmenprofil, um mit DriveLog zu beginnen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Firmenname *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ihre Firma GmbH"
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
                placeholder="Musterstraße 123, 12345 Musterstadt"
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
                placeholder="z.B. Logistik, Handwerk, Dienstleistung"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRentalCompany"
                checked={formData.isRentalCompany}
                onCheckedChange={(value: boolean) =>
                  setFormData({ ...formData, isRentalCompany: value })
                }
              />
              <Label htmlFor="isRentalCompany">
                Autovermietung / Fahrzeugverleih
              </Label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Wird erstellt..." : "Firma erstellen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
