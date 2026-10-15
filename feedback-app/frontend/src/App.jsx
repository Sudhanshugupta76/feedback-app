import { useState, useEffect } from "react";

const API = "http://localhost:8080/api";

async function call(path, { method = "GET", body, uid } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { "Content-Type": "application/json", ...(uid ? { "X-User-Id": uid } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    let m = "Something went wrong (" + res.status + ")";
    try { m = JSON.parse(text).message || m; } catch {}
    throw new Error(m);
  }
  return text ? JSON.parse(text) : null;
}

function Msg({ m }) {
  return m ? <div className={"msg " + (m.ok ? "ok" : "err")}>{m.text}</div> : null;
}

function Login({ onLogin, goRegister }) {
  const [f, setF] = useState({ username: "", password: "" });
  const [m, setM] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    try { onLogin(await call("/auth/login", { method: "POST", body: f })); }
    catch (er) { setM({ text: er.message }); }
  };
  return (
    <form className="card" onSubmit={submit}>
      <h1>Login</h1>
      <Msg m={m} />
      <input placeholder="Username" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required />
      <input type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
      <button className="full">Log in</button>
      <p className="sub">Don't have an account? <button type="button" className="link" onClick={goRegister}>Sign up</button></p>
    </form>
  );
}

function Register({ goLogin }) {
  const [f, setF] = useState({ username: "", email: "", password: "", confirm: "" });
  const [m, setM] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setM({ text: "Passwords do not match" });
    try {
      await call("/auth/register", { method: "POST", body: { username: f.username, email: f.email, password: f.password } });
      goLogin();
    } catch (er) { setM({ text: er.message }); }
  };
  return (
    <form className="card" onSubmit={submit}>
      <h1>Register</h1>
      <Msg m={m} />
      <input placeholder="Username" value={f.username} onChange={set("username")} required />
      <input type="email" placeholder="Email" value={f.email} onChange={set("email")} required />
      <input type="password" placeholder="Password (min 6 characters)" value={f.password} onChange={set("password")} required />
      <input type="password" placeholder="Confirm password" value={f.confirm} onChange={set("confirm")} required />
      <button className="full">Sign up</button>
      <p className="sub">Already have an account? <button type="button" className="link" onClick={goLogin}>Log in</button></p>
    </form>
  );
}

function UserFeedback({ user, logout }) {
  const [tab, setTab] = useState("add");
  const [existing, setExisting] = useState(null);
  const [text, setText] = useState("");
  const [m, setM] = useState(null);

  const load = async () => {
    const f = await call("/feedback/me", { uid: user.id });
    setExisting(f);
    return f;
  };
  useEffect(() => { load().catch((e) => setM({ text: e.message })); }, []);

  const pick = (t) => {
    setTab(t); setM(null);
    setText(t === "edit" && existing ? existing.message : "");
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const isEdit = tab === "edit";
      const f = await call("/feedback/me", { method: isEdit ? "PUT" : "POST", uid: user.id, body: { message: text } });
      setExisting(f);
      setM({ ok: true, text: isEdit ? "Feedback updated" : "Feedback submitted" });
      if (!isEdit) { setTab("edit"); setText(f.message); }
    } catch (er) { setM({ text: er.message }); }
  };

  const blocked = (tab === "add" && existing) || (tab === "edit" && !existing);
  return (
    <div className="card">
      <div className="top"><span>Hi, {user.username}</span><button className="link" onClick={logout}>Log out</button></div>
      <h1>Feedback</h1>
      <div className="tabs">
        <button className={"ghost" + (tab === "add" ? " on" : "")} onClick={() => pick("add")}>Add Feedback</button>
        <button className={"ghost" + (tab === "edit" ? " on" : "")} onClick={() => pick("edit")}>Edit Feedback</button>
      </div>
      <Msg m={m} />
      {blocked ? (
        <p>{tab === "add" ? "You have already submitted feedback. Switch to Edit Feedback to change it." : "You have not submitted feedback yet. Switch to Add Feedback."}</p>
      ) : (
        <form onSubmit={submit}>
          <label>Your Feedback:</label>
          <textarea placeholder="Write your feedback here..." value={text} onChange={(e) => setText(e.target.value)} required />
          <button className="full">{tab === "edit" ? "Save changes" : "Submit"}</button>
        </form>
      )}
    </div>
  );
}

function Admin({ user, logout }) {
  const [rows, setRows] = useState([]);
  const [sel, setSel] = useState(null); // {mode: view|edit|new, id, message}
  const [m, setM] = useState(null);

  const load = () => call("/admin/feedback", { uid: user.id }).then(setRows).catch((e) => setM({ text: e.message }));
  useEffect(() => { load(); }, []);

  const open = async (mode, id) => {
    try { const f = await call("/admin/feedback/" + id, { uid: user.id }); setSel({ mode, id, message: f.message }); setM(null); }
    catch (e) { setM({ text: e.message }); }
  };
  const save = async () => {
    try {
      const isNew = sel.mode === "new";
      await call(isNew ? "/admin/feedback" : "/admin/feedback/" + sel.id, { method: isNew ? "POST" : "PUT", uid: user.id, body: { message: sel.message } });
      setSel(null); setM({ ok: true, text: "Saved" }); load();
    } catch (e) { setM({ text: e.message }); }
  };
  const remove = async (id) => {
    if (!confirm("Delete feedback #" + id + "?")) return;
    try { await call("/admin/feedback/" + id, { method: "DELETE", uid: user.id }); setM({ ok: true, text: "Deleted" }); load(); }
    catch (e) { setM({ text: e.message }); }
  };

  return (
    <div className="card wide">
      <div className="top"><span>Admin: {user.username}</span><button className="link" onClick={logout}>Log out</button></div>
      <h1>Admin Feedback Dashboard</h1>
      <Msg m={m} />
      <table>
        <thead><tr><th>ID</th><th>Feedback</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan="4">No feedback yet. Add the first one below.</td></tr>}
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td><td>{r.message}</td><td>{r.createdAt}</td>
              <td className="act">
                <button className="ghost sm" onClick={() => open("view", r.id)}>View</button>
                <button className="ghost sm" onClick={() => open("edit", r.id)}>Edit</button>
                <button className="danger sm" onClick={() => remove(r.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!sel && <button onClick={() => setSel({ mode: "new", message: "" })}>Add feedback</button>}
      {sel && (
        <div className="panel">
          <strong>{sel.mode === "view" ? "Feedback #" + sel.id : sel.mode === "edit" ? "Edit feedback #" + sel.id : "New feedback"}</strong>
          <textarea style={{ marginTop: 10 }} readOnly={sel.mode === "view"} value={sel.message} onChange={(e) => setSel({ ...sel, message: e.target.value })} />
          {sel.mode !== "view" && <button onClick={save}>Save</button>} <button className="ghost" onClick={() => setSel(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [page, setPage] = useState("login");
  const login = (u) => { localStorage.setItem("user", JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem("user"); setUser(null); setPage("login"); };

  if (user) return user.role === "ADMIN" ? <Admin user={user} logout={logout} /> : <UserFeedback user={user} logout={logout} />;
  return page === "register" ? <Register goLogin={() => setPage("login")} /> : <Login onLogin={login} goRegister={() => setPage("register")} />;
}
