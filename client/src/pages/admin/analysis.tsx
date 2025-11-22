import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import type { Placement } from "@shared/schema";

const branches = ["CSE", "ECE", "ME", "CE", "EE", "IT"];
const COLORS = ["hsl(217, 100%, 29%)", "hsl(46, 64%, 52%)", "hsl(200, 80%, 40%)", "hsl(280, 65%, 50%)", "hsl(30, 75%, 48%)", "hsl(0, 84%, 45%)"];

export default function AdminAnalysis() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    studentsPlaced: "",
    year: new Date().getFullYear().toString(),
    branch: "",
  });

  const { data: placements, isLoading } = useQuery<Placement[]>({
    queryKey: ["/api/placements"],
  });

  const createPlacementMutation = useMutation({
    mutationFn: async (data: {
      companyName: string;
      studentsPlaced: number;
      year: number;
      branch: string;
    }) => {
      return await apiRequest("POST", "/api/placements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/placements"] });
      setOpen(false);
      setFormData({
        companyName: "",
        studentsPlaced: "",
        year: new Date().getFullYear().toString(),
        branch: "",
      });
      toast({
        title: "Placement record added",
        description: "Placement data has been added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlacementMutation.mutate({
      companyName: formData.companyName,
      studentsPlaced: parseInt(formData.studentsPlaced),
      year: parseInt(formData.year),
      branch: formData.branch,
    });
  };

  const companyWiseData = placements?.reduce((acc, placement) => {
    const existing = acc.find((item) => item.name === placement.companyName);
    if (existing) {
      existing.students += placement.studentsPlaced;
    } else {
      acc.push({ name: placement.companyName, students: placement.studentsPlaced });
    }
    return acc;
  }, [] as { name: string; students: number }[]);

  const branchWiseData = placements?.reduce((acc, placement) => {
    const existing = acc.find((item) => item.name === placement.branch);
    if (existing) {
      existing.value += placement.studentsPlaced;
    } else {
      acc.push({ name: placement.branch, value: placement.studentsPlaced });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const yearWiseData = placements?.reduce((acc, placement) => {
    const existing = acc.find((item) => item.year === placement.year);
    if (existing) {
      existing.placements += placement.studentsPlaced;
    } else {
      acc.push({ year: placement.year, placements: placement.studentsPlaced });
    }
    return acc;
  }, [] as { year: number; placements: number }[])
    .sort((a, b) => a.year - b.year);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Placement Analysis
          </h1>
          <p className="text-muted-foreground">
            View and analyze placement statistics
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-placement">
              <Plus className="h-4 w-4 mr-2" />
              Add Placement Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Placement Record</DialogTitle>
              <DialogDescription>
                Enter company details and number of students placed
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData({ ...formData, companyName: e.target.value })
                  }
                  placeholder="e.g., Google, Microsoft"
                  required
                  data-testid="input-company-name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentsPlaced">Students Placed</Label>
                  <Input
                    id="studentsPlaced"
                    type="number"
                    min="1"
                    value={formData.studentsPlaced}
                    onChange={(e) =>
                      setFormData({ ...formData, studentsPlaced: e.target.value })
                    }
                    placeholder="e.g., 10"
                    required
                    data-testid="input-students-placed"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                    required
                    data-testid="input-year"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={formData.branch}
                  onValueChange={(value) =>
                    setFormData({ ...formData, branch: value })
                  }
                >
                  <SelectTrigger data-testid="select-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createPlacementMutation.isPending}
                  data-testid="button-submit-placement"
                >
                  {createPlacementMutation.isPending ? "Adding..." : "Add Record"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {placements && placements.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No placement data yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add placement records to view analytics
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company-wise Placements</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={companyWiseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="hsl(217, 100%, 29%)" name="Students Placed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Branch-wise Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={branchWiseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {branchWiseData?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Year-wise Placement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={yearWiseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="placements"
                    stroke="hsl(46, 64%, 52%)"
                    strokeWidth={2}
                    name="Total Placements"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
