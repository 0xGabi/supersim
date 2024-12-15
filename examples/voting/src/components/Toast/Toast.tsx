import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    type: ToastType;
    title: string;
    message: string;
}

interface ToastProps {
    message: ToastMessage;
    onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(message.id);
        }, 6000);

        return () => clearTimeout(timer);
    }, [message.id, onClose]);

    const getToastStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return { backgroundColor: '#E8F5E9', border: '1px solid #81C784', color: '#2E7D32' };
            case 'error':
                return { backgroundColor: '#FFEBEE', border: '1px solid #E57373', color: '#C62828' };
            case 'info':
                return { backgroundColor: '#E3F2FD', border: '1px solid #64B5F6', color: '#1976D2' };
        }
    };

    return (
        <div style={{
            ...styles.toast,
            ...getToastStyles(message.type)
        }}>
            <div style={styles.content}>
                <div style={styles.header}>
                    <strong>{message.title}</strong>
                    <button 
                        onClick={() => onClose(message.id)} 
                        style={styles.closeButton}
                    >
                        ×
                    </button>
                </div>
                <p style={styles.message}>{message.message}</p>
            </div>
        </div>
    );
};

const styles = {
    toast: {
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px',
        animation: 'slideIn 0.3s ease-out',
    },
    content: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    message: {
        margin: 0,
        fontSize: '14px',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '20px',
        cursor: 'pointer',
        padding: '0 4px',
        opacity: 0.6,
        ':hover': {
            opacity: 1,
        },
    },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(styleSheet);

export default Toast; 