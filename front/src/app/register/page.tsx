import Link from "next/link";
import { HiMail, HiLockClosed } from "react-icons/hi";
import { HiArrowLeft } from "react-icons/hi2";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-toolgear-black-125 flex flex-col items-center justify-center px-6">
      <div className="bg-toolgear-black-100 border border-toolgear-gray-75 p-10 rounded-2xl w-full max-w-md shadow-xl">

        <h1 className="text-3xl font-bold text-toolgear-gray-0 mb-2 text-center">
          Criar Conta
        </h1>
        <p className="text-toolgear-gray-75 text-center mb-10">
          Cadastre-se usando apenas e-mail e senha
        </p>

        <form className="flex flex-col gap-6">

          <div className="flex flex-col gap-2">
            <label className="text-toolgear-gray-0 font-medium">E-mail</label>
            <div className="flex items-center gap-3 bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3">
              <HiMail className="text-toolgear-gray-75 text-xl" />
              <input
                type="email"
                className="bg-transparent flex-1 text-toolgear-gray-0 outline-none"
                placeholder="exemplo@empresa.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-toolgear-gray-0 font-medium">Senha</label>
            <div className="flex items-center gap-3 bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3">
              <HiLockClosed className="text-toolgear-gray-75 text-xl" />
              <input
                type="password"
                className="bg-transparent flex-1 text-toolgear-gray-0 outline-none"
                placeholder="Crie uma senha"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-toolgear-green-75 hover:bg-toolgear-green-100 transition-colors cursor-pointer py-3 rounded-xl text-white font-semibold"
          >
            Criar Conta
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