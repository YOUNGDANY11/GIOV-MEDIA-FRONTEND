import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

import { Modal } from '../../components/ui/Modal'
import { Alert } from '../../components/Alert'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { icons } from '../../components/ui/icons'
import { formatBogotaDateTime, parseBogotaDateTime } from '../../utils/bogotaTime'

const toDate = (value) => String(value ?? '').slice(0, 10)
const toTime = (value) => String(value ?? '').slice(0, 5)

const parseStart = (training) => {
  return parseBogotaDateTime(training?.date, training?.time)
}

export function AttendanceQrModal({ open, training, onClose, windowMinutes = 40 }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState('qr')
  const [now, setNow] = useState(() => new Date())

  const start = useMemo(() => parseStart(training), [training])
  const end = useMemo(() => (start ? new Date(start.getTime() + windowMinutes * 60_000) : null), [start, windowMinutes])

  const isWithinWindow = Boolean(start && end && now >= start && now <= end)

  useEffect(() => {
    if (!open) return undefined

    setNow(new Date())
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [open, training?.id_training])

  const qrUrl = useMemo(() => {
    if (!training?.id_training) return ''
    const params = new URLSearchParams({ trainingId: String(training.id_training), status: 'Verificado' })
    return `${window.location.origin}/attendance/scan?${params.toString()}`
  }, [training])

  useEffect(() => {
    if (!open) return
    setTab(isWithinWindow ? 'qr' : 'info')
  }, [open, isWithinWindow])

  return (
    <Modal
      open={open}
      title="Asistencia QR"
      onClose={onClose}
      footer={<div className="flex items-center justify-end"><Button variant="secondary" onClick={onClose}>Cerrar</Button></div>}
    >
      {!training ? <Alert type="error">No se encontró el entrenamiento.</Alert> : null}

      {training ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" className={tab === 'info' ? '' : 'ghost'} onClick={() => setTab('info')}>Información</Button>
            <Button type="button" variant="secondary" className={tab === 'qr' ? '' : 'ghost'} onClick={() => setTab('qr')}>QR</Button>
            <Button type="button" variant="secondary" onClick={() => { onClose?.(); navigate(`/attendances/training/${training.id_training}`) }}>Asistencias</Button>
          </div>

          {tab === 'info' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Entrenamiento" value={training?.name ?? ''} readOnly />
              <Input label="Descripción" value={training?.description ?? ''} readOnly />
              <Input label="Fecha" value={toDate(training?.date)} readOnly />
              <Input label="Hora" value={toTime(training?.time)} readOnly />
              <Input label="Lugar" value={training?.location ?? ''} readOnly />
            </div>
          ) : null}

          {tab === 'qr' ? (
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/15 via-fuchsia-500/10 to-cyan-500/10" />
              <div className="relative">
              <div className="font-semibold text-neutral-100">QR para llenar asistencia</div>
              <div className="text-neutral-300 mt-2">
                {isWithinWindow
                  ? 'Disponible ahora. El deportista debe escanearlo y confirmar su asistencia.'
                  : 'No disponible. Solo se habilita dentro de la ventana de tiempo del entrenamiento.'}
              </div>

              {isWithinWindow ? (
                <div className="flex flex-col gap-4 mt-4">
                  <div className="grid place-items-center">
                    <QRCodeSVG value={qrUrl} size={220} bgColor="transparent" fgColor="#ffffff" includeMargin />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      icon={icons.copy}
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(qrUrl)
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      Copiar enlace
                    </Button>
                    <a className="inline-flex items-center h-11 px-4 rounded-xl border border-white/10 bg-black/20 text-neutral-200 hover:bg-white/5" href={qrUrl} target="_blank" rel="noreferrer">
                      <span>{icons.view}</span>
                      <span>Abrir</span>
                    </a>
                  </div>

                  <div className="text-neutral-400 break-words">{qrUrl}</div>
                </div>
              ) : null}

              {start && end ? (
                <div className="text-neutral-400 mt-3">
                  Ventana: {formatBogotaDateTime(start, { dateStyle: 'medium', timeStyle: 'short' })} — {formatBogotaDateTime(end, { hour: '2-digit', minute: '2-digit' })}
                </div>
              ) : null}
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </Modal>
  )
}
