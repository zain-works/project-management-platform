import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layers, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button.js';
import { api } from '../../api/client.js';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setError('Missing verification token in the URL.');
      return;
    }

    api.auth
      .verifyEmail(token)
      .then(() => {
        setIsSuccess(true);
      })
      .catch((err) => {
        setError(err.message || 'Verification token is invalid or has expired.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
            <Layers className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">Kairo</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200 text-center">
          {isLoading ? (
            <div className="py-8 space-y-3">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-600" />
              <p className="text-sm font-medium text-slate-600">Verifying your email address...</p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Email Verified!</h2>
              <p className="text-xs text-slate-600">
                Your email address has been confirmed. You now have full access to your Kairo account and workspaces.
              </p>
              <Link to="/app" className="block pt-2">
                <Button className="w-full">Go to Workspace</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Verification Failed</h2>
              <p className="text-xs text-slate-600">{error}</p>
              <Link to="/login" className="block pt-2">
                <Button variant="outline" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
