"use client";

import Link from "next/link";
import { HiMail, HiLockClosed } from "react-icons/hi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from 'react-toastify';

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          username: username || email.split('@')[0], 
          first_name: firstName,
          last_name: lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Conta criada com sucesso! Redirecionando para login...");
        
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(data.error || "Erro ao criar conta");
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
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="bg-toolgear-black-100 border border-toolgear-gray-75 p-10 rounded-2xl w-full max-w-md shadow-xl">
        <h1 className="text-3xl font-bold text-toolgear-gray-0 mb-2 text-center">
          Criar Conta
        </h1>
        <p className="text-toolgear-gray-75 text-center mb-10">
          Cadastre-se usando apenas e-mail e senha
        </p>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-toolgear-gray-0 font-medium">Nome</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none"
                placeholder="Primeiro nome"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-toolgear-gray-0 font-medium">Sobrenome</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none"
                placeholder="Sobrenome"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-toolgear-gray-0 font-medium">
              Nome de Usuário <span className="text-toolgear-gray-50 text-sm">(opcional)</span>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none"
              placeholder="seu_usuario"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-toolgear-gray-0 font-medium">E-mail *</label>
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
            <label className="text-toolgear-gray-0 font-medium">Senha *</label>
            <div className="flex items-center gap-3 bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3">
              <HiLockClosed className="text-toolgear-gray-75 text-xl" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent flex-1 text-toolgear-gray-0 outline-none"
                placeholder="Crie uma senha"
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
                : "bg-toolgear-green-75 hover:bg-toolgear-green-100 cursor-pointer"
            } transition-colors py-3 rounded-xl text-white font-semibold`}
          >
            {loading ? "Criando conta..." : "Criar Conta"}
          </button>
        </form>

        <p className="text-toolgear-gray-50 text-sm text-center mt-6">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-toolgear-purple-25 hover:text-toolgear-purple-50 cursor-pointer transition-colors font-medium"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}