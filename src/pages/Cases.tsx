import { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Calendar,
  User,
  FileText,
  Eye
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Cases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const mockCases = [
    {
      id: "2024-CV-001",
      caseNumber: "2024-CV-001",
      title: "Smith v. Johnson Property Dispute",
      type: "Civil",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      filedAt: "2024-01-15",
      assignedJudge: "Hon. Patricia Williams",
      plaintiff: "John Smith",
      defendant: "Sarah Johnson",
      lastActivity: "2 hours ago",
      documentsCount: 12,
      filingsCount: 4
    },
    {
      id: "2024-CR-045",
      caseNumber: "2024-CR-045", 
      title: "State v. Anderson",
      type: "Criminal",
      status: "SCHEDULED",
      priority: "URGENT",
      filedAt: "2024-01-10",
      assignedJudge: "Hon. Michael Chen",
      plaintiff: "State of California",
      defendant: "Robert Anderson",
      lastActivity: "4 hours ago",
      documentsCount: 8,
      filingsCount: 2
    },
    {
      id: "2024-CV-023",
      caseNumber: "2024-CV-023",
      title: "Corporate Contract Dispute - TechCorp vs DataSystems",
      type: "Civil",
      status: "SUBMITTED",
      priority: "MEDIUM", 
      filedAt: "2024-01-20",
      assignedJudge: "Not assigned",
      plaintiff: "TechCorp Industries",
      defendant: "DataSystems LLC",
      lastActivity: "1 day ago",
      documentsCount: 6,
      filingsCount: 1
    },
    {
      id: "2024-CV-034",
      caseNumber: "2024-CV-034",
      title: "Employment Discrimination Case",
      type: "Civil",
      status: "ACCEPTED",
      priority: "LOW",
      filedAt: "2024-01-12",
      assignedJudge: "Hon. Lisa Rodriguez",
      plaintiff: "Maria Garcia",
      defendant: "MegaCorp Inc.",
      lastActivity: "3 days ago",
      documentsCount: 15,
      filingsCount: 7
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      SUBMITTED: "bg-status-submitted text-foreground",
      UNDER_REVIEW: "bg-status-under-review text-white",
      SCHEDULED: "bg-status-scheduled text-white",
      ACCEPTED: "bg-status-accepted text-white",
      REJECTED: "bg-status-rejected text-white"
    };
    
    return variants[status as keyof typeof variants] || "bg-muted text-muted-foreground";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      LOW: "bg-muted text-muted-foreground",
      MEDIUM: "bg-warning text-warning-foreground",
      HIGH: "bg-accent text-accent-foreground", 
      URGENT: "bg-destructive text-destructive-foreground"
    };
    
    return variants[priority as keyof typeof variants] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">
            Manage and track all court cases
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Case
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by case number, title, or parties..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="civil">Civil</SelectItem>
                  <SelectItem value="criminal">Criminal</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="probate">Probate</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Cases ({mockCases.length})</CardTitle>
          <CardDescription>
            All cases in the system with their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Judge</TableHead>
                <TableHead>Filed Date</TableHead>
                <TableHead>Documents</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCases.map((case_) => (
                <TableRow key={case_.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {case_.caseNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{case_.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {case_.plaintiff} v. {case_.defendant}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{case_.type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(case_.status)}>
                      {case_.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityBadge(case_.priority)}>
                      {case_.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {case_.assignedJudge}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(case_.filedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {case_.documentsCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="h-4 w-4 mr-2" />
                          Assign Judge
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Hearing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          View Documents
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cases;