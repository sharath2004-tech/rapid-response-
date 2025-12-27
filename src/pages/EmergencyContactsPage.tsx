import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    Bell,
    Edit2,
    Loader2,
    Phone,
    Plus,
    Save,
    Star,
    Trash2,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EmergencyContact {
  _id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  notifyOnSOS: boolean;
}

const relationships = [
  { value: 'family', label: 'Family' },
  { value: 'friend', label: 'Friend' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other', label: 'Other' },
];

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'family',
    isPrimary: false,
    notifyOnSOS: true,
  });

  const fetchContacts = async () => {
    try {
      const response = await api.get('/emergency-contacts');
      setContacts(response.data.contacts || []);
    } catch (error) {
      console.error('Fetch contacts error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load emergency contacts.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingContact) {
        await api.put(`/emergency-contacts/${editingContact._id}`, formData);
        toast({ title: 'Contact updated successfully' });
      } else {
        await api.post('/emergency-contacts', formData);
        toast({ title: 'Contact added successfully' });
      }
      
      fetchContacts();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save contact.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      await api.delete(`/emergency-contacts/${id}`);
      toast({ title: 'Contact deleted successfully' });
      fetchContacts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete contact.',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      isPrimary: contact.isPrimary,
      notifyOnSOS: contact.notifyOnSOS,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingContact(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: 'family',
      isPrimary: false,
      notifyOnSOS: true,
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Emergency Contacts
              </h1>
              <p className="text-muted-foreground">
                Add contacts who will be notified when you trigger an SOS alert.
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </motion.div>

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {editingContact ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contact name"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 9876543210"
                      required
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email (Optional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contact@example.com"
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Relationship *</label>
                  <div className="flex flex-wrap gap-2">
                    {relationships.map((rel) => (
                      <button
                        key={rel.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, relationship: rel.value })}
                        className={cn(
                          'px-4 py-2 rounded-lg border transition-colors',
                          formData.relationship === rel.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        {rel.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="w-4 h-4 rounded border-input"
                    />
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">Primary Contact</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notifyOnSOS}
                      onChange={(e) => setFormData({ ...formData, notifyOnSOS: e.target.checked })}
                      className="w-4 h-4 rounded border-input"
                    />
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="text-sm">Notify on SOS</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingContact ? 'Update Contact' : 'Save Contact'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Contacts List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Emergency Contacts</h3>
            <p className="text-muted-foreground mb-4">
              Add contacts who should be notified during emergencies.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'bg-card border rounded-xl p-4 flex items-center gap-4',
                  contact.isPrimary ? 'border-yellow-500/50' : 'border-border'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
                  contact.isPrimary ? 'bg-yellow-500/20 text-yellow-500' : 'bg-muted text-muted-foreground'
                )}>
                  {contact.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{contact.name}</h3>
                    {contact.isPrimary && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {contact.notifyOnSOS && (
                      <Bell className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {contact.phone}
                    </span>
                    <span className="capitalize">{contact.relationship}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(contact)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(contact._id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
