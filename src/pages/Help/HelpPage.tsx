import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Book, ChevronDown, ChevronUp } from 'lucide-react'
import type { Components } from 'react-markdown'
import { DOCS } from '../../config/docs'
import { ROUTES } from '../../constants/routes'
import gettingStarted from '../../docs/getting-started.md?raw'
import branches from '../../docs/branches.md?raw'
import sessions from '../../docs/sessions.md?raw'
import transactions from '../../docs/transactions.md?raw'
import inventory from '../../docs/inventory.md?raw'
import products from '../../docs/products.md?raw'
import clients from '../../docs/clients.md?raw'
import reports from '../../docs/reports.md?raw'
import theme from '../../docs/theme.md?raw'

const DOC_CONTENT: Record<string, string> = {
  'getting-started': gettingStarted,
  branches,
  sessions,
  transactions,
  inventory,
  products,
  clients,
  reports,
  theme,
}

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1
      className="text-xl font-bold text-content-900 dark:text-white mb-4 mt-2"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => {
    const id =
      typeof children === 'string'
        ? children.toLowerCase().replace(/\s+/g, '-')
        : undefined
    return (
      <h2
        id={id}
        className="text-lg font-semibold text-content-800 dark:text-content-100 mb-3 mt-6 pb-1.5 border-b border-surface-200 dark:border-surface-700"
        {...props}
      >
        {children}
      </h2>
    )
  },
  h3: ({ children, ...props }) => (
    <h3
      className="text-base font-semibold text-content-700 dark:text-content-200 mb-2 mt-4"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4
      className="text-sm font-semibold text-content-600 dark:text-content-300 mb-1 mt-3"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p
      className="text-sm text-content-600 dark:text-content-400 mb-3 leading-relaxed"
      {...props}
    >
      {children}
    </p>
  ),
  strong: ({ children, ...props }) => (
    <strong
      className="font-semibold text-content-700 dark:text-content-200"
      {...props}
    >
      {children}
    </strong>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc list-inside space-y-1 mb-3 text-sm text-content-600 dark:text-content-400"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal list-inside space-y-1 mb-3 text-sm text-content-600 dark:text-content-400"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto mb-4 rounded-lg border border-surface-200 dark:border-surface-700">
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-surface-50 dark:bg-surface-800/50" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-content-600 dark:text-content-300 uppercase tracking-wider border-b border-surface-200 dark:border-surface-700"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="px-3 py-2 text-sm text-content-600 dark:text-content-400 border-b border-surface-100 dark:border-surface-700/50"
      {...props}
    >
      {children}
    </td>
  ),
  code: ({ children, className, ...props }) => {
    const isInline = !className
    if (isInline) {
      return (
        <code
          className="inline px-1.5 py-0.5 text-xs font-mono rounded bg-surface-100 dark:bg-surface-700 text-brand-600 dark:text-brand-400"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <pre className="overflow-x-auto mb-4 p-3 rounded-lg bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
        <code
          className="text-xs font-mono text-content-700 dark:text-content-300 leading-relaxed"
          {...props}
        >
          {children}
        </code>
      </pre>
    )
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-brand-400 pl-4 py-1 mb-3 text-sm text-content-500 dark:text-content-400 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-brand-600 dark:text-brand-400 underline underline-offset-2 hover:text-brand-700 dark:hover:text-brand-300"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-surface-200 dark:border-surface-700" />,
}

export const HelpPage = () => {
  const navigate = useNavigate()

  const [expandedDoc, setExpandedDoc] = useDocExpansion()

  return (
    <div className="h-screen flex flex-col bg-surface-50 dark:bg-surface-900">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="shrink-0 px-4 pt-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(ROUTES.SETTINGS)}
            className="text-sm text-content-500 dark:text-content-400 hover:text-content-700 dark:hover:text-content-200 transition-colors mb-4 block"
          >
            ← Volver
          </button>

          <div className="flex items-center gap-3 mb-6">
            <Book className="size-6 text-brand-500" />
            <h1 className="text-xl font-bold text-content-900 dark:text-white">
              Manual de Usuario
            </h1>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-8 sm:px-6 lg:px-8 space-y-4">
          {/* Index */}
          <section className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700/50">
              <h2 className="text-sm font-semibold text-content-700 dark:text-content-300">
                Secciones
              </h2>
            </div>
            <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
              {DOCS.map((doc) => {
                const Icon = doc.icon
                const isExpanded = expandedDoc === doc.slug
                return (
                  <button
                    key={doc.slug}
                    onClick={() => setExpandedDoc(isExpanded ? null : doc.slug)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors"
                  >
                    <Icon className="size-5 text-content-400 dark:text-content-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-content-700 dark:text-content-300 block">
                        {doc.title}
                      </span>
                      <span className="text-xs text-content-400 dark:text-content-500 block truncate">
                        {doc.description}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-content-400 shrink-0" />
                    ) : (
                      <ChevronDown className="size-4 text-content-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Expanded doc content */}
          {expandedDoc && DOC_CONTENT[expandedDoc] && (
            <section className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
              <div className="px-4 py-5 sm:px-6 markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {DOC_CONTENT[expandedDoc]}
                </ReactMarkdown>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

function useDocExpansion(): [string | null, (slug: string | null) => void] {
  // Uses URL hash for state so it survives navigation and is shareable
  const hash =
    typeof window !== 'undefined' ? window.location.hash.replace('#', '') : ''

  const setExpanded = (slug: string | null) => {
    if (typeof window === 'undefined') return
    if (slug) {
      window.location.hash = slug
    } else {
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  return [hash || null, setExpanded]
}
