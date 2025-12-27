import { IncidentMap } from '@/components/IncidentMap';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { mockIncidents } from '@/data/mockData';
import { Incident } from '@/types/incident';
import { Filter, List, Map as MapIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MapViewPage() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>(mockIncidents);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Apply filters
    let filtered = incidents;

    if (severityFilter !== 'all') {
      filtered = filtered.filter((i) => i.severity === severityFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((i) => i.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    setFilteredIncidents(filtered);
  }, [incidents, severityFilter, typeFilter, statusFilter]);

  const handleIncidentClick = (incident: Incident) => {
    navigate(`/incident/${incident._id}`);
  };

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Live Incident Map</h1>
              <p className="text-sm text-muted-foreground">
                Real-time visualization of reported incidents
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/feed')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List View
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Filters</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Severity
              </label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="public-safety">Public Safety</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(severityFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSeverityFilter('all');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Map */}
        <IncidentMap
          incidents={filteredIncidents}
          onIncidentClick={handleIncidentClick}
          height="calc(100vh - 300px)"
          className="shadow-lg"
        />
      </div>
    </div>
  );
}
