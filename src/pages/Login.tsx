import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrainFront, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import metroLogo from "@/assets/metro-sp-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Verificar se é o admin geral
    if (email === "admin@geral.com" && password === "123456") {
      localStorage.setItem("usuarioLogado", JSON.stringify({
        nome: "Administrador Geral",
        email: "admin@geral.com",
        cargo: "Administrador do Sistema",
        area: "TI",
        role: "admin_geral",
      }));
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
      return;
    }

    // Verificar credenciais no localStorage
    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
    const usuario = usuarios.find((u: any) => u.email === email && u.senha === password);

    if (!usuario) {
      toast.error("Email ou senha incorretos");
      return;
    }

    // Salvar sessão do usuário
    localStorage.setItem("usuarioLogado", JSON.stringify({
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      area: usuario.area,
      role: usuario.role,
    }));

    toast.success("Login realizado com sucesso!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 p-2">
            <img src={metroLogo} alt="Metrô São Paulo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sistema de Obras</h1>
          <p className="text-white/80">Metrô de São Paulo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Acesso ao Sistema</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seuemail@metrovsp.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4" />
              <span>Sistema seguro e auditado</span>
            </div>
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          © 2024 Companhia do Metropolitano de São Paulo - Metrô
        </p>
      </div>
    </div>
  );
};

export default Login;
