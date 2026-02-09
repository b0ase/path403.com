"use client"
import React, { useMemo, useState } from 'react'
import Ajv, { Options } from 'ajv'

type Props = {
  schema: object
  initialValue?: object
  onChange?: (value: object, isValid: boolean) => void
}

type AjvErrorLike = { instancePath?: string; dataPath?: string; message?: string }

function formatErrors(errors: AjvErrorLike[] | null | undefined): string[] {
  if (!errors) return []
  return errors.map((e) => `${(e.instancePath || e.dataPath || '/') as string} ${e.message as string}`)
}

export default function ContractEditor({ schema, initialValue, onChange }: Props) {
  const [jsonText, setJsonText] = useState(
    JSON.stringify(initialValue || {}, null, 2)
  )
  const [errors, setErrors] = useState<string[]>([])

  // Use an options object compatible with installed Ajv version
  const ajvOptions: Options = { allErrors: true }
  // Initialize Ajv with basic options; avoid external meta-schema and plugin deps during build
  const ajv = useMemo(() => new Ajv(ajvOptions), [ajvOptions])
  const validate = useMemo(() => ajv.compile(schema), [ajv, schema])

  const handleChange = (text: string) => {
    setJsonText(text)
    try {
      const value = JSON.parse(text)
      const valid = validate(value)
      const nextErrors = formatErrors(validate.errors)
      setErrors(nextErrors)
      onChange?.(value, !!valid)
    } catch (err) {
      setErrors([`JSON parse error: ${(err as Error).message}`])
      onChange?.({}, false)
    }
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">Contract Editor</h3>
        <span
          className={`px-2 py-1 rounded text-xs ${
            errors.length === 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
          }`}
        >
          {errors.length === 0 ? 'Valid' : 'Invalid'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">JSON (schema‑validated)</label>
          <textarea
            value={jsonText}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full h-72 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
          {errors.length > 0 && (
            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-200 text-sm">
              <ul className="list-disc pl-5">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Preview (read‑only)</label>
          <div className="h-72 overflow-auto bg-white/5 border border-white/10 rounded-lg p-3 text-gray-200 text-sm font-mono whitespace-pre-wrap scrollbar-always-visible">
            {(() => {
              try {
                const parsed = JSON.parse(jsonText)
                return <pre>{JSON.stringify(parsed, null, 2)}</pre>
              } catch {
                return <pre>{'// Invalid JSON'}</pre>
              }
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}


