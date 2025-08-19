"use client";

import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import { updatePassword } from '@/api/apiClient';
import FormCard from '@/components/cards/formCards';
import { showSuccessNotification } from '@/components/ui/NotificationContainer';
import "@/styles/login.css";

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose }) => {
  const [passwordValues, setPasswordValues] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPasswordValues({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordValues({
      ...passwordValues,
      [name]: value
    });
    
    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
    if (errors.general) {
      setErrors({
        ...errors,
        general: undefined
      });
    }
  };

  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    let isValid = true;

    if (!passwordValues.currentPassword.trim()) {
      tempErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordValues.newPassword.trim()) {
      tempErrors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordValues.newPassword.length < 8) {
      tempErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!passwordValues.confirmPassword.trim()) {
      tempErrors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (passwordValues.newPassword !== passwordValues.confirmPassword) {
      tempErrors.confirmPassword = "Passwords must match";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await updatePassword({
        currentPassword: passwordValues.currentPassword,
        newPassword: passwordValues.newPassword,
        confirmPassword: passwordValues.confirmPassword
      });

      if (response.success) {
        // Show success notification like contact us
        showSuccessNotification(
          "Success",
          "Your password has been updated successfully!"
        );
        // Close modal immediately
        onClose();
      }
    } catch (error) {
      // Error is expected for validation errors, no need to log
      
      let errorMessage = 'Failed to update password';
      
      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          // Put current password error under the current password field
          setErrors({
            currentPassword: 'Current password is incorrect'
          });
          return;
        } else if (error.message.includes('Not Authenticated')) {
          errorMessage = 'You must be logged in to change your password';
        } else if (error.message.includes('Unexpected token')) {
          errorMessage = 'Server connection error. Please make sure you are logged in and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({
        general: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="login-container">
        <FormCard 
          title="Change Password" 
          onSubmit={handleSubmit}
          showSubmitButton={false}
        >
          <div className="signup-fields-group">
            <div className="form-group">
              <div className="login-password-field">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordValues.currentPassword}
                  onChange={handleChange}
                  className={errors.currentPassword ? "error" : ""}
                  placeholder="Current Password"
                  disabled={isSubmitting}
                />
                <span 
                  className="login-password-toggle" 
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
            </div>

            <div className="form-group">
              <div className="login-password-field">
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordValues.newPassword}
                  onChange={handleChange}
                  className={errors.newPassword ? "error" : ""}
                  placeholder="New Password"
                  disabled={isSubmitting}
                />
                <span 
                  className="login-password-toggle" 
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
            </div>

            <div className="form-group">
              <div className="login-password-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordValues.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "error" : ""}
                  placeholder="Confirm New Password"
                  disabled={isSubmitting}
                />
                <span 
                  className="login-password-toggle" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </span>
              </div>
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            {errors.general && (
              <div className="error-message" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '1rem', 
                justifyContent: 'center', 
                gap: '8px', 
                margin: '1rem 0', 
                textAlign: 'center' 
              }}>
                <FaExclamationCircle style={{ margin: 0, fontSize: '1.3rem', verticalAlign: 'middle' }} />
                <span style={{ verticalAlign: 'middle' }}>{errors.general}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="password-update-button"
            style={{
              background: "#fff",
              color: "#0B0809",
              border: "1px solid #2f3542",
              borderRadius: "8px",
              fontWeight: 500,
              transition: "none",
              width: "100%",
              padding: "0.875rem 1rem",
              fontSize: "1rem",
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Updating Password...' : 'Update Password'}
          </button>

          <div className="signup-back-link" style={{ marginTop: "-0.5rem" }}>
            <a 
              href="#" 
              style={{ color: '#1f98f4', textDecoration: 'none', fontWeight: 500 }} 
              onClick={(e) => { e.preventDefault(); onClose(); }}
            >
              &larr; Cancel
            </a>
          </div>
        </FormCard>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
