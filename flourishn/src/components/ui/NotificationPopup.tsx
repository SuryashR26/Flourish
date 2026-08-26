"use client"

import React, { useState, useEffect } from 'react'

export interface NotificationProps {
    id: string
    type: 'success' | 'error'
    title: string
    message: string
    duration?: number
    onClose?: (id: string) => void
}

interface NotificationPopupProps extends NotificationProps {
    onRemove: (id: string) => void
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
    id,
    type,
    title,
    message,
    duration = 5000,
    onClose,
    onRemove
}) => {
    const [progress, setProgress] = useState(100)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Trigger slide-in animation
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (duration <= 0) return

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 100))
                if (newProgress <= 0) {
                    clearInterval(progressInterval)
                    handleClose()
                    return 0
                }
                return newProgress
            })
        }, 100)

        return () => clearInterval(progressInterval)
    }, [duration])

    const handleClose = () => {
        setIsVisible(false)
        onClose?.(id)
        setTimeout(() => {
            onRemove(id)
        }, 300)
    }

    return (
        <div
            className={`popup ${type} ${isVisible ? 'show' : ''}`}
            style={{
                background: '#f4f5f7',
                border: `1px solid ${type === 'success' ? '#1f98f4' : '#ff3860'}`,
                borderRadius: '8px',
                padding: '16px 20px',
                minWidth: '320px',
                maxWidth: '380px',
                transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s ease',
                position: 'relative',
                marginBottom: '10px',
            }}
        >
            <button
                className="close-btn"
                onClick={handleClose}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'none',
                    border: 'none',
                    fontSize: '14px',
                    color: '#6b7280',
                    cursor: 'pointer',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease',
                    padding: 0,
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1f98f4'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6b7280'
                }}
            >
                ×
            </button>
            <div
                className="popup-header"
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    marginBottom: '8px',
                }}
            >
                <div className="popup-content" style={{ flex: 1 }}>
                    <div
                        className="popup-title"
                        style={{
                            fontWeight: 500,
                            fontSize: '1rem',
                            color: '#14171c',
                            margin: '0 0 4px 0',
                        }}
                    >
                        {title}
                    </div>
                    <div
                        className="popup-message"
                        style={{
                            color: '#9aa3af',
                            fontSize: '0.9rem',
                            fontWeight: 400,
                            lineHeight: 1.4,
                            margin: '0 0 12px 0',
                        }}
                    >
                        {message}
                    </div>
                </div>
            </div>
            <div
                className="progress-container"
                style={{
                    background: 'rgba(20, 23, 28, 0.08)',
                    height: '2px',
                    borderRadius: '1px',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <div
                    className="progress-bar"
                    style={{
                        height: '100%',
                        borderRadius: '1px',
                        transition: 'width 0.1s linear',
                        width: `${progress}%`,
                        background: type === 'success' ? '#1f98f4' : '#ff3860',
                    }}
                />
            </div>
        </div>
    )
}

export default NotificationPopup 