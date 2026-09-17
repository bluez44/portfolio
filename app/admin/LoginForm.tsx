'use client';

import { useActionState } from 'react';
import { loginAction } from './actions';

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <form action={formAction} className="flex flex-col gap-4 p-8 bg-zinc-900 rounded-lg shadow-lg w-full max-w-sm border border-zinc-800">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        
        {state?.error && (
          <div className="p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
            {state.error}
          </div>
        )}

        <input 
          name="username" 
          placeholder="Username" 
          className="p-3 bg-zinc-800 text-white rounded border border-zinc-700 outline-none focus:border-zinc-500" 
          required 
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          className="p-3 bg-zinc-800 text-white rounded border border-zinc-700 outline-none focus:border-zinc-500" 
          required 
        />
        <button 
          type="submit" 
          disabled={pending}
          className="bg-white text-black font-semibold p-3 rounded mt-2 hover:bg-gray-200 transition disabled:opacity-50"
        >
          {pending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
