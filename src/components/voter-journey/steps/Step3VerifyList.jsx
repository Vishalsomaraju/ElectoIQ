export function Step3VerifyList() {
  return (
    <div className="space-y-6 text-sm text-slate-700 dark:text-white/80">
      <p>
        Before voting day, you must verify that your name is on the Electoral
        Roll.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          Visit{" "}
          <a
            href="https://electoralsearch.eci.gov.in"
            target="_blank"
            rel="noreferrer"
            className="text-purple-700 dark:text-purple-400 hover:underline"
          >
            electoralsearch.eci.gov.in
          </a>
        </li>
        <li>Search by Name + State + District + Assembly Constituency</li>
        <li>
          <strong>OR</strong> search by EPIC number (Voter ID card number)
        </li>
      </ul>
      <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 mt-4">
        <p className="font-bold text-red-700 dark:text-red-300 mb-1">
          If your name is not found:
        </p>
        <p className="text-red-800 dark:text-red-200/80 text-xs">
          File a complaint online, contact your BLO, or submit Form 6 again with
          supporting documents.
        </p>
      </div>
    </div>
  );
}
