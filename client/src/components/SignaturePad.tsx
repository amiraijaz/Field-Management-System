'use client';

import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { signaturesApi, Signature } from '@/lib/signatures';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  PenTool,
  Trash2,
  RotateCcw,
  Check,
  User,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';

interface SignaturePadProps {
  jobId: string;
  signatures: Signature[];
  onSignaturesChange: () => void;
}

export default function SignaturePad({
  jobId,
  signatures,
  onSignaturesChange,
}: SignaturePadProps) {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [signerType, setSignerType] = useState<'worker' | 'customer'>('worker');
  const [signerName, setSignerName] = useState('');
  const [saving, setSaving] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

  const handleClear = () => {
    signatureRef.current?.clear();
  };

  const handleSave = async () => {
    if (!signerName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter signer name',
        variant: 'destructive',
      });
      return;
    }

    if (signatureRef.current?.isEmpty()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a signature',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const signatureData = signatureRef.current?.toDataURL() || '';
      await signaturesApi.create(jobId, {
        signerType,
        signerName,
        signatureData,
      });

      toast({
        title: 'Success',
        description: 'Signature saved successfully',
      });

      setShowModal(false);
      setSignerName('');
      signatureRef.current?.clear();
      onSignaturesChange();
    } catch (error: any) {
      console.error('Save signature error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save signature',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (signature: Signature) => {
    if (!confirm(`Are you sure you want to delete this signature?`)) {
      return;
    }

    try {
      await signaturesApi.delete(signature.id);
      toast({
        title: 'Success',
        description: 'Signature deleted successfully',
      });
      onSignaturesChange();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete signature',
        variant: 'destructive',
      });
    }
  };

  const workerSignatures = signatures.filter((s) => s.signer_type === 'worker');
  const customerSignatures = signatures.filter((s) => s.signer_type === 'customer');

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Signatures</CardTitle>
              <span className="text-sm text-muted-foreground">({signatures.length})</span>
            </div>
            <Button onClick={() => setShowModal(true)} size="sm">
              <PenTool className="h-4 w-4 mr-2" />
              Add Signature
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Worker Signatures */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Worker Signatures ({workerSignatures.length})
            </h3>
            {workerSignatures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No worker signatures yet</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {workerSignatures.map((signature) => (
                  <Card key={signature.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{signature.signer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(signature.signed_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(signature)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="border rounded-lg bg-white p-2">
                        <img
                          src={signature.signature_data}
                          alt="Signature"
                          className="w-full h-24 object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Customer Signatures */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Customer Signatures ({customerSignatures.length})
            </h3>
            {customerSignatures.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-lg bg-muted/20">
                <UserCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No customer signatures yet</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {customerSignatures.map((signature) => (
                  <Card key={signature.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium">{signature.signer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(signature.signed_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(signature)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="border rounded-lg bg-white p-2">
                        <img
                          src={signature.signature_data}
                          alt="Signature"
                          className="w-full h-24 object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signature Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Signature</DialogTitle>
            <DialogDescription>
              Draw your signature below and provide your name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Signer Type *</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={signerType === 'worker' ? 'default' : 'outline'}
                  onClick={() => setSignerType('worker')}
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  Worker
                </Button>
                <Button
                  type="button"
                  variant={signerType === 'customer' ? 'default' : 'outline'}
                  onClick={() => setSignerType('customer')}
                  className="flex-1"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Customer
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Signer Name *</label>
              <Input
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Signature *</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
              <div className="border-2 border-dashed rounded-lg bg-white">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'w-full h-48 rounded-lg',
                  }}
                  backgroundColor="white"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Draw your signature using your mouse or touchscreen
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setSignerName('');
                signatureRef.current?.clear();
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} loading={saving}>
              <Check className="h-4 w-4 mr-2" />
              Save Signature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
