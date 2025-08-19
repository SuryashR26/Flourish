"use client"

import React, { useState, useCallback } from 'react'
import NotificationPopup, { NotificationProps } from './NotificationPopup'

interface NotificationContainerProps {
    children?: React.ReactNode
}

let notificationCounter = 0

const NotificationContainer: React.FC<NotificationContainerProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationProps[]>([])

    const addNotification = useCallback((notification: Omit<NotificationProps, 'id'>) => {
        const id = `notification-${++notificationCounter}`
        const newNotification: NotificationProps = {
            ...notification,
            id,
        }
        
        setNotifications(prev => [...prev, newNotification])
    }, [])

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id))
    }, [])

    // Expose addNotification method globally
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            ;(window as any).showNotification = addNotification
        }
    }, [addNotification])
    
    return (
        <>
            {children}
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 10001,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                }}
                className="notification-container"
            >
                {notifications.map(notification => (
                    <NotificationPopup
                        key={notification.id}
                        {...notification}
                        onRemove={removeNotification}
                    />
                ))}
            </div>
            <style jsx global>{`
                @media (max-width: 480px) {
                    .notification-container {
                        left: 20px !important;
                        right: 20px !important;
                    }
                    .notification-container .popup {
                        min-width: auto !important;
                        max-width: none !important;
                    }
                }
            `}</style>
        </>
    )
}

// Helper functions for easy access
export const showSuccessNotification = (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
        ;(window as any).showNotification({
            type: 'success',
            title,
            message,
            duration
        })
    }
}

export const showErrorNotification = (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
        ;(window as any).showNotification({
            type: 'error',
            title,
            message,
            duration
        })
    }
}

export default NotificationContainer 