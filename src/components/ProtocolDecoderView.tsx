import React, { useState } from 'react';
import { Terminal, Send, CheckCircle, AlertTriangle, Cpu, Play } from 'lucide-react';

interface Props {
  onRefresh: () => void;
}

export const ProtocolDecoderView: React.FC<Props> = ({ onRefresh }) => {
  const [protocol, setProtocol] = useState<'GT06' | 'Teltonika'>('GT06');
  const [rawHex, setRawHex] = useState('78781f12190a050d302b0c410291990c010200321400010100000001000212340d0a');
  const [decodedResult, setDecodedResult] = useState<any>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sampleGT06 = '78781f12190a050d302b0c410291990c010200321400010100000001000212340d0a';
  const sampleTeltonika = '000000000000002b08010000018a1234567800028a1234017a12340000002d004108010000000000010000000100001234';

  const handleDecode = async () => {
    setIsDecoding(true);
    setErrorMessage('');
    setDecodedResult(null);

    try {
      const res = await fetch('/api/telemetry/packet-decoder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          protocol,
          rawHex: rawHex.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setDecodedResult(data);
        onRefresh();
      } else {
        setErrorMessage(data.error || 'Failed to decode packet');
      }
    } catch (err: any) {
      setErrorMessage(`Decoding exception: ${err.message}`);
    } finally {
      setIsDecoding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
          <span>Telematics Engineering Lab</span>
          <span aria-hidden="true">·</span>
          <span>Section 24 Protocol Pipeline</span>
          <span aria-hidden="true">·</span>
          <span>GT06 &amp; Teltonika Codec 8 Binary Decoders</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Raw Telematics Protocol Decoder &amp; Ingestion Sandbox
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Test binary packet parser. Raw device hex buffers are decoded into normalized telemetry structures, validated against protocol specifications, and pushed directly into the live vehicle state.
        </p>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Raw Payload Input (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Raw Binary Stream (Hex Input)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setProtocol('GT06');
                  setRawHex(sampleGT06);
                }}
                className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
              >
                GT06 GPS
              </button>
              <button
                type="button"
                onClick={() => {
                  setProtocol('Teltonika');
                  setRawHex(sampleTeltonika);
                }}
                className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
              >
                Teltonika Codec 8
              </button>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Target Protocol Parser</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProtocol('GT06')}
                  className={`py-2 px-3 rounded-lg border text-center font-mono font-medium cursor-pointer ${
                    protocol === 'GT06'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  GT06 (Concox / Jimi IoT)
                </button>
                <button
                  type="button"
                  onClick={() => setProtocol('Teltonika')}
                  className={`py-2 px-3 rounded-lg border text-center font-mono font-medium cursor-pointer ${
                    protocol === 'Teltonika'
                      ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Teltonika Codec 8/8E
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Hexadecimal Buffer Stream</label>
              <textarea
                rows={5}
                value={rawHex}
                onChange={e => setRawHex(e.target.value)}
                placeholder="Paste raw hex payload..."
                className="w-full p-2.5 bg-slate-950 font-mono text-emerald-400 text-xs rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Byte Count: {Math.floor(rawHex.replace(/\s+/g, '').length / 2)} bytes
              </span>
            </div>

            <button
              onClick={handleDecode}
              disabled={isDecoding}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isDecoding ? 'Decoding Payload...' : 'Decode & Ingest to Fleet'}</span>
            </button>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Normalized Telemetry Structure & Vehicle State Output (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Normalized Telemetry &amp; State Output
            </span>
            {decodedResult && (
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Valid Protocol Ingestion
              </span>
            )}
          </div>

          {decodedResult ? (
            <div className="space-y-3 flex-1 flex flex-col">
              {/* Telemetry Metric Summary Cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-500 block text-[11px]">Latitude</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {decodedResult.decodedTelemetry.latitude}°
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-500 block text-[11px]">Longitude</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {decodedResult.decodedTelemetry.longitude}°
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <span className="text-slate-500 block text-[11px]">Calculated Speed</span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {decodedResult.decodedTelemetry.speed} km/h
                  </span>
                </div>
              </div>

              {/* JSON Normalized Payload */}
              <div className="flex-1 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-y-auto max-h-[360px]">
                <pre className="font-mono text-xs text-sky-300 leading-relaxed">
                  {JSON.stringify(decodedResult, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-slate-400 text-xs py-12">
              <Cpu className="w-8 h-8 mb-2" />
              <span>Select a preset packet or enter hex bytes, then click Decode</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
