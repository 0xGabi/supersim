import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Toast, { ToastMessage } from './Toast';

let toastCount = 0;
const listeners = new Set<(toast: ToastMessage) => void>();

export const toast = {
    success: (title: string, message: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message: string) => addToast({ type: 'error', title, message }),
    info: (title: string, message: string) => addToast({ type: 'info', title, message }),
};

const addToast = ({ type, title, message }: Omit<ToastMessage, 'id'>) => {
    const id = ++toastCount;
    listeners.forEach(listener => listener({ id, type, title, message }));
    return id;
};

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const addToastMessage = (toast: ToastMessage) => {
            setToasts(prev => [...prev, toast]);
        };

        listeners.add(addToastMessage);
        return () => {
            listeners.delete(addToastMessage);
        };
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return createPortal(
        <div style={styles.container}>
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast}
                    onClose={removeToast}
                />
            ))}
        </div>,
        document.body
    );
};

const styles = {
    container: {
        position: 'fixed' as const,
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        maxWidth: '400px',
    },
}; 