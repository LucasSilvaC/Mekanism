"use client";

import Link from "next/link";
import { HiMail, HiLockClosed } from "react-icons/hi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviar credenciais para obter tokens JWT
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // SimpleJWT pode aceitar email se configurado
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Salvar tokens no localStorage
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        
        // Salvar informações do usuário se disponíveis
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        
        toast.success("Login realizado com sucesso!");
        
        // Redirecionar para dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        toast.error(data.detail || "Credenciais inválidas");
      }
    } catch (error) {
      toast.error("Erro de conexão com o servidor");
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-toolgear-black-125 flex flex-col items-center justify-center px-6">
      <div className="bg-toolgear-black-100 border border-toolgear-gray-75 p-10 rounded-2xl w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-toolgear-gray-0 mb-2 text-center">
          Acessar Conta
        </h1>
        <p className="text-toolgear-gray-75 text-center mb-10">
          Entre com seu e-mail e senha
        </p>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-toolgear-gray-0 font-medium">E-mail</label>
            <div className="flex items-center gap-3 bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3">
              <HiMail className="text-toolgear-gray-75 text-xl" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent flex-1 text-toolgear-gray-0 outline-none"
                placeholder="exemplo@empresa.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-toolgear-gray-0 font-medium">Senha</label>
            <div className="flex items-center gap-3 bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3">
              <HiLockClosed className="text-toolgear-gray-75 text-xl" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent flex-1 text-toolgear-gray-0 outline-none"
                placeholder="Digite sua senha"
                required
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full ${
              loading
                ? "bg-toolgear-gray-50 cursor-not-allowed"
                : "bg-toolgear-purple-75 hover:bg-toolgear-purple-100 cursor-pointer"
            } transition-colors py-3 rounded-xl text-toolgear-white font-semibold`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-toolgear-gray-50 text-sm text-center mt-6">
          Não tem conta?{" "}
          <Link
            href="/register"
            className="text-toolgear-purple-25 hover:text-toolgear-purple-50 transition-colors font-medium"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}