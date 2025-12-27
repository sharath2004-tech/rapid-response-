import { IncidentCard } from '@/components/IncidentCard';
import { IncidentMap } from '@/components/IncidentMap';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Incident, IncidentStatus, IncidentType, incidentTypes, SeverityLevel } from '@/types/incident';
import { motion } from 'framer-motion';
import {
    Filter,
    Grid,
    List,
    Loader2,
    Radio,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ViewMode = 'list' | 'grid';

export default function FeedPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filters
  const [selectedTypes, setSelectedTypes] = useState<IncidentType[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<SeverityLevel[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<IncidentStatus[]>([]);

  const severities: SeverityLevel[] = ['critical', 'high', 'medium', 'low'];
  const statuses: IncidentStatus[] = ['unverified', 'verified', 'in-progress', 'resolved'];

  // Fetch incidents from backend
  const fetchIncidents = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setIsRefreshing(true);
      const response = await api.get('/incidents');
      setIncidents(response.data.incidents || []);
      if (showRefreshToast) {
        toast({
          title: 'Feed Updated',
          description: `${response.data.incidents?.length || 0} incidents loaded`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching incidents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load incidents. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchIncidents();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const toggleFilter = <T extends string>(value: T, list: T[], setList: (val: T[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedSeverities([]);
    setSelectedStatuses([]);
    setSearchQuery('');
  };

  // Handle verification update from IncidentCard
  const handleVerify = (incidentId: string, newCount: number, hasVerified: boolean) => {
    setIncidents(prev => prev.map(incident => {
      if (incident._id === incidentId) {
        return {
          ...incident,
          verificationCount: newCount,
          // Auto-verify if count >= 3
          status: newCount >= 3 && incident.status === 'unverified' ? 'verified' : incident.status,
        };
      }
      return incident;
    }));
  };

  const hasActiveFilters = selectedTypes.length > 0 || selectedSeverities.length > 0 || selectedStatuses.length > 0 || searchQuery.length > 0;

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          incident.title.toLowerCase().includes(query) ||
          incident.description.toLowerCase().includes(query) ||
          incident.location.address.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(incident.type)) {
        return false;
      }

      // Severity filter
      if (selectedSeverities.length > 0 && !selectedSeverities.includes(incident.severity)) {
        return false;
      }

      // Status filter
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(incident.status)) {
        return false;
      }

      return true;
    });
  }, [incidents, searchQuery, selectedTypes, selectedSeverities, selectedStatuses]);

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          {/* Title Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="w-6 h-6 text-destructive" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Live Incident Feed</h1>
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Loading...' : `${filteredIncidents.length} active incidents`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchIncidents(true)}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center rounded-lg border border-border p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list' ? 'bg-accent' : 'hover:bg-accent/50'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid' ? 'bg-accent' : 'hover:bg-accent/50'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant={showFilters ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="relative"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {selectedTypes.length + selectedSeverities.length + selectedStatuses.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incidents by title, description, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {/* Type Filters */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Incident Type</p>
                  <div className="flex flex-wrap gap-2">
                    {incidentTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => toggleFilter(type.value, selectedTypes, setSelectedTypes)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                          selectedTypes.includes(type.value)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background border-border hover:border-primary/50'
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity Filters */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Severity</p>
                  <div className="flex flex-wrap gap-2">
                    {severities.map((severity) => (
                      <button
                        key={severity}
                        onClick={() => toggleFilter(severity, selectedSeverities, setSelectedSeverities)}
                        className={cn(
                          'transition-opacity',
                          selectedSeverities.includes(severity) ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                        )}
                      >
                        <SeverityBadge severity={severity} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filters */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => toggleFilter(status, selectedStatuses, setSelectedStatuses)}
                        className={cn(
                          'transition-opacity',
                          selectedStatuses.includes(status) ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                        )}
                      >
                        <StatusBadge status={status} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading incidents...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Map View */}
            <div className="lg:sticky lg:top-52 h-[400px] lg:h-[calc(100vh-14rem)] rounded-xl overflow-hidden border border-border">
              <IncidentMap 
                incidents={filteredIncidents} 
                height="100%"
              />
            </div>

            {/* Incidents List */}
            <div className="space-y-4">
              {filteredIncidents.length === 0 ? (
                <div className="text-center py-12">
                  <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No incidents found</h3>
                  <p className="text-muted-foreground mb-4">
                    {incidents.length === 0 
                      ? 'No incidents have been reported yet.' 
                      : 'Try adjusting your filters or search query'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className={cn(
                  viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'
                )}>
                  {filteredIncidents.map((incident, index) => (
                    <IncidentCard 
                      key={incident._id} 
                      incident={incident} 
                      index={index}
                      onVerify={handleVerify}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
