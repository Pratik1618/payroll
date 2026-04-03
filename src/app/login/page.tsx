'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { withBasePath } from '@/lib/base-path'

export default function LoginPage() {
  const router = useRouter()

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(withBasePath('/api/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, // ⚠️ change to username if needed
          password,
        }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        data = { message: 'Invalid server response' }
      }

      if (!res.ok) {
        throw new Error(
          data?.errors?.[0]?.errorMessage ||
          data?.message ||
          'Login failed'
        )
      }

      // ✅ store token in cookie (middleware compatible)
      const token = data?.results?.access_token
      if (token) {
        document.cookie = `token=${token}; path=/; max-age=86400`
      }

      // 🚀 smooth redirect
      router.replace('/dashboard')

    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 🔥 Full Screen Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-sm">Signing you in...</p>
          </div>
        </div>
      )}

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Enter your credentials to login
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2 relative">
                <Label>Password</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </Button>

              {/* Extra Links */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <a href="#" className="hover:underline">
                  Forgot password?
                </a>
                <a href="#" className="hover:underline">
                  Sign up
                </a>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
