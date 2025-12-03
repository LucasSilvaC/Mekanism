"use client";

import Image from "next/image";
import Mekanism from "../../../public/Mekanism.png";
import { OnHover } from "../atoms/on-hover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AiOutlineLogout } from "react-icons/ai";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Interface para definir o tipo do usuário
interface User {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    // Adicione outros campos que você tem no seu user object
}

export default function Header() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Recupera dados do usuário do localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser: User = JSON.parse(userData);
                setUser(parsedUser);
            } catch (error) {
                console.error('Erro ao parsear dados do usuário:', error);
            }
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        // Remove tokens e dados do usuário
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        toast.success('Logout realizado com sucesso!');
        
        // Redireciona para a página de login
        setTimeout(() => {
            router.push('/login');
        }, 500);
    };

    // Função para obter as iniciais do nome
    const getInitials = () => {
        if (!user) return "USER";
        
        const { first_name, last_name, username, email } = user;
        
        // Tenta usar primeiro e último nome
        if (first_name && last_name) {
            return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase();
        }
        
        // Tenta usar apenas o primeiro nome
        if (first_name) {
            return first_name.charAt(0).toUpperCase();
        }
        
        // Usa primeira letra do username
        if (username) {
            return username.charAt(0).toUpperCase();
        }
        
        // Usa primeira letra do email
        if (email) {
            return email.charAt(0).toUpperCase();
        }
        
        return "USER";
    };

    // Função para obter o nome completo ou email para exibição
    const getUserDisplayName = () => {
        if (!user) return "Usuário";
        
        const { first_name, last_name, username, email } = user;
        
        if (first_name && last_name) {
            return `${first_name} ${last_name}`;
        }
        
        if (first_name) {
            return first_name;
        }
        
        if (username) {
            return username;
        }
        
        if (email) {
            // Usa split apenas se email for string
            const emailString = String(email);
            return emailString.split('@')[0]; // Remove o domínio do email
        }
        
        return "Usuário";
    };

    return (
        <header className="flex items-center justify-between px-6 py-4 h-20 border-b border-toolgear-gray-75 bg-gradient-to-r from-toolgear-black-125 via-toolgear-black-125 to-toolgear-black-75 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <OnHover>
                    <div className="relative">
                        <Image
                            src={Mekanism}
                            alt="Logo Mekanism"
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                </OnHover>

                <div className="flex items-center gap-2">
                    <div className="w-px h-8 bg-gradient-to-b from-toolgear-purple-25 to-toolgear-purple-75"></div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-toolgear-purple-25 to-toolgear-purple-75 bg-clip-text text-transparent">
                        Mekanism
                    </h1>
                </div>
            </div>

            {!loading && (
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <OnHover>
                                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-toolgear-black-75 hover:bg-toolgear-black-50 transition-all duration-300 group cursor-pointer">
                                    <div className="text-sm font-medium text-toolgear-gray-50 group-hover:text-toolgear-gray-25 transition-colors">
                                        {getUserDisplayName()}
                                    </div>
                                    <Avatar className="h-8 w-8 border-2 border-toolgear-purple-25">
                                        {/* Se tiver foto de perfil, pode adicionar aqui */}
                                        {/* <AvatarImage src={user.avatar} alt={getUserDisplayName()} /> */}
                                        <AvatarFallback className="text-xs font-bold text-toolgear-purple-25">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </OnHover>
                            
                            <OnHover>
                                <button
                                    onClick={handleLogout}
                                    className="p-3 rounded-xl bg-toolgear-black-75 hover:bg-toolgear-purple-25 hover:border-toolgear-purple-50 transition-all duration-300 group"
                                    title="Sair"
                                >
                                    <AiOutlineLogout className="text-xl text-toolgear-gray-50 group-hover:text-toolgear-black-125 transition-colors" />
                                </button>
                            </OnHover>
                        </>
                    ) : (
                        // Se não houver usuário logado, mostra botão de login
                        <OnHover>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-4 py-2 rounded-xl bg-toolgear-purple-25 hover:bg-toolgear-purple-50 text-toolgear-black-125 font-medium transition-all duration-300"
                            >
                                Fazer Login
                            </button>
                        </OnHover>
                    )}
                </div>
            )}
        </header>
    );
}