import { RecurringManager } from '@/components/features/financial/RecurringManager'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function RecurringSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Custos Fixos</h1>
          <p className="text-muted-foreground">Configure suas entradas e saídas recorrentes para previsão.</p>
        </div>
      </div>
      
      <RecurringManager />
    </div>
  )
}
