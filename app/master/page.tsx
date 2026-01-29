import { createClient } from '@/utils/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, CreditCard, Activity } from 'lucide-react'

export default async function MasterDashboard() {
  const supabase = await createClient()

  const { data: empresas } = await supabase
    .from('empresas')
    .select('*')
    .order('created_at', { ascending: false })

  const totalEmpresas = empresas?.length || 0
  const totalPro = empresas?.filter(e => e.plano === 'pro').length || 0
  const totalFree = totalEmpresas - totalPro

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmpresas}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assinantes PRO</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPro}</div>
            <p className="text-xs text-slate-400">Receita Estimada: R$ {totalPro * 99},00</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-slate-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Free</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFree}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-slate-800/50">
              <TableHead className="text-slate-400">Empresa</TableHead>
              <TableHead className="text-slate-400">Data Cadastro</TableHead>
              <TableHead className="text-slate-400">Plano</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {empresas?.map((empresa) => (
              <TableRow key={empresa.id} className="border-slate-800 hover:bg-slate-800/50">
                <TableCell className="font-medium text-slate-200">{empresa.nome}</TableCell>
                <TableCell className="text-slate-400">
                  {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Badge variant={empresa.plano === 'pro' ? 'default' : 'secondary'} className={empresa.plano === 'pro' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 text-slate-300'}>
                    {empresa.plano?.toUpperCase() || 'FREE'}
                  </Badge>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Activity className="h-3 w-3 text-emerald-500" /> Ativo
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}