export function Step4VoterID() {
  return (
    <div className="space-y-4 text-sm text-slate-700 dark:text-white/80">
      <p>
        <strong>EPIC</strong> (Electors Photo Identity Card) is your official
        voter identity document.
      </p>
      <p>
        You can download the digital version (<strong>e-EPIC</strong>) from{" "}
        <a
          href="https://voters.eci.gov.in/e-epic"
          target="_blank"
          rel="noreferrer"
          className="text-orange-700 dark:text-orange-400 hover:underline"
        >
          voters.eci.gov.in/e-epic
        </a>{" "}
        which is fully valid for voting.
      </p>
      <div className="mt-6">
        <h4 className="font-bold text-slate-900 dark:text-white mb-2">
          Approved alternate IDs (if you don't have Voter ID):
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            "Aadhaar Card",
            "Passport",
            "Driving License",
            "PAN Card",
            "MNREGA Job Card",
            "Bank Passbook with photo",
          ].map((id) => (
            <div
              key={id}
              className="bg-slate-50 dark:bg-white/5 p-2 rounded border border-slate-200 dark:border-white/5 shadow-sm"
            >
              {id}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
