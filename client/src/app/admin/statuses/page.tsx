'use client';

import { useState, useEffect, useCallback } from 'react';
import { statusesApi } from '@/lib/statuses';
import { JobStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, GripVertical, Palette } from 'lucide-react';

const COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Violet', value: '#7c3aed' },
];

export default function StatusesPage() {
  const { toast } = useToast();
  const [statuses, setStatuses] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<JobStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', color: '#6366f1' });

  const loadStatuses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await statusesApi.getAll();
      setStatuses(data);
    } catch (error) {
      console.error('Failed to load statuses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statuses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  const openModal = (status?: JobStatus) => {
    if (status) {
      setEditing(status);
      setFormData({ name: status.name, color: status.color });
    } else {
      setEditing(null);
      setFormData({ name: '', color: '#6366f1' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Status name is required.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await statusesApi.update(editing.id, formData);
        toast({
          title: 'Success',
          description: 'Status updated successfully.',
        });
      } else {
        await statusesApi.create(formData);
        toast({
          title: 'Success',
          description: 'Status created successfully.',
        });
      }
      setShowModal(false);
      loadStatuses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save status',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"? This status cannot be deleted if jobs are using it.`
      )
    ) {
      return;
    }
    try {
      await statusesApi.delete(id);
      toast({
        title: 'Success',
        description: 'Status deleted successfully.',
      });
      loadStatuses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.error || 'Cannot delete status that is in use',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Statuses</h1>
          <p className="text-muted-foreground">
            Customize your job workflow statuses and colors
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Status
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Palette className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Custom Status Management</p>
              <p className="text-muted-foreground">
                Create custom statuses to match your workflow. Drag to reorder, and
                assign colors for easy visual identification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statuses List */}
      <Card>
        <CardContent className="p-0">
          {statuses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No statuses yet</p>
              <p className="text-sm">Add your first status to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {statuses.map((status) => (
                <div
                  key={status.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group"
                >
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-move opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div
                    className="w-6 h-6 rounded-lg border-2 border-border shadow-sm"
                    style={{ backgroundColor: status.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{status.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Order: {status.order_index}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Color: {status.color.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(status)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(status.id, status.name)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Count */}
      <div className="text-sm text-muted-foreground">
        Total statuses: {statuses.length}
      </div>

      {/* Add/Edit Status Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Status' : 'Add New Status'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Update the status name and color.'
                : 'Create a new job status for your workflow.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., In Progress, Completed, On Hold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, color: color.value }))
                      }
                      className={`relative w-full aspect-square rounded-lg transition-all hover:scale-110 ${
                        formData.color === color.value
                          ? 'ring-2 ring-offset-2 ring-primary scale-110'
                          : 'hover:ring-2 hover:ring-offset-1 hover:ring-muted-foreground'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {formData.color === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Selected: {formData.color.toUpperCase()}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                {editing ? 'Save Changes' : 'Add Status'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
