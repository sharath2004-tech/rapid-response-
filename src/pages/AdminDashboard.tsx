import { AdminSidebar } from '@/components/AdminSidebar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Incident, IncidentStatus, IncidentType } from '@/types/incident';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    Bell,
    Building,
    Car,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    Flame,
    Heart,
    Loader2,
    MapPin,
    MoreHorizontal,
    RefreshCw,
    Shield,
    Trash2,
    TrendingUp,
    UserCheck
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const typeIcons: Record<IncidentType, React.ReactNode> = {
  medical: <Heart className="w-4 h-4" />,
  accident: <Car className="w-4 h-4" />,
  fire: <Flame className="w-4 h-4" />,
  infrastructure: <Building className="w-4 h-4" />,
  'public-safety': <Shield className="w-4 h-4" />,
};

interface Stats {
  totalIncidents: number;
  activeIncidents: number;
  resolvedToday: number;
  criticalCount: number;
  pendingVerification: number;
}

interface SOSAlert {
  _id: string;
  userId: { name?: string; email: string };
  location: { address?: string; lat: number; lng: number };
  status: string;
  alertType: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalIncidents: 0,
    activeIncidents: 0,
    resolvedToday: 0,
    criticalCount: 0,
    pendingVerification: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      
      const [incidentsRes, statsRes, sosRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/incidents/stats/summary'),
        api.get('/sos/all').catch(() => ({ data: { alerts: [] } }))
      ]);

      setIncidents(incidentsRes.data.incidents || []);
      setStats(statsRes.data.stats || stats);
      setSOSAlerts(sosRes.data.alerts?.filter((a: SOSAlert) => a.status === 'active') || []);

      if (showToast) {
        toast({ title: 'Dashboard refreshed' });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    try {
      await api.put(`/incidents/${incidentId}/status`, { status: newStatus });
      toast({
        title: 'Status Updated',
        description: `Incident status changed to ${newStatus}`,
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteIncident = async (incidentId: string) => {
    if (!confirm('Are you sure you want to delete this incident?')) return;
    
    try {
      await api.delete(`/incidents/${incidentId}`);
      toast({ title: 'Incident deleted' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete incident',
        variant: 'destructive'
      });
    }
  };

  const handleResolveSOSAlert = async (alertId: string) => {
    try {
      await api.put(`/sos/${alertId}/resolve`);
      toast({ title: 'SOS Alert resolved' });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve SOS alert',
        variant: 'destructive'
      });
    }
  };

  const statCards = [
    {
      title: 'Active Incidents',
      value: stats.activeIncidents,
      icon: AlertTriangle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Resolved Today',
      value: stats.resolvedToday,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Critical',
      value: stats.criticalCount,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Pending Review',
      value: stats.pendingVerification,
      icon: Clock,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  const priorityIncidents = incidents
    .filter((i) => i.severity === 'critical' || i.severity === 'high')
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine which page to render based on path
  const renderContent = () => {
    if (currentPath === '/admin' || currentPath === '/admin/') {
      return renderDashboard();
    } else if (currentPath === '/admin/incidents') {
      return renderAllIncidents();
    } else if (currentPath === '/admin/priority') {
      return renderPriorityQueue();
    } else if (currentPath === '/admin/analytics') {
      return renderAnalytics();
    } else if (currentPath === '/admin/responders') {
      return renderResponders();
    } else if (currentPath === '/admin/settings') {
      return renderSettings();
    }
    return renderDashboard(); // Default
  };

  const renderDashboard = () => (
    <div className="min-h-screen pt-16 bg-background">
      <AdminSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      
      <main
        className={cn(
          'transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">
                Overview of incident management and response metrics
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>

          {/* SOS Alerts Banner */}
          {sosAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-5 h-5 text-red-500 animate-pulse" />
                <h2 className="font-semibold text-red-500">Active SOS Alerts ({sosAlerts.length})</h2>
              </div>
              <div className="space-y-2">
                {sosAlerts.slice(0, 3).map((alert) => (
                  <div key={alert._id} className="flex items-center justify-between bg-background/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">{alert.userId?.name || alert.userId?.email}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location?.address || `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}`}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleResolveSOSAlert(alert._id)}>
                      <UserCheck className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                    <stat.icon className={cn('w-5 h-5', stat.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Priority Queue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1 bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2 text-card-foreground">
                  <TrendingUp className="w-5 h-5 text-destructive" />
                  Priority Queue
                </h2>
                <Link to="/feed">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>

              {priorityIncidents.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No high priority incidents
                </p>
              ) : (
                <div className="space-y-3">
                  {priorityIncidents.map((incident) => (
                    <Link
                      key={incident._id}
                      to={`/incident/${incident._id}`}
                      className={cn(
                        'block p-3 rounded-lg border transition-colors hover:bg-accent/50',
                        incident.severity === 'critical' 
                          ? 'border-destructive/30 bg-destructive/5' 
                          : 'border-warning/30 bg-warning/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'p-1.5 rounded-md',
                          incident.severity === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'
                        )}>
                          {typeIcons[incident.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate text-card-foreground">{incident.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(incident.createdAt || Date.now()), { addSuffix: true })}
                          </p>
                        </div>
                        <SeverityBadge severity={incident.severity} showIcon={false} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Incidents Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="p-5 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-card-foreground">All Incidents</h2>
                  <Link to="/feed">
                    <Button variant="ghost" size="sm">View All</Button>
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                        Incident
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                        Type
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                        Severity
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {incidents.slice(0, 5).map((incident) => (
                      <tr key={incident._id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="max-w-xs">
                            <p className="font-medium text-sm truncate text-card-foreground">{incident.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {incident.location.address}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{typeIcons[incident.type]}</span>
                            <span className="text-sm capitalize text-card-foreground">{incident.type.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <SeverityBadge severity={incident.severity} />
                        </td>
                        <td className="px-5 py-4">
                          <Select
                            value={incident.status}
                            onValueChange={(value) => handleStatusChange(incident._id, value as IncidentStatus)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unverified">Unverified</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-5 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link to={`/incident/${incident._id}`}>
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeleteIncident(incident._id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {incidents.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No incidents reported yet</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );

  const renderAllIncidents = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">All Incidents</h1>
        <p className="text-muted-foreground">View and manage all reported incidents</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Incident</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Type</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Severity</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {incidents.map((incident) => (
                <tr key={incident._id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="max-w-xs">
                      <p className="font-medium text-sm truncate text-card-foreground">{incident.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{incident.location.address}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{typeIcons[incident.type]}</span>
                      <span className="text-sm capitalize text-card-foreground">{incident.type.replace('-', ' ')}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-5 py-4">
                    <Select value={incident.status} onValueChange={(value) => handleStatusChange(incident._id, value as IncidentStatus)}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unverified">Unverified</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-5 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/incident/${incident._id}`}><DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem></Link>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteIncident(incident._id)}><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPriorityQueue = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Priority Queue</h1>
        <p className="text-muted-foreground">High priority incidents requiring immediate attention</p>
      </div>

      <div className="grid gap-4">
        {priorityIncidents.map((incident) => (
          <Link key={incident._id} to={`/incident/${incident._id}`} className={cn('block p-5 rounded-xl border transition-colors hover:bg-accent/50', incident.severity === 'critical' ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5')}>
            <div className="flex items-start gap-4">
              <div className={cn('p-3 rounded-lg', incident.severity === 'critical' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning')}>{typeIcons[incident.type]}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-card-foreground">{incident.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="w-3 h-3" />{incident.location.address}</p>
                  </div>
                  <SeverityBadge severity={incident.severity} />
                </div>
              </div>
            </div>
          </Link>
        ))}
        {priorityIncidents.length === 0 && <p className="text-center py-12 text-muted-foreground">No high priority incidents</p>}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Incident statistics and trends</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-lg', stat.bgColor)}><stat.icon className={cn('w-6 h-6', stat.color)} /></div>
            </div>
            <p className="text-3xl font-bold text-card-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const renderResponders = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Responders</h1>
        <p className="text-muted-foreground">Manage emergency responders and teams</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground">Responder management features will be available soon</p>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Settings</h1>
        <p className="text-muted-foreground">Configure system settings and preferences</p>
      </div>
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
        <p className="text-muted-foreground">Settings panel will be available soon</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 bg-background">
      <AdminSidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      
      <main className={cn('transition-all duration-300', sidebarCollapsed ? 'ml-16' : 'ml-60')}>
        {renderContent()}
      </main>
    </div>
  );
}
