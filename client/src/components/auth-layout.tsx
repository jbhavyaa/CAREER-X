import { Card } from "@/components/ui/card";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Mody University
          </h1>
          <p className="text-muted-foreground">Placement Portal</p>
        </div>
        <Card className="p-8">{children}</Card>
      </div>
    </div>
  );
}
