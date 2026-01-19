'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jobsApi } from '@/lib/jobs';
import { customersApi } from '@/lib/customers';
import { statusesApi } from '@/lib/statuses';
import { usersApi } from '@/lib/users';
import { Customer, JobStatus, User } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function NewJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [statuses, setStatuses] = useState<JobStatus[]>([]);
    const [workers, setWorkers] = useState<User[]>([]);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        customerId: '',
        statusId: '',
        assignedWorkerId: '',
        scheduledDate: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [customersData, statusesData, workersData] = await Promise.all([
                customersApi.getAll(),
                statusesApi.getAll(),
                usersApi.getWorkers(),
            ]);
            setCustomers(customersData);
            setStatuses(statusesData);
            setWorkers(workersData);

            // Set default status
            if (statusesData.length > 0) {
                setFormData(prev => ({ ...prev, statusId: statusesData[0].id }));
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await jobsApi.create({
                title: formData.title,
                description: formData.description || undefined,
                customerId: formData.customerId,
                statusId: formData.statusId,
                assignedWorkerId: formData.assignedWorkerId || undefined,
                scheduledDate: formData.scheduledDate || undefined,
            });
            router.push('/admin/jobs');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/jobs">
                    <button className="p-2 rounded-lg hover:bg-slate-100">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">New Job</h1>
                    <p className="text-slate-500">Create a new job</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-6">
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{error}</div>
                )}

                <Input
                    label="Job Title *"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter job title"
                    required
                />

                <div className="space-y-1.5">
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter job description"
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium">Customer *</label>
                        <select
                            value={formData.customerId}
                            onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="">Select customer</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>{customer.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium">Status *</label>
                        <select
                            value={formData.statusId}
                            onChange={(e) => setFormData(prev => ({ ...prev, statusId: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            {statuses.map((status) => (
                                <option key={status.id} value={status.id}>{status.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium">Assign Worker</label>
                        <select
                            value={formData.assignedWorkerId}
                            onChange={(e) => setFormData(prev => ({ ...prev, assignedWorkerId: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Unassigned</option>
                            {workers.map((worker) => (
                                <option key={worker.id} value={worker.id}>{worker.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium">Scheduled Date</label>
                        <input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Link href="/admin/jobs">
                        <Button type="button" variant="secondary">Cancel</Button>
                    </Link>
                    <Button type="submit" loading={loading}>
                        <Save className="w-4 h-4" />
                        Create Job
                    </Button>
                </div>
            </form>
        </div>
    );
}
