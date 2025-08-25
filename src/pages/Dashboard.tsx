import { 
  Scale, 
  FileText, 
  Clock, 
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Cases",
      value: "127",
      change: "+12%",
      icon: Scale,
      trend: "up",
      description: "Cases in progress"
    },
    {
      title: "Pending Filings",
      value: "34",
      change: "+8%",
      icon: FileText,
      trend: "up",
      description: "Awaiting review"
    },
    {
      title: "Today's Hearings",
      value: "8",
      change: "0%",
      icon: Clock,
      trend: "neutral",
      description: "Scheduled for today"
    },
    {
      title: "System Users",
      value: "1,245",
      change: "+3%",
      icon: Users,
      trend: "up",
      description: "Active participants"
    }
  ];

  const recentCases = [
    {
      id: "2024-CV-001",
      title: "Smith v. Johnson Property Dispute",
      status: "UNDER_REVIEW",
      priority: "HIGH",
      lastActivity: "2 hours ago",
      judge: "Hon. Patricia Williams"
    },
    {
      id: "2024-CR-045",
      title: "State v. Anderson",
      status: "SCHEDULED",
      priority: "URGENT",
      lastActivity: "4 hours ago",
      judge: "Hon. Michael Chen"
    },
    {
      id: "2024-CV-023",
      title: "Corporate Contract Dispute",
      status: "SUBMITTED",
      priority: "MEDIUM",
      lastActivity: "1 day ago",
      judge: "Not assigned"
    }
  ];

  const pendingActions = [
    {
      type: "filing",
      title: "Motion to Dismiss requires review",
      case: "2024-CV-001",
      priority: "high",
      time: "Due in 2 hours"
    },
    {
      type: "hearing",
      title: "Hearing scheduled for tomorrow",
      case: "2024-CR-045",
      priority: "urgent",
      time: "Tomorrow 9:00 AM"
    },
    {
      type: "document",
      title: "Document upload pending verification",
      case: "2024-CV-023",
      priority: "medium",
      time: "Due today"
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of court operations and recent activity
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className={stat.trend === 'up' ? 'text-success' : ''}>{stat.change}</span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>Latest case activity and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCases.map((case_) => (
                <div key={case_.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{case_.id}</span>
                      <Badge className={getPriorityBadge(case_.priority)}>
                        {case_.priority}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{case_.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Judge: {case_.judge}</span>
                      <span>Last activity: {case_.lastActivity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusBadge(case_.status)}>
                      {case_.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                View All Cases
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingActions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {action.priority === 'urgent' ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">Case: {action.case}</p>
                    <p className="text-xs text-muted-foreground">{action.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                View All Actions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Scale className="h-5 w-5" />
              <span className="text-sm">New Case</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">File Document</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Schedule Hearing</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="text-sm">Manage Users</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;