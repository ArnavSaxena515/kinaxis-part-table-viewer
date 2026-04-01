export default function ErrorState({ errorType, errorMessage, onRetry, onKeepWaiting, onCancel }) {
  const errors = {
    TRIGGER_FAILED: {
      icon: 'error',
      title: 'Trigger Failed',
      message: 'Failed to start harmonization workflow. Please check your connection and try again.',
      showRetry: true,
    },
    POLLING_TIMEOUT: {
      icon: 'schedule',
      title: 'Taking Longer Than Expected',
      message: 'The harmonization is taking longer than expected. The workflow is still running — you can wait or try again later.',
      showKeepWaiting: true,
      showCancel: true,
    },
    WORKFLOW_ERROR: {
      icon: 'warning',
      title: 'Workflow Error',
      message: 'The harmonization workflow encountered an error. Please check the workflow logs in Refold and try again.',
      showRetry: true,
    },
    NETWORK_ERROR: {
      icon: 'wifi_off',
      title: 'Connection Lost',
      message: 'Lost connection to the server. Please check your network and try again.',
      showRetry: true,
    },
    EMPTY_DATA: {
      icon: 'inbox',
      title: 'No Records Found',
      message: 'The workflow completed but returned no records. This may mean the SAP source system has no material master data configured.',
      showRetry: true,
      retryLabel: 'Re-run',
    },
    CORS_ERROR: {
      icon: 'block',
      title: 'CORS Error',
      message: 'Unable to connect to the Refold API from this domain. Please check CORS configuration or run the app from an allowed origin.',
      showRetry: false,
    },
  };

  const error = errors[errorType] || errors.WORKFLOW_ERROR;

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-lg mx-auto">
      <span
        className="material-symbols-outlined text-5xl text-on-surface-variant mb-4"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
      >
        {error.icon}
      </span>

      <h3 className="text-sm font-black uppercase tracking-widest text-charcoal mb-2">
        {error.title}
      </h3>

      <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
        {errorMessage || error.message}
      </p>

      <div className="flex gap-3">
        {error.showRetry && (
          <button
            onClick={onRetry}
            className="bg-primary text-on-primary px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container transition-colors"
          >
            {error.retryLabel || 'Retry'}
          </button>
        )}

        {error.showKeepWaiting && (
          <button
            onClick={onKeepWaiting}
            className="bg-primary text-on-primary px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary-container transition-colors"
          >
            Keep Waiting
          </button>
        )}

        {error.showCancel && (
          <button
            onClick={onCancel}
            className="bg-surface-container-highest text-charcoal px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-high transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
