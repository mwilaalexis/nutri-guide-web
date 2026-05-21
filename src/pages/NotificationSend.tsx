import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import { NotificationService } from "../services/notification.service";
import { httpErrorMessage } from "../utils/httpErrorMessage";
import { useToast } from "../components/ui/ToastProvider";
import type { CSSProperties } from "react";

export default function NotificationSend() {
  const toast = useToast();
  const navigate = useNavigate();
  const jwtEmail = AuthService.getCurrentUserEmail();
  const canBroadcast = useMemo(() => {
    const r = AuthService.getCurrentUserRole()?.toLowerCase() ?? "";
    return r === "admin" || r === "moderator";
  }, []);

  const [testOverride, setTestOverride] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [sendBusy, setSendBusy] = useState(false);
  const [sendMsg, setSendMsg] = useState<string | null>(null);

  const goToInbox = () => {
    navigate("/dashboard/notifications/inbox", { state: { justSent: true } });
  };

  const runSelfTest = async () => {
    setTestMsg(null);
    setTestBusy(true);
    try {
      const q = testOverride.trim();
      const { data } = await NotificationService.selfTest(q || undefined);
      const ok = `Test email queued for ${data.to}.`;
      setTestMsg(ok);
      toast.success(ok);
      goToInbox();
    } catch (e) {
      const m = httpErrorMessage(e, "Something went wrong.");
      setTestMsg(m);
      toast.error(m);
    } finally {
      setTestBusy(false);
    }
  };

  const sendStaffEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendMsg(null);
    setSendBusy(true);
    try {
      await NotificationService.sendEmail({
        to: to.trim(),
        subject: subject.trim(),
        htmlBody: htmlBody.trim(),
      });
      setSendMsg("Email sent.");
      toast.success("Email sent.");
      setTo("");
      setSubject("");
      setHtmlBody("");
      goToInbox();
    } catch (e) {
      const m = httpErrorMessage(e, "Something went wrong.");
      setSendMsg(m);
      toast.error(m);
    } finally {
      setSendBusy(false);
    }
  };

  const testOk = testMsg?.startsWith("Test") ?? false;
  const sendOk = sendMsg === "Email sent.";

  return (
    <div className="notifications-hub__panel app-page--narrow">
      <section className="app-panel ng-reveal" style={{ "--ng-delay": "0ms" } as CSSProperties}>
        <h2 className="app-panel__title">Test your delivery</h2>
        <p className="app-panel__desc">
          Sends a short confirmation message. By default it goes to the email on your account token
          {jwtEmail ? ` (${jwtEmail})` : " (add an override if your token has no email claim)."} The
          message is added to{" "}
          <Link to="/dashboard/notifications/inbox">Received</Link> automatically.
        </p>
        <div className="app-form-row">
          <label className="app-field" style={{ flex: 1, minWidth: "12rem" }}>
            <span className="app-field__label">Override recipient (optional)</span>
            <input
              className="app-input"
              type="email"
              autoComplete="email"
              placeholder="leave empty to use token email"
              value={testOverride}
              onChange={(e) => setTestOverride(e.target.value)}
            />
          </label>
          <button type="button" className="btn btn-primary" disabled={testBusy} onClick={() => void runSelfTest()}>
            {testBusy ? "Sending…" : "Send test email"}
          </button>
        </div>
        {testMsg && (
          <p className={`app-status ${testOk ? "app-status--ok" : "app-status--warn"}`} role="status">
            {testMsg}
          </p>
        )}
      </section>

      {canBroadcast && (
        <section className="app-panel ng-reveal" style={{ "--ng-delay": "50ms" } as CSSProperties}>
          <h2 className="app-panel__title">Send email (staff)</h2>
          <p className="app-panel__desc">
            Moderators and administrators can send a one-off HTML email through the API.
          </p>
          <form className="app-form-stack" onSubmit={(e) => void sendStaffEmail(e)}>
            <label className="app-field">
              <span className="app-field__label">To</span>
              <input className="app-input" required type="email" value={to} onChange={(e) => setTo(e.target.value)} />
            </label>
            <label className="app-field">
              <span className="app-field__label">Subject</span>
              <input className="app-input" required value={subject} onChange={(e) => setSubject(e.target.value)} />
            </label>
            <label className="app-field">
              <span className="app-field__label">HTML body</span>
              <textarea
                className="app-input"
                required
                rows={6}
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                placeholder="<p>Hello…</p>"
                style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={sendBusy}>
              {sendBusy ? "Sending…" : "Send email"}
            </button>
            {sendMsg && (
              <p className={`app-status ${sendOk ? "app-status--ok" : "app-status--warn"}`} role="status">
                {sendMsg}
              </p>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
