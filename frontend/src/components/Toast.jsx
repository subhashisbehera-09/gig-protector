import { useApp } from '../context/AppContext';

const toastStyles = {
  info: { borderColor: 'var(--blue-l)' },
  success: { borderColor: 'var(--green-l)' },
  warning: { borderColor: '#fbbf24' },
  error: { borderColor: '#f87171' },
};

export const Toast = ({ toast }) => {
  const typeStyles = toastStyles[toast.type] || toastStyles.info;

  return (
    <div className="toast show" style={typeStyles}>
      {toast.message}
    </div>
  );
};

export const ToastContainer = () => {
  const { toasts } = useApp();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
