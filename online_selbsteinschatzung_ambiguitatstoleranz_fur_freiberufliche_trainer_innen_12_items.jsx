import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, RotateCcw, Printer, Download } from "lucide-react";

// 12-Item Ambiguitätstoleranz-Test (Likert 1-5) – Fokus: freiberufliche Trainer:innen / Berater:innen
// Negativ gepolte Items: 3, 6, 8, 11 (Reverse-Scoring)

const QUESTIONS = [
  { id: 1, text: "Wenn ein potenzieller Kunde unklare Erwartungen formuliert, kann ich gelassen damit umgehen.", reverse: false },
  { id: 2, text: "Ich fühle mich wohl, wenn ich Trainings- oder Beratungsthemen flexibel an eine neue Zielgruppe anpassen muss.", reverse: false },
  { id: 3, text: "Es stresst mich, wenn Kund:innen kurzfristig ihre Anforderungen ändern.", reverse: true },
  { id: 4, text: "Wenn ein Akquisegespräch anders verläuft als erwartet, bleibe ich ruhig und anpassungsfähig.", reverse: false },
  { id: 5, text: "Unterschiedliche Sichtweisen innerhalb eines Auftraggeberteams empfinde ich als spannend und lehrreich.", reverse: false },
  { id: 6, text: "Ich mag es nicht, wenn ich ein Projekt beginne, ohne alle Details geklärt zu haben.", reverse: true },
  { id: 7, text: "Auch in komplexen Projekten mit vielen Beteiligten finde ich meinen Weg, selbst wenn Zuständigkeiten unklar sind.", reverse: false },
  { id: 8, text: "Wenn Kund:innen meine Konzepte kritisch hinterfragen, fühle ich mich verunsichert.", reverse: true },
  { id: 9, text: "Ich kann gut mit Situationen umgehen, in denen mehrere plausible Lösungswege existieren.", reverse: false },
  { id: 10, text: "Wenn ein Auftrag scheitert oder nicht zustande kommt, sehe ich das eher als Lernchance denn als Rückschlag.", reverse: false },
  { id: 11, text: "Ich empfinde es als unangenehm, wenn ich in einem Beratungsgespräch keine eindeutige Antwort geben kann.", reverse: true },
  { id: 12, text: "Ich sehe Unsicherheit in Kundenprojekten als natürlichen Bestandteil des freiberuflichen Arbeitens an.", reverse: false },
];

const SCALE = [
  { value: 1, label: "Stimme überhaupt nicht zu" },
  { value: 2, label: "Stimme eher nicht zu" },
  { value: 3, label: "Weder noch" },
  { value: 4, label: "Stimme eher zu" },
  { value: 5, label: "Stimme voll zu" },
];

function reverseScore(v: number) {
  // 1↔5, 2↔4, 3→3
  return 6 - v;
}

function categorize(total: number) {
  if (total <= 26) return { level: "Niedrig", color: "text-red-600", desc: "hoher Wunsch nach Klarheit/Planbarkeit in Kundenprojekten" };
  if (total <= 41) return { level: "Mittel", color: "text-amber-600", desc: "Umgang mit Ungewissheit ist kontextabhängig" };
  return { level: "Hoch", color: "text-emerald-600", desc: "flexible, gelassene Haltung gegenüber wechselnden Anforderungen" };
}

export default function AmbiguityToleranceAssessmentFreelancers() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = useMemo(() => QUESTIONS.every(q => answers[q.id] != null), [answers]);

  const { total, adjustedItems } = useMemo(() => {
    const adjusted: { id: number; raw: number | null; adj: number | null; reverse: boolean }[] = [];
    let sum = 0;
    QUESTIONS.forEach(q => {
      const raw = answers[q.id] ?? null;
      const adj = raw == null ? null : q.reverse ? reverseScore(raw) : raw;
      adjusted.push({ id: q.id, raw, adj, reverse: q.reverse });
      if (adj != null) sum += adj;
    });
    return { total: sum, adjustedItems: adjusted };
  }, [answers]);

  const category = useMemo(() => categorize(total), [total]);

  function handleChange(qid: number, value: number) {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  function toCSV() {
    const header = ["Item", "Negativ gepolt", "Antwort (1-5)", "Umkodiert (1-5)"];
    const rows = adjustedItems.map(r => [r.id, r.reverse ? "Ja" : "Nein", r.raw ?? "", r.adj ?? ""]);
    const totalRow = ["Gesamt", "", "", total];
    const csv = [header, ...rows, totalRow].map(r => r.join(";")) .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Ambiguitaetstoleranz_Trainerinnen_Test.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Ambiguitätstoleranz – Selbsteinschätzung für freiberufliche Trainer:innen & Berater:innen</h1>
            <p className="text-sm md:text-base text-slate-600 mt-2">Bitte kreuzen Sie bei jeder Aussage an, inwieweit Sie zustimmen (1 = stimme überhaupt nicht zu, 5 = stimme voll zu). Alle 12 Items sollten beantwortet werden.</p>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm md:text-base">
              <thead>
                <tr>
                  <th className="py-3 pr-3 font-medium text-slate-700">Aussage</th>
                  {SCALE.map(s => (
                    <th key={s.value} className="py-3 px-2 text-center font-medium text-slate-700 w-16">{s.value}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUESTIONS.map((q, idx) => (
                  <tr key={q.id} className={idx % 2 === 0 ? "bg-slate-50/60" : "bg-white"}>
                    <td className="py-3 pr-3 align-top">
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs">{q.id}</span>
                        <span>{q.text} {q.reverse && <em className="text-slate-500 text-xs ml-1">(negativ gepolt)</em>}</span>
                      </div>
                    </td>
                    {SCALE.map(s => (
                      <td key={s.value} className="py-3 px-2 text-center">
                        <input
                          aria-label={`Item ${q.id}: ${s.value}`}
                          type="radio"
                          name={`q-${q.id}`}
                          value={s.value}
                          checked={answers[q.id] === s.value}
                          onChange={() => handleChange(q.id, s.value)}
                          className="h-4 w-4 accent-slate-800"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!allAnswered && submitted && (
            <div className="mt-4 flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Bitte beantworten Sie alle 12 Items, um das Ergebnis zu sehen.</span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => { setSubmitted(true); }}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-slate-900 text-white shadow hover:shadow-md"
            >
              <CheckCircle2 className="h-4 w-4" /> Ergebnis anzeigen
            </button>
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-white ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Zurücksetzen
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-white ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-4 w-4" /> Drucken / PDF
            </button>
            <button
              onClick={toCSV}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-white ring-1 ring-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-4 w-4" /> Ergebnisse als CSV
            </button>
          </div>

          {allAnswered && submitted && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className="mt-8 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200">
              <p className="text-sm text-slate-500">Gesamtwerte-Bereich: 12 – 60 Punkte (nach Umkodierung der negativ gepolten Items).</p>
              <div className="mt-3 text-lg">
                <span className="font-medium">Ihr Gesamtscore: </span>
                <span className="font-semibold">{total} Punkte</span>
              </div>
              <div className="mt-1">
                <span className="font-medium">Einstufung: </span>
                <span className={`font-semibold ${category.color}`}>{category.level}</span>
                <span className="text-slate-600"> — {category.desc}</span>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-slate-700 font-medium">Details je Item (Rohwert &rarr; umkodiert)</summary>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {adjustedItems.map(it => (
                    <div key={it.id} className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                      <div className="text-sm"><span className="font-semibold">Item {it.id}</span>{it.reverse && <span className="ml-2 text-xs text-slate-500">(negativ)</span>}</div>
                      <div className="text-sm text-slate-700">Antwort: <span className="font-medium">{it.raw}</span> → Umkodiert: <span className="font-medium">{it.adj}</span></div>
                    </div>
                  ))}
                </div>
              </details>

              <div className="mt-5 text-sm text-slate-600">
                <p className="font-medium">Hinweis zur Interpretation</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Niedrig (12–26): hoher Wunsch nach Eindeutigkeit und Planbarkeit; klare Strukturen unterstützen Entscheidungen.</li>
                  <li>Mittel (27–41): Umgang mit Unsicherheit ist situationsabhängig; Austausch mit Auftraggeber:innen kann Klarheit schaffen.</li>
                  <li>Hoch (42–60): hohe Flexibilität und Lernorientierung; nützlich in Akquise- und Projektsituationen mit wechselnden Anforderungen.</li>
                </ul>
              </div>
            </motion.div>
          )}

          <footer className="mt-8 text-xs text-slate-500">
            © {new Date().getFullYear()} – Ambiguitätstoleranz-Selbsteinschätzung (Trainer:innen). Dieses Tool dient der Selbstreflexion und ersetzt keine Diagnostik.
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
