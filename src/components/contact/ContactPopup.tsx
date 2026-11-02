import { useEffect, useRef, useState } from 'react'
import type { FC, FormEvent, MouseEvent } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { CONTACT } from '@/config/site'
import { useCopy, useLang } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'
import { PopupTree } from './PopupTree'
import '@/styles/contact-popup.css'

const copy: Localized<{
  eyebrow: string
  title: [string, string]
  lead: string
  name: string
  phone: string
  email: string
  message: string
  messageHint: string
  talk: string
  send: string
  sending: string
  close: string
  doneTitle: [string, string]
  done: (name: string) => string
  doneClose: string
  error: string
  invalid: string
}> = {
  en: {
    eyebrow: "Let's grow together",
    title: ['Tell us about ', 'your brand.'],
    lead: 'We reply within one working day.',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    message: 'How can we help?',
    messageHint: 'A launch, a rebrand, more leads…',
    talk: 'Prefer to talk?',
    send: 'Send message',
    sending: 'Sending…',
    close: 'Close',
    doneTitle: ['The seed ', 'is planted.'],
    done: (name) => `Thank you, ${name}. We'll be in touch within one working day.`,
    doneClose: 'Back to the site',
    error: "Your message didn't go through. Please try again, or call us on",
    invalid: 'Please fill in your name, a valid email and your message.',
  },
  vi: {
    eyebrow: 'Cùng nhau phát triển',
    title: ['Kể cho chúng tôi về ', 'thương hiệu của bạn.'],
    lead: 'Chúng tôi phản hồi trong vòng một ngày làm việc.',
    name: 'Họ tên',
    phone: 'Số điện thoại',
    email: 'Email',
    message: 'Chúng tôi có thể giúp gì?',
    messageHint: 'Ra mắt sản phẩm, làm mới thương hiệu, thêm khách hàng…',
    talk: 'Muốn trò chuyện?',
    send: 'Gửi tin nhắn',
    sending: 'Đang gửi…',
    close: 'Đóng',
    doneTitle: ['Hạt giống ', 'đã được gieo.'],
    done: (name) => `Cảm ơn ${name}. Chúng tôi sẽ liên hệ trong vòng một ngày làm việc.`,
    doneClose: 'Quay lại trang',
    error: 'Tin nhắn chưa gửi được. Vui lòng thử lại, hoặc gọi cho chúng tôi:',
    invalid: 'Vui lòng điền họ tên, email hợp lệ và nội dung.',
  },
}

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'invalid'

interface ContactPopupProps {
  open: boolean
  onClose: () => void
}

/**
 * The "Let's grow together" form, in a native modal dialog (focus trap, Esc
 * and the backdrop come with it). Posts to /api/contact, which emails
 * CONTACT.email; see api/contact.ts.
 */
export const ContactPopup: FC<ContactPopupProps> = ({ open, onClose }) => {
  const t = useCopy(copy)
  const { lang } = useLang()
  const dialog = useRef<HTMLDialogElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [sender, setSender] = useState('')

  // the page behind doesn't scroll while the dialog is open
  useEffect(() => {
    const d = dialog.current
    if (!d || !open) return
    if (!d.open) d.showModal()
    document.documentElement.classList.add('contact-open')
    return () => {
      document.documentElement.classList.remove('contact-open')
      if (d.open) d.close()
    }
  }, [open])

  const handleClose = () => {
    // a sent form starts fresh next time; a draft is kept
    if (status === 'sent') setStatus('idle')
    onClose()
  }

  // Esc reaches handleClose through the dialog's close event; the buttons and
  // the backdrop don't wait for it (browsers may deliver it late)
  const dismiss = () => {
    dialog.current?.close()
    handleClose()
  }

  // a click on the dialog itself, outside the card, is a click on the backdrop
  const backdrop = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) dismiss()
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      setStatus('invalid')
      form.reportValidity()
      return
    }
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setSender(data.name.trim().split(/\s+/)[0] ?? '')
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  const sending = status === 'sending'

  return (
    <dialog
      ref={dialog}
      className="contact-popup"
      aria-labelledby="contact-popup-title"
      onClose={handleClose}
      onClick={backdrop}
    >
      <div className={`contact-popup-card${status === 'sent' ? ' is-sent' : ''}`}>
        <PopupTree active={open} />
        <button
          type="button"
          className="contact-popup-close"
          aria-label={t.close}
          onClick={dismiss}
        >
          <X size={18} strokeWidth={1.8} />
        </button>

        {status === 'sent' ? (
          <div className="contact-popup-done" role="status">
            <div className="contact-popup-burst" aria-hidden="true">
              <span />
              <span />
              <span />
              <i />
            </div>
            <p className="contact-popup-eyebrow">{t.eyebrow}</p>
            <h2 id="contact-popup-title" className="contact-popup-title">
              {t.doneTitle[0]}
              <em>{t.doneTitle[1]}</em>
            </h2>
            <p className="contact-popup-lead">{t.done(sender)}</p>
            <button
              type="button"
              className="contact-popup-send"
              onClick={dismiss}
              autoFocus
            >
              {t.doneClose}
            </button>
          </div>
        ) : (
          <form className="contact-popup-form" onSubmit={submit} noValidate>
            <p className="contact-popup-eyebrow">{t.eyebrow}</p>
            <h2 id="contact-popup-title" className="contact-popup-title">
              {t.title[0]}
              <em>{t.title[1]}</em>
            </h2>
            <p className="contact-popup-lead">{t.lead}</p>

            <div className="contact-popup-fields">
              <label className="contact-popup-field">
                <span>
                  {t.name} <b aria-hidden="true">*</b>
                </span>
                <input name="name" autoComplete="name" required maxLength={120} />
              </label>
              <label className="contact-popup-field">
                <span>{t.phone}</span>
                <input name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} />
              </label>
              <label className="contact-popup-field is-wide">
                <span>
                  {t.email} <b aria-hidden="true">*</b>
                </span>
                <input name="email" type="email" autoComplete="email" required maxLength={200} />
              </label>
              <label className="contact-popup-field is-wide">
                <span>
                  {t.message} <b aria-hidden="true">*</b>
                </span>
                <textarea name="message" rows={4} required maxLength={4000} placeholder={t.messageHint} />
              </label>
              {/* honeypot: hidden from people, filled in by bots */}
              <label className="contact-popup-trap" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {(status === 'error' || status === 'invalid') && (
              <p className="contact-popup-error" role="alert">
                {status === 'invalid' ? (
                  t.invalid
                ) : (
                  <>
                    {t.error} <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>.
                  </>
                )}
              </p>
            )}

            <div className="contact-popup-foot">
              <p className="contact-popup-talk">
                {t.talk} <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
              </p>
              <button type="submit" className="contact-popup-send" disabled={sending}>
                <span>{sending ? t.sending : t.send}</span>
                <span className="contact-popup-send-ring" aria-hidden="true">
                  <ArrowRight size={16} strokeWidth={2} />
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}
