import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { Button } from '@/components/ui/button';
import { useVisitorSession } from '@/components/site/VisitorSession';

export const Route = createFileRoute('/auth')({
  validateSearch: (s: Record<string, unknown>): { attraction?: string | undefined } => ({ attraction: typeof s['attraction'] === 'string' ? s['attraction'] : undefined }),
  head: () => ({ meta: [{ title: 'Visitor Sign In | Visit Rwanda' }, { name: 'description', content: 'Sign in or create your Visit Rwanda visitor account.' }, { property: 'og:title', content: 'Visitor Sign In | Visit Rwanda' }, { property: 'og:description', content: 'Secure access to your Rwanda trip account.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useVisitorSession();
  const { attraction } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const saved = sessionStorage.getItem('rwanda-book-attraction');
    sessionStorage.removeItem('rwanda-book-attraction');
    const destination = attraction ?? saved;
    if (destination) void navigate({ to: '/book', search: { attraction: destination }, replace: true });
    else void navigate({ to: '/account', replace: true });
  }, [user, attraction, navigate]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '');
    const password = String(form.get('password') ?? '');

    try {
      if (mode === 'forgot') {
        const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (result.error) throw result.error;
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'signup') {
        if (attraction) sessionStorage.setItem('rwanda-book-attraction', attraction);
        const result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              display_name: String(form.get('name') ?? ''),
              phone: String(form.get('phone') ?? ''),
              date_of_birth: String(form.get('date_of_birth') ?? ''),
              nationality: String(form.get('nationality') ?? ''),
              national_id_option: String(form.get('national_id_option') ?? 'not_provided'),
            },
          },
        });
        if (result.error) throw result.error;
        if (!result.data.session) setMessage('Check your email to confirm your account, then sign in.');
      } else {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function social(provider: 'google' | 'lovable') {
    if (attraction) sessionStorage.setItem('rwanda-book-attraction', attraction);
    setBusy(true); setMessage('');
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) setMessage(result.error.message);
    } catch {
      setMessage('Unable to sign in. Try again.');
    } finally {
      setBusy(false);
    }
  }

  const field = 'w-full rounded-lg border border-input bg-background px-4 py-3';

  return <section className="mx-auto min-h-screen max-w-md px-6 pb-20 pt-36">
    <p className="eyebrow">Visit Rwanda</p>
    <h1 className="mt-3 text-4xl">{mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}</h1>
    {mode !== 'forgot' && <div className="mt-8 grid gap-3">
      <Button variant="outline" className="google-signin h-12" disabled={busy} onClick={() => social('google')}>Continue with Google</Button>
      <Button className="lovable-auth-button h-12" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button>
    </div>}
    <form onSubmit={submit} className="mt-8 grid gap-4">
      {mode === 'signup' && (
        <>
          <label>Full name<input name="name" required autoComplete="name" className={field} /></label>
          <label>Telephone number<input name="phone" required type="tel" autoComplete="tel" className={field} /></label>
          <label>Date of birth<input name="date_of_birth" required type="date" className={field} /></label>
          <label>Nationality<input name="nationality" required className={field} /></label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground"><input type="checkbox" name="national_id_option" value="no_national_id" className="h-4 w-4" /> I do not have a national ID</label>
        </>
      )}
      <label>Email<input name="email" required type="email" autoComplete="email" className={field} /></label>
      {mode !== 'forgot' && (
        <label>Password<input name="password" required type="password" minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className={field} /></label>
      )}
      {message && <p role="status" className="text-sm text-gold">{message}</p>}
      <Button disabled={busy} className="h-12 bg-accent text-accent-foreground">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in'}</Button>
    </form>
    <div className="mt-5 flex flex-wrap gap-2">
      <Button variant="link" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>
        {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
      </Button>
      <Button variant="link" onClick={() => { setMode('forgot'); setMessage(''); }}>Forgot password?</Button>
    </div>
  </section>;
}
