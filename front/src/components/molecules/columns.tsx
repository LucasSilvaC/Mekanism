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

// Interface para as funções de callback
interface ColumnsProps {
  onEdit?: (produto: Produto) => void
  onDelete?: (produto: Produto) => void
}

// Função que cria as colunas com as funções de callback
export const createColumns = ({ onEdit, onDelete }: ColumnsProps = {}): ColumnDef<Produto>[] => [
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
    cell: ({ row }) => {
      const estoque = row.original.estoqueAtual
      const minimo = row.original.estoqueMinimo
      
      return (
        <div className="flex items-center gap-2">
          <span className={estoque <= minimo ? "text-red-400" : "text-green-400"}>
            {estoque}
          </span>
          {estoque <= minimo && (
            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
              Baixo
            </span>
          )}
        </div>
      )
    },
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
            onClick={() => onEdit?.(produto)}
          >
            <Pencil size={18} />
          </Button>

          <Button
            variant="ghost"
            className="text-toolgear-red-50 hover:text-toolgear-red-75 cursor-pointer"
            onClick={() => onDelete?.(produto)}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      )
    },
  },
]

// Export padrão para manter compatibilidade (sem funções de callback)
export const columns: ColumnDef<Produto>[] = createColumns()