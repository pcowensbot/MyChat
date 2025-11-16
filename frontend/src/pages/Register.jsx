import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { generateKeyPair, generateFingerprint, encryptPrivateKey } from '../lib/crypto/encryption'
import { storePrivateKey, storePublicKey, storeSessionPassword } from '../lib/crypto/storage'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
  })
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      alert('Password must be at least 8 characters')
      return
    }

    try {
      setIsGeneratingKeys(true)

      // Generate encryption keys
      const { publicKey, privateKey, publicKeyPEM } = await generateKeyPair()

      // Generate fingerprint
      const fingerprint = await generateFingerprint(publicKey)

      // Encrypt private key with password
      const encryptedPrivateKey = await encryptPrivateKey(privateKey, formData.password)

      // Store keys locally
      await storePrivateKey(encryptedPrivateKey)
      await storePublicKey(publicKey)
      storeSessionPassword(formData.password)

      setIsGeneratingKeys(false)

      // Register with backend
      await register({
        username: formData.username,
        password: formData.password,
        email: formData.email || null,
        publicKey: publicKeyPEM,
        fingerprint: fingerprint,
        privateKey: privateKey,
      })

      navigate('/chat')
    } catch (error) {
      setIsGeneratingKeys(false)
      alert(error.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            MyChat
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Federated Privacy-First Chat
          </p>
          <h3 className="mt-4 text-center text-2xl font-bold text-gray-900">
            Create Account
          </h3>
        </div>

        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-xs text-blue-800">
              🔐 Your encryption keys will be generated locally and stored securely on your device.
              Your private key never leaves your browser.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || isGeneratingKeys}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingKeys ? 'Generating keys...' : isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
