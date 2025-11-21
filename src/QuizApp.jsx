import React, { useEffect, useState, useRef } from "react";

/**
 * Full Quiz App
 * - Create / Edit / Delete quizzes
 * - Take quiz with per-question timer
 * - Progress bar, scoring, results
 * - Persistence via localStorage
 *
 * Drop this file into src/QuizApp.jsx
 * Ensure Tailwind is configured and src/index.css is imported in main.jsx
 */

export default function QuizApp({ user }) {
  const STORAGE_KEY = "mini_project_quiz_v1";

  const defaultQuizzes = [
    {
      id: "sample-1",
      title: "General Knowledge",
      description: "A small sample quiz",
      timePerQuestion: 20,
      questions: [
        {
          id: "q1",
          text: "What is the capital of France?",
          choices: ["Paris", "London", "Rome", "Berlin"],
          answerIndex: 0,
        },
        {
          id: "q2",
          text: "Which planet is known as the Red Planet?",
          choices: ["Earth", "Mars", "Jupiter", "Venus"],
          answerIndex: 1,
        },
        {
          id: "q3",
          text: "2 + 2 * 2 = ?",
          choices: ["6", "8", "4", "2"],
          answerIndex: 0,
        },
      ],
    },
  ];

  const [quizzes, setQuizzes] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : defaultQuizzes;
    } catch {
      return defaultQuizzes;
    }
  });

  const [view, setView] = useState("library"); // library | edit | take | results
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [takingQuizId, setTakingQuizId] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
  }, [quizzes]);

  // CRUD
  function createNewQuiz() {
    const q = {
      id: `quiz-${Date.now()}`,
      title: "Untitled Quiz",
      description: "",
      timePerQuestion: 20,
      questions: [],
    };
    setQuizzes((s) => [q, ...s]);
    setEditingQuizId(q.id);
    setView("edit");
  }

  function saveQuiz(updated) {
    setQuizzes((s) => s.map((q) => (q.id === updated.id ? updated : q)));
    setEditingQuizId(null);
    setView("library");
  }

  function deleteQuiz(id) {
    if (!confirm("Delete this quiz? This cannot be undone.")) return;
    setQuizzes((s) => s.filter((q) => q.id !== id));
    if (takingQuizId === id) {
      setTakingQuizId(null);
      setView("library");
    }
  }

  function startQuiz(id) {
    setTakingQuizId(id);
    setResults(null);
    setView("take");
  }

  function finishQuiz(res) {
    setResults(res);
    setTakingQuizId(null);
    setView("results");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <Header
          user={user}
          onNew={() => createNewQuiz()}
          onShowLibrary={() => setView("library")}
        />

        <main className="mt-6">
          {view === "library" && (
            <QuizLibrary
              quizzes={quizzes}
              onEdit={(id) => {
                setEditingQuizId(id);
                setView("edit");
              }}
              onDelete={deleteQuiz}
              onStart={startQuiz}
            />
          )}

          {view === "edit" && (
            <QuizEditor
              initial={quizzes.find((q) => q.id === editingQuizId)}
              onSave={saveQuiz}
              onCancel={() => setView("library")}
              onDelete={deleteQuiz}
            />
          )}

          {view === "take" && (
            <QuizPlayer
              quiz={quizzes.find((q) => q.id === takingQuizId)}
              onFinish={finishQuiz}
              onCancel={() => setView("library")}
            />
          )}

          {view === "results" && results && (
            <QuizResults results={results} onBack={() => setView("library")} />
          )}
        </main>

        <footer className="mt-8 text-center text-xs text-gray-500">
          Made with ❤️ — username: <span className="font-semibold">{user}</span>
        </footer>
      </div>
    </div>
  );
}

/* ---------- Header ---------- */
function Header({ user, onNew, onShowLibrary }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold">Quiz Builder & Player</h1>
        <p className="text-sm text-gray-600">Create quizzes, take them, and track scores.</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onShowLibrary}
          className="px-3 py-1 rounded-md bg-white border text-sm"
        >
          Library
        </button>
        <button
          onClick={onNew}
          className="px-3 py-1 rounded-md bg-slate-800 text-white text-sm"
        >
          + New Quiz
        </button>
      </div>
    </header>
  );
}

/* ---------- Library ---------- */
function QuizLibrary({ quizzes, onEdit, onDelete, onStart }) {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Your Quizzes</h2>
      {quizzes.length === 0 && <p className="text-gray-600">No quizzes yet. Create one!</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-md">{q.title}</h3>
                <p className="text-sm text-gray-500">{q.description || "No description"}</p>
              </div>
              <div className="text-sm text-gray-400">{q.questions.length} Q</div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                className="px-3 py-1 rounded bg-slate-800 text-white text-sm"
                onClick={() => onStart(q.id)}
              >
                Take
              </button>
              <button
                className="px-3 py-1 rounded bg-white border text-sm"
                onClick={() => onEdit(q.id)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 rounded bg-white border text-sm text-red-600"
                onClick={() => onDelete(q.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Editor ---------- */
function QuizEditor({ initial, onSave, onCancel, onDelete }) {
  const [quiz, setQuiz] = useState(
    initial || {
      id: `quiz-${Date.now()}`,
      title: "Untitled Quiz",
      description: "",
      timePerQuestion: 20,
      questions: [],
    }
  );

  useEffect(() => {
    setQuiz(initial || { id: `quiz-${Date.now()}`, title: "Untitled Quiz", description: "", timePerQuestion: 20, questions: [] });
  }, [initial]);

  function updateField(field, value) {
    setQuiz((q) => ({ ...q, [field]: value }));
  }

  function addQuestion() {
    const q = {
      id: `q-${Date.now()}`,
      text: "New question",
      choices: ["Option 1", "Option 2"],
      answerIndex: 0,
    };
    setQuiz((s) => ({ ...s, questions: [...s.questions, q] }));
  }

  function updateQuestion(idx, patch) {
    setQuiz((s) => {
      const copy = JSON.parse(JSON.stringify(s));
      copy.questions[idx] = { ...copy.questions[idx], ...patch };
      return copy;
    });
  }

  function removeQuestion(idx) {
    setQuiz((s) => ({ ...s, questions: s.questions.filter((_, i) => i !== idx) }));
  }

  function addChoice(qIdx) {
    setQuiz((s) => {
      const copy = JSON.parse(JSON.stringify(s));
      copy.questions[qIdx].choices.push("New option");
      return copy;
    });
  }

  function updateChoice(qIdx, cIdx, text) {
    setQuiz((s) => {
      const copy = JSON.parse(JSON.stringify(s));
      copy.questions[qIdx].choices[cIdx] = text;
      return copy;
    });
  }

  function removeChoice(qIdx, cIdx) {
    setQuiz((s) => {
      const copy = JSON.parse(JSON.stringify(s));
      copy.questions[qIdx].choices = copy.questions[qIdx].choices.filter((_, i) => i !== cIdx);
      if (copy.questions[qIdx].answerIndex >= copy.questions[qIdx].choices.length) copy.questions[qIdx].answerIndex = 0;
      return copy;
    });
  }

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">Edit Quiz</h2>
          <p className="text-sm text-gray-500">Changes persist when you click Save.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded bg-white border" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="px-3 py-1 rounded bg-slate-800 text-white"
            onClick={() => {
              if (!quiz.title.trim()) return alert("Please add a title.");
              onSave(quiz);
            }}
          >
            Save
          </button>
          <button className="px-3 py-1 rounded bg-red-600 text-white" onClick={() => onDelete(quiz.id)}>
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <input
          value={quiz.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full p-3 rounded border"
          placeholder="Quiz title"
        />
        <input
          value={quiz.description}
          onChange={(e) => updateField("description", e.target.value)}
          className="w-full p-2 rounded border"
          placeholder="Short description"
        />

        <label className="text-sm text-gray-600">Time per question (seconds)</label>
        <input
          type="number"
          min={5}
          value={quiz.timePerQuestion}
          onChange={(e) => updateField("timePerQuestion", Math.max(5, Number(e.target.value) || 5))}
          className="w-40 p-2 rounded border"
        />

        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Questions</h3>
            <button className="px-3 py-1 rounded bg-slate-800 text-white" onClick={addQuestion}>
              + Add Question
            </button>
          </div>

          <div className="mt-3 space-y-4">
            {quiz.questions.map((ques, idx) => (
              <div key={ques.id} className="p-3 border rounded-md bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <input
                      value={ques.text}
                      onChange={(e) => updateQuestion(idx, { text: e.target.value })}
                      className="w-full p-2 rounded border"
                    />

                    <div className="mt-2">
                      {ques.choices.map((c, ci) => (
                        <div key={ci} className="flex gap-2 items-center mt-2">
                          <input
                            value={c}
                            onChange={(e) => updateChoice(idx, ci, e.target.value)}
                            className="flex-1 p-2 rounded border"
                          />
                          <select
                            value={ques.answerIndex}
                            onChange={(e) => updateQuestion(idx, { answerIndex: Number(e.target.value) })}
                            className="p-2 rounded border"
                          >
                            {ques.choices.map((_, k) => (
                              <option key={k} value={k}>
                                Correct: {k + 1}
                              </option>
                            ))}
                          </select>
                          <button className="px-2 py-1 rounded bg-white border" onClick={() => removeChoice(idx, ci)}>
                            Remove
                          </button>
                        </div>
                      ))}

                      <div className="mt-2">
                        <button className="px-2 py-1 rounded bg-white border" onClick={() => addChoice(idx)}>
                          + Choice
                        </button>
                        <button className="ml-2 px-2 py-1 rounded bg-white border" onClick={() => removeQuestion(idx)}>
                          Remove Question
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Player ---------- */
function QuizPlayer({ quiz, onFinish, onCancel }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz?.timePerQuestion ?? 20);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!quiz) return;
    setIndex(0);
    setAnswers({});
    setTimeLeft(quiz.timePerQuestion || 20);
  }, [quiz]);

  useEffect(() => {
    if (!quiz) return;
    clearInterval(timerRef.current);
    setTimeLeft(quiz.timePerQuestion || 20);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          goNext(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, quiz?.id]);

  if (!quiz) return <p>Quiz not found.</p>;
  const q = quiz.questions[index];
  if (!q) return <p>No questions in this quiz.</p>;

  function pick(choiceIndex) {
    setAnswers((a) => ({ ...a, [q.id]: choiceIndex }));
  }

  function goNext(auto = false) {
    const isLast = index >= quiz.questions.length - 1;
    if (!isLast) setIndex((i) => i + 1);
    else finish();
  }

  function goPrev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  function finish() {
    clearInterval(timerRef.current);
    const total = quiz.questions.length;
    let correct = 0;
    const perQuestion = quiz.questions.map((qq) => {
      const chosen = answers[qq.id];
      const isRight = chosen === qq.answerIndex;
      if (isRight) correct++;
      return { questionId: qq.id, chosen, correct: isRight, correctIndex: qq.answerIndex, text: qq.text, choices: qq.choices };
    });
    onFinish({ quizId: quiz.id, total, correct, perQuestion, timestamp: Date.now() });
  }

  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{quiz.title}</h2>
          <p className="text-sm text-gray-500">Question {index + 1} of {quiz.questions.length}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Time left</div>
          <div className="font-medium">{timeLeft}s</div>
        </div>
      </div>

      <div className="mt-4">
        <div className="p-4 rounded-md border bg-gray-50">
          <div className="font-medium">{q.text}</div>
          <div className="mt-3 space-y-2">
            {q.choices.map((c, ci) => (
              <label key={ci} className={`block p-2 rounded border cursor-pointer ${answers[q.id] === ci ? "bg-slate-800 text-white" : "bg-white"}`}>
                <input
                  type="radio"
                  name={q.id}
                  checked={answers[q.id] === ci}
                  onChange={() => pick(ci)}
                  className="mr-2"
                />
                {c}
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex gap-2">
            <button onClick={goPrev} className="px-3 py-1 rounded bg-white border">Previous</button>
            <button onClick={() => { goNext(false); }} className="px-3 py-1 rounded bg-slate-800 text-white">Next</button>
            <button onClick={finish} className="px-3 py-1 rounded bg-green-600 text-white">Finish</button>
          </div>
          <div>
            <button onClick={() => { if (confirm('Quit quiz? Progress will be lost.')) onCancel(); }} className="px-3 py-1 rounded bg-white border text-red-600">Quit</button>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div style={{ width: `${((index + 1) / quiz.questions.length) * 100}%` }} className="h-full rounded-full bg-slate-800" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Results ---------- */
function QuizResults({ results, onBack }) {
  return (
    <section className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Results</h2>
      <p className="mt-2">Score: <span className="font-bold">{results.correct}</span> / {results.total}</p>

      <div className="mt-4 space-y-2">
        {results.perQuestion.map((p, i) => (
          <div key={p.questionId} className="p-3 rounded border bg-gray-50">
            <div className="text-sm font-medium">Question {i + 1}</div>
            <div className={`text-sm ${p.correct ? "text-green-700" : "text-red-700"}`}>
              {p.correct ? "Correct" : "Wrong"} — correct answer: {p.choices ? p.choices[p.correctIndex] : p.correctIndex}
            </div>
            <div className="text-xs mt-1 text-gray-600">{p.text}</div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button onClick={onBack} className="px-3 py-1 rounded bg-slate-800 text-white">Back to library</button>
      </div>
    </section>
  );
}
