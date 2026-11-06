import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/reset-password')({ head: () => ({ meta: [{ title: 'Reset Password | Visit Rwanda' }, { name: 'description', content: 'Securely reset your Visit Rwanda account password.' }, { property: 'og:title', content: 'Reset Password | Visit Rwanda' }, { property: 'og:description', content: 'Set a new visitor account password.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: ResetPassword });
function ResetPassword() {
  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setValid(new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'); }, []);
  return <section className="mx-auto min-h-screen max-w-md px-6 pt-36"><h1 className="text-4xl">New password</h1>{valid ? <form className="mt-8 grid gap-4" onSubmit={async e => {
    e.preventDefault(); setBusy(true);
    const password = String(new FormData(e.currentTarget).get('password'));
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? error.message : 'Password updated.'); setBusy(false);
  }}><label>New password<input required name="password" type="password" minLength={8} autoComplete="new-password" className="mt-2 w-full rounded-lg border border-input bg-background p-3"/></label><Button disabled={busy}>Save password</Button></form> : <p className="mt-6 text-muted-foreground">Open the password reset link from your email.</p>}<p role="status" className="mt-4">{message}</p><Button asChild variant="link"><Link to="/auth">Back to sign in</Link></Button></section>;
}