import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Lock, Zap, BarChart3, Check, Bot, Clock, HeadphonesIcon, Sparkles } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 lg:px-6">
          <Link className="flex items-center justify-center" href="#">
            <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
            <span className="font-bold text-lg">ControlAI</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 sm:gap-6">
            <Link 
              className="text-sm font-medium hover:underline underline-offset-4 transition-colors" 
              href="#features"
            >
              Recursos
            </Link>
            <Link 
              className="text-sm font-medium hover:underline underline-offset-4 transition-colors" 
              href="#pricing"
            >
              Preços
            </Link>
            <Link 
              className="text-sm font-medium hover:underline underline-offset-4" 
              href="/login"
            >
              Entrar
            </Link>
            <Link href="/signup">
              <Button size="sm" className="ml-2">
                Começar Grátis
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm bg-primary/10 text-primary mb-4">
                  <Sparkles className="h-3 w-3 mr-2" />
                  Governança de IA para empresas modernas
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                  IA Corporativa com Controle Total
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-600 md:text-xl dark:text-gray-300">
                  Use ChatGPT e Claude na sua empresa sem comprometer dados sensíveis. 
                  Auditoria completa, gestão de custos e chaves criptografadas (BYOK).
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup">
                  <Button size="lg" className="h-12 px-8 text-base">
                    Começar Gratuitamente
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Sem cartão de crédito • Configure em 2 minutos
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-white dark:bg-slate-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Por que escolher o ControlAI?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
                Combine o poder da IA com a segurança e governança que sua empresa precisa
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Privacidade Total (BYOK)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Traga sua própria chave de API. Seus dados são criptografados com AES-256 e 
                    nunca usados para treinar modelos públicos.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Auditoria Completa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Saiba exatamente quem perguntou o quê e quando. Histórico centralizado 
                    e auditável para conformidade com LGPD e ISO 27001.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Agentes Personalizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Crie assistentes especializados para cada departamento (Jurídico, RH, Dev) 
                    com prompts de sistema protegidos e controlados.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Criptografia de Ponta</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Todas as chaves de API são criptografadas usando algoritmos 
                    de nível empresarial antes do armazenamento.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Multi-Modelo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Suporte para OpenAI GPT-4o, Claude e outros modelos. 
                    Escolha o melhor modelo para cada caso de uso.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Gestão de Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    Monitore o uso de tokens em tempo real e controle gastos 
                    com dashboards detalhados e alertas personalizados.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-16 md:py-24 lg:py-32 bg-slate-50 dark:bg-slate-800">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Planos transparentes e previsíveis
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-lg">
                Comece grátis e faça upgrade quando precisar de mais recursos
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="border-2 hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription className="text-base">
                    Perfeito para testar e validar
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">R$ 0</span>
                    <span className="text-gray-600 dark:text-gray-300 ml-2">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span><strong>1 Agente de IA</strong> personalizado</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span><strong>Histórico de 3 dias</strong> de conversas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Criptografia AES-256 (BYOK)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Auditoria básica de uso</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Suporte por email</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button variant="outline" size="lg" className="w-full">
                      Começar Grátis
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Pro Plan */}
              <Card className="border-2 border-primary shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-lg">
                  RECOMENDADO
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Pro
                    <Sparkles className="h-5 w-5 text-primary" />
                  </CardTitle>
                  <CardDescription className="text-base">
                    Para empresas em crescimento
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">R$ 99</span>
                    <span className="text-gray-600 dark:text-gray-300 ml-2">/mês</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span><strong>Agentes ilimitados</strong> personalizados</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span><strong>Histórico ilimitado</strong> de conversas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Criptografia AES-256 (BYOK)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Auditoria completa e relatórios</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span><strong>Suporte prioritário</strong> 24/7</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>Dashboard avançado de métricas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span>API para integrações</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/signup" className="w-full">
                    <Button size="lg" className="w-full">
                      Assinar Agora
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              Todos os planos incluem criptografia de ponta a ponta e conformidade com LGPD
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl max-w-3xl">
                Pronto para trazer IA com governança para sua empresa?
              </h2>
              <p className="max-w-2xl text-primary-foreground/90 text-lg">
                Comece gratuitamente hoje e veja como o ControlAI pode transformar 
                a forma como sua equipe usa inteligência artificial.
              </p>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-slate-50 dark:bg-slate-900">
        <div className="container px-4 md:px-6 mx-auto py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link className="flex items-center mb-4" href="#">
                <ShieldCheck className="h-6 w-6 mr-2 text-primary" />
                <span className="font-bold text-lg">ControlAI</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Governança de IA para empresas que levam segurança a sério.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                    Recursos
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    LGPD
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © 2024 ControlAI. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <HeadphonesIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}