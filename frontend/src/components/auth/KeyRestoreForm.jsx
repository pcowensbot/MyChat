/**
 * Key Restore Form Component
 * Allows users to restore their encryption keys from a backup ZIP file
 */

import { useState } from 'react';
import { importKeysFromZip, validateKeyBackupFile } from '../../lib/crypto/keyImport.js';
import { storeEncryptedPrivateKey, storePublicKey } from '../../lib/crypto/storage.js';
import './KeyRestoreForm.css';

export default function KeyRestoreForm({ onComplete, onCancel }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [step, setStep] = useState(1); // 1: select file, 2: enter password, 3: success

  // Handle file selection
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setLoading(true);

    try {
      // Validate the file
      const validation = await validateKeyBackupFile(file);

      if (!validation.valid) {
        setError(validation.error);
        setSelectedFile(null);
        setFileInfo(null);
        setLoading(false);
        return;
      }

      setSelectedFile(file);
      setFileInfo(validation.info);
      setStep(2);

    } catch (err) {
      console.error('File validation failed:', err);
      setError('Failed to validate file: ' + err.message);
      setSelectedFile(null);
      setFileInfo(null);
    }

    setLoading(false);
  };

  // Handle key restoration
  const handleRestore = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('Please select a key backup file');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      // Import and decrypt keys from ZIP
      console.log('Importing keys from backup file...');
      const { publicKey, privateKey } = await importKeysFromZip(selectedFile, password);

      // Store keys in IndexedDB
      console.log('Storing keys in browser...');
      await storeEncryptedPrivateKey(privateKey, password);
      await storePublicKey(publicKey);

      setStep(3);
      setLoading(false);

      // Auto-complete after 2 seconds
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);

    } catch (err) {
      console.error('Key restoration failed:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="key-restore-container">
      <div className="key-restore-card">
        <h2>Restore Encryption Keys</h2>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠</span>
            {error}
          </div>
        )}

        {/* Step 1: Select File */}
        {step === 1 && (
          <div className="restore-step">
            <div className="info-box">
              <p>Select the key backup ZIP file you downloaded during registration.</p>
              <p>You will need the password you used when creating your account.</p>
            </div>

            <div className="file-upload">
              <input
                type="file"
                id="key-file"
                accept=".zip"
                onChange={handleFileSelect}
                disabled={loading}
              />
              <label htmlFor="key-file" className="file-upload-label">
                <span className="file-icon">📁</span>
                <span>Choose Key Backup File</span>
              </label>
            </div>

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Validating file...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Enter Password */}
        {step === 2 && (
          <div className="restore-step">
            <div className="success-box">
              <h3>✓ Valid Key Backup File</h3>
              {fileInfo && (
                <div className="file-details">
                  <p><strong>Created:</strong> {new Date(fileInfo.created).toLocaleString()}</p>
                  <p><strong>Algorithm:</strong> {fileInfo.algorithm}</p>
                  <p><strong>Version:</strong> {fileInfo.version}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleRestore} className="password-form">
              <div className="form-group">
                <label htmlFor="password">Enter Your Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the password used to encrypt these keys"
                  required
                  autoFocus
                  disabled={loading}
                />
                <small className="form-hint">
                  This is the password you chose when creating your account
                </small>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedFile(null);
                    setFileInfo(null);
                    setPassword('');
                  }}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Restoring...' : 'Restore Keys'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="restore-step">
            <div className="success-animation">
              <div className="checkmark">✓</div>
              <h3>Keys Restored Successfully!</h3>
              <p>Your encryption keys have been restored and stored securely in your browser.</p>
              <p className="redirect-message">Redirecting...</p>
            </div>
          </div>
        )}

        {/* Cancel button */}
        {step !== 3 && onCancel && (
          <button
            onClick={onCancel}
            className="btn-link"
            disabled={loading}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
