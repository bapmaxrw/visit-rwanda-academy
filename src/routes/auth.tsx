import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState, type FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import '@lovable.dev/cloud-auth-js/styles.css';
import { Button } from '@/components/ui/button';
import { useVisitorSession } from '@/components/site/VisitorSession';

export const Route = createFileRoute('/auth')({
  validateSearch: (s: Record<string, unknown>): { attraction?: string } => ({ attraction: typeof s.attraction === 'string' ? s.attraction : undefined }),
  head: () => ({ meta: [{ title: 'Visitor Sign In | Visit Rwanda' }, { name: 'description', content: 'Sign in or create your Visit Rwanda visitor account.' }, { property: 'og:title', content: 'Visitor Sign In | Visit Rwanda' }, { property: 'og:description', content: 'Access your Rwanda booking history.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
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
    const email = String(form.get('email'));
    const password = String(form.get('password') ?? '');
    try {
      if (mode === 'forgot') {
        const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (result.error) throw result.error;
        setMessage('Check your email for a password reset link.');
      } else if (mode === 'signup') {
        if (attraction) sessionStorage.setItem('rwanda-book-attraction', attraction);
        const result = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin, data: { display_name: String(form.get('name')) } } });
        if (result.error) throw result.error;
        if (!result.data.session) setMessage('Check your email to confirm your account, then sign in.');
      } else {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to sign in. Try again.'); }
    finally { setBusy(false); }
  }
  async function social(provider: 'google' | 'lovable') {
    if (attraction) sessionStorage.setItem('rwanda-book-attraction', attraction);
    setBusy(true); setMessage('');
    try { const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` }); if (result.error) setMessage(result.error.message); }
    catch { setMessage('Unable to sign in. Try again.'); }
    finally { setBusy(false); }
  }
  const field = 'w-full rounded-lg border border-input bg-background px-4 py-3';
  return <section className="mx-auto min-h-screen max-w-md px-6 pb-20 pt-36">
    <p className="eyebrow">Visit Rwanda</p><h1 className="mt-3 text-4xl">{mode === 'signup' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}</h1>
    {mode !== 'forgot' && <div className="mt-8 grid gap-3">
      <Button variant="outline" className="google-signin h-12" disabled={busy} onClick={() => social('google')}><svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>Continue with Google</Button>
      <Button className="lovable-auth-button h-12" disabled={busy} onClick={() => social('lovable')}>Continue with Lovable</Button>
    </div>}
    <form onSubmit={submit} className="mt-8 grid gap-4">
      {mode === 'signup' && <label>Full name<input name="name" required autoComplete="name" className={field}/></label>}
      <label>Email<input name="email" required type="email" autoComplete="email" className={field}/></label>
      {mode !== 'forgot' && <label>Password<input name="password" required type="password" minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className={field}/></label>}
      {message && <p role="status" className="text-sm text-gold">{message}</p>}
      <Button disabled={busy} className="h-12 bg-accent text-accent-foreground">{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : 'Sign in'}</Button>
    </form>
    <div className="mt-5 flex flex-wrap gap-2"><Button variant="link" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setMessage(''); }}>{mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}</Button><Button variant="link" onClick={() => { setMode(mode === 'forgot' ? 'signin' : 'forgot'); setMessage(''); }}>{mode === 'forgot' ? 'Back to sign in' : 'Forgot password?'}</Button></div>
  </section>;
}