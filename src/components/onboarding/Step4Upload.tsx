import { useRef, useState } from 'react'
// Trigger HMR update
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, FileText, Upload, X, ArrowRight } from 'lucide-react'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Placeholder for file type validation
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'text/csv']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export function Step4Upload({ onFinish, onBack }: { onFinish: (file: File | null) => void, onBack: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (f: File) => {
    // Simple validation
    if (ACCEPTED_TYPES.includes(f.type) || f.name.endsWith('.csv')) {
      setFile(f)
      setError(null)
    } else {
      setError('Por favor, envie apenas PDF, CSV ou Imagens (JPG/PNG).')
      alert('Por favor, envie apenas PDF, CSV ou Imagens (JPG/PNG).')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <CardHeader className="px-0">
        <CardTitle className="text-2xl">O Primeiro Upload</CardTitle>
        <CardDescription>
          Para inaugurar seu dashboard, envie seu extrato mais recente.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        
        {!file ? (
          <div
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
              ${isDragOver ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-blue-400 hover:bg-card/50'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Arraste seu extrato aqui</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Suportamos PDF, CSV e Imagens (max 5MB)
            </p>
            <Button variant="outline" size="sm">
              Selecionar Arquivo
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.csv"
              className="hidden"
              onChange={handleChange}
            />
          </div>
        ) : (
          <div className="border rounded-xl p-4 bg-card flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
              <X className="w-4 h-4 text-muted-foreground hover:text-red-500" />
            </Button>
          </div>
        )}

        {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-400 text-center"
            >
              {error}
            </motion.p>
          )}

        {!file && (
          <div className="text-center">
            <a href="/sample-extrato.csv" download className="text-xs text-blue-400 hover:text-blue-300 underline">
              Baixar modelo de CSV
            </a>
          </div>
        )}

        <div className="pt-4 flex justify-between items-center">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => onFinish(file)} 
              className={cn(
                "gap-2 transition-all", 
                file 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white" 
                  : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              )}
            >
              {file ? 'Finalizar e Analisar' : 'Pular por enquanto'}
              {file ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </motion.div>
  )
}
