export function Step2Register() {
  return (
    <div className="space-y-6 text-sm text-slate-700 dark:text-white/80">
      <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
        <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="bg-blue-500 text-xs px-2 py-0.5 rounded text-white shadow-sm">
            Method 1
          </span>{" "}
          Online (Recommended)
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Go to{" "}
            <a
              href="https://voters.eci.gov.in"
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 dark:text-blue-400 hover:underline"
            >
              voters.eci.gov.in
            </a>
          </li>
          <li>
            Click "New Registration" → Fill <strong>Form 6</strong>
          </li>
          <li>
            Upload: Age proof (Aadhaar/Birth Certificate) + Address proof +
            Passport photo
          </li>
          <li>Submit and note your Application Reference Number</li>
        </ul>
      </div>
      <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
        <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="bg-slate-500 dark:bg-gray-500 text-xs px-2 py-0.5 rounded text-white shadow-sm">
            Method 2
          </span>{" "}
          Offline
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Visit your nearest Booth Level Officer (BLO) or Electoral
            Registration Officer
          </li>
          <li>Fill Form 6 (available free at ERO office)</li>
          <li>Submit with self-attested copies of documents</li>
        </ul>
      </div>
    </div>
  );
}
