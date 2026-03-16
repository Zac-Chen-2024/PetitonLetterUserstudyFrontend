export default function ThankYouPage() {
  const handleDone = () => {
    // window.close() only works on script-opened windows.
    // Workaround: open blank then close, or navigate to about:blank.
    window.open('about:blank', '_self');
    window.close();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6 shadow-[0_4px_12px_rgba(16,185,129,0.12)]">
        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-semibold text-slate-800 mb-3 tracking-tight">Thank You!</h1>
      <p className="text-base text-slate-500 mb-8 max-w-md leading-relaxed">
        Your participation has been recorded. You may now close this window.
      </p>

      <button
        onClick={handleDone}
        className="px-8 py-3 rounded-xl text-sm font-semibold bg-slate-800 text-white hover:bg-slate-900 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
      >
        Done
      </button>
    </div>
  );
}
