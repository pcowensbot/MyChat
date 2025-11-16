/**
 * Registration Form Component
 * Handles user registration with mandatory PGP key download
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateKeyPair, generateFingerprint, jwkToPem } from '../../lib/crypto/keys.js';
import { storeEncryptedPrivateKey, storePublicKey } from '../../lib/crypto/storage.js';
import { exportKeysToZip, downloadKeysZip } from '../../lib/crypto/keyExport.js';
import './RegisterForm.css';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: form, 2: key generation, 3: key download, 4: confirmation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyData, setKeyData] = useState(null);
  const [keysDownloaded, setKeysDownloaded] = useState(false);
  const [confirmationChecked, setConfirmationChecked] = useState(false);

  // Form validation
  const validateForm = () => {
    if (!formData.username || formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  // Step 1: Submit form and generate keys
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setCurrentStep(2);

    try {
      // Generate RSA-4096 key pair
      console.log('Generating RSA-4096 key pair...');
      const { publicKey, privateKey } = await generateKeyPair();

      // Generate fingerprint
      const fingerprint = await generateFingerprint(publicKey);

      // Convert public key to PEM for server
      const publicKeyPem = await jwkToPem(publicKey);

      setKeyData({
        publicKey,
        privateKey,
        fingerprint,
        publicKeyPem
      });

      // Move to key download step
      setCurrentStep(3);
      setLoading(false);

    } catch (err) {
      console.error('Key generation failed:', err);
      setError('Failed to generate encryption keys: ' + err.message);
      setLoading(false);
      setCurrentStep(1);
    }
  };

  // Step 2: Download keys
  const handleDownloadKeys = async () => {
    setLoading(true);
    setError('');

    try {
      // Create password-protected ZIP
      console.log('Creating encrypted key backup...');
      const zipBlob = await exportKeysToZip(
        keyData.publicKey,
        keyData.privateKey,
        formData.password,
        formData.username
      );

      // Trigger download
      downloadKeysZip(zipBlob, formData.username);

      setKeysDownloaded(true);
      setLoading(false);

      // Show confirmation message
      alert('✓ Keys downloaded successfully!\n\nIMPORTANT: Store this file in a safe place. You will need it to restore your account if you clear your browser data.');

    } catch (err) {
      console.error('Key export failed:', err);
      setError('Failed to export keys: ' + err.message);
      setLoading(false);
    }
  };

  // Step 3: Confirm download and complete registration
  const handleCompleteRegistration = async () => {
    if (!keysDownloaded) {
      setError('You must download your keys before completing registration');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Store keys in IndexedDB (encrypted)
      console.log('Storing encrypted keys in browser...');
      await storeEncryptedPrivateKey(keyData.privateKey, formData.password);
      await storePublicKey(keyData.publicKey);

      // Register with server
      console.log('Registering with server...');
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          public_key: keyData.publicKeyPem,
          public_key_fingerprint: keyData.fingerprint
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful:', data);

      // Store auth token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('username', formData.username);

      // Redirect to chat
      navigate('/chat');

    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed: ' + err.message);
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Create MyChat Account</h1>

        {/* Progress indicator */}
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Account Info</div>
          </div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Generate Keys</div>
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Download Keys</div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {/* Step 1: Registration Form */}
        {currentStep === 1 && (
          <form onSubmit={handleFormSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Choose a username"
                required
                minLength={3}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Choose a strong password"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <small className="form-hint">At least 8 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Re-enter your password"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              Continue
            </button>
          </form>
        )}

        {/* Step 2: Generating Keys */}
        {currentStep === 2 && (
          <div className="key-generation-step">
            <div className="spinner"></div>
            <h2>Generating Encryption Keys...</h2>
            <p>Please wait while we generate your RSA-4096 encryption keys.</p>
            <p className="info-text">This may take a few seconds.</p>
          </div>
        )}

        {/* Step 3: Download Keys */}
        {currentStep === 3 && (
          <div className="key-download-step">
            <div className="warning-box">
              <h2>⚠️ CRITICAL: Download Your Keys</h2>
              <p><strong>You MUST download and securely store your encryption keys.</strong></p>

              <div className="warning-details">
                <h3>Why is this important?</h3>
                <ul>
                  <li>Your keys are stored in your browser's local storage</li>
                  <li>If you clear your browser data, your keys will be LOST</li>
                  <li>Without your keys, you CANNOT decrypt your messages</li>
                  <li>We CANNOT recover your keys for you</li>
                </ul>

                <h3>What will be downloaded?</h3>
                <ul>
                  <li>A password-protected ZIP file containing:</li>
                  <li style={{ marginLeft: '2em' }}>• Your encrypted private key</li>
                  <li style={{ marginLeft: '2em' }}>• Your encrypted public key</li>
                  <li style={{ marginLeft: '2em' }}>• Instructions for restoring keys</li>
                </ul>

                <h3>How to store it safely:</h3>
                <ul>
                  <li>Save it in a secure password manager</li>
                  <li>Make multiple backups in different secure locations</li>
                  <li>DO NOT share this file with anyone</li>
                  <li>DO NOT upload to unsecured cloud storage</li>
                </ul>
              </div>

              <div className="key-info">
                <p><strong>Key Fingerprint:</strong></p>
                <code className="fingerprint">{keyData?.fingerprint}</code>
              </div>
            </div>

            <div className="button-group">
              <button
                onClick={handleDownloadKeys}
                className="btn btn-primary btn-large"
                disabled={loading}
              >
                {loading ? 'Creating Backup...' : '📥 Download Keys (Required)'}
              </button>
            </div>

            {keysDownloaded && (
              <div className="success-box">
                <h3>✓ Keys Downloaded Successfully</h3>
                <p>Please confirm that you have saved the file in a secure location.</p>

                <div className="confirmation-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      id="confirm-saved"
                      checked={confirmationChecked}
                      onChange={(e) => setConfirmationChecked(e.target.checked)}
                    />
                    <span>I confirm that I have downloaded and securely stored my encryption keys</span>
                  </label>
                </div>

                <button
                  id="complete-registration"
                  onClick={handleCompleteRegistration}
                  className="btn btn-success btn-large"
                  disabled={!confirmationChecked || loading}
                >
                  {loading ? 'Completing Registration...' : 'Complete Registration'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
