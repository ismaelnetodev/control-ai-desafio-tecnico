import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Lock, Zap, BarChart3 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="#">
          <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
          <span className="font-bold text-lg">ControlAI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4 flex items-center" href="/login">
            Entrar
          </Link>
          <Link href="/signup">
             <Button size="sm">Começar Agora</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Governança e Controle para IA Corporativa
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Use ChatGPT e Claude na sua empresa sem comprometer seus dados. 
                  Auditoria completa, gestão de custos e chaves criptografadas (BYOK).
                </p>
              </div>
              <div className="space-x-4 pt-4">
                <Link href="/signup">
                  <Button className="h-11 px-8">Criar Conta Grátis</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="h-11 px-8">Já tenho conta</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Privacidade Total (BYOK)</h2>
                <p className="text-gray-500">
                  Traga sua própria chave de API. Seus dados são criptografados e nunca usados para treinar modelos públicos.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Auditoria e Logs</h2>
                <p className="text-gray-500">
                  Saiba exatamente quem perguntou o quê. Histórico centralizado e auditável para conformidade.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Agentes Personalizados</h2>
                <p className="text-gray-500">
                  Crie assistentes especializados (Jurídico, RH, Dev) com prompts de sistema protegidos e controlados.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 ControlAI. Todos os direitos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Termos de Uso
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacidade
          </Link>
        </nav>
      </footer>
    </div>
  )
}