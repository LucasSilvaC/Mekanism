"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Produto = {
  id: string
  nome: string
  tipo: string
  peso: string
  tamanho: string
  estoqueAtual: number
  estoqueMinimo: number
}

export const columns: ColumnDef<Produto>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "tipo",
    header: "Tipo",
  },
  {
    accessorKey: "peso",
    header: "Peso",
  },
  {
    accessorKey: "tamanho",
    header: "Tamanho",
  },
  {
    accessorKey: "estoqueAtual",
    header: "Estoque Atual",
  },
  {
    accessorKey: "estoqueMinimo",
    header: "Estoque Mínimo",
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const produto = row.original

      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="text-toolgear-purple-25 hover:text-toolgear-purple-75 cursor-pointer"
            onClick={() => console.log("Editar", produto.id)}
          >
            <Pencil size={18} />
          </Button>

          <Button
            variant="ghost"
            className="text-toolgear-red-50 hover:text-toolgear-red-75 cursor-pointer"
            onClick={() => console.log("Excluir", produto.id)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      )
    },
  },
]