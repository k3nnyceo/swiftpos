import React, { useEffect, useRef, useState } from 'react'
import Quagga from '@ericblade/quagga2'
import { Camera, X } from '@phosphor-icons/react'

export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef   = useRef(null)
  const [error, setError]   = useState(null)
  const [ready, setReady]   = useState(false)
  const lastCode  = useRef('')
  const lastTime  = useRef(0)

  useEffect(() => {
    Quagga.init({
      inputStream: {
        type: 'LiveStream',
        target: videoRef.current,
        constraints: {
          facingMode: 'environment', // rear camera on phones
          width:  { ideal: 640 },
          height: { ideal: 480 },
        },
      },
      decoder: {
        readers: [
          'ean_reader',
          'ean_8_reader',
          'code_128_reader',
          'code_39_reader',
          'upc_reader',
          'upc_e_reader',
        ],
      },
      locate: true,
    }, (err) => {
      if (err) {
        setError('Could not access camera. Please allow camera permission and try again.')
        return
      }
      Quagga.start()
      setReady(true)
    })

    Quagga.onDetected((result) => {
      const code = result?.codeResult?.code
      if (!code) return
      // Debounce — ignore same code within 2 seconds
      const now = Date.now()
      if (code === lastCode.current && now - lastTime.current < 2000) return
      lastCode.current = code
      lastTime.current = now
      onDetected(code)
    })

    return () => {
      Quagga.offDetected()
      Quagga.stop()
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl overflow-hidden w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252c3f]">
          <div>
            <h2 className="text-white font-semibold text-sm">Scan barcode</h2>
            <p className="text-gray-400 text-xs mt-0.5">Point camera at product barcode</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#252c3f] text-gray-400 flex items-center justify-center hover:text-white transition-colors">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Camera view */}
        <div className="relative bg-black" style={{ height: 280 }}>
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Camera size={40} weight="bold" className="text-gray-500 mb-3" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div ref={videoRef} className="w-full h-full" />
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-56 h-32">
                  {/* Corner brackets */}
                  {[
                    'top-0 left-0 border-t-2 border-l-2',
                    'top-0 right-0 border-t-2 border-r-2',
                    'bottom-0 left-0 border-b-2 border-l-2',
                    'bottom-0 right-0 border-b-2 border-r-2',
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-6 h-6 border-[#ea580c] ${cls}`} />
                  ))}
                  {/* Scan line animation */}
                  {ready && (
                    <div className="absolute left-0 right-0 h-0.5 bg-[#ea580c] opacity-80"
                      style={{ animation: 'scanline 2s linear infinite', top: '50%' }} />
                  )}
                </div>
              </div>
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-400 text-sm">Starting camera...</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer tip */}
        <div className="px-5 py-4 text-center">
          <p className="text-gray-500 text-xs">
            💡 Using a USB barcode scanner? Just scan directly — no camera needed
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 10%; }
          50%  { top: 90%; }
          100% { top: 10%; }
        }
      `}</style>
    </div>
  )
}
