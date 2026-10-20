import React from 'react'
import { Money, DeviceMobile, CreditCard } from '@phosphor-icons/react'
import { usePOS } from '../context/POSContext'

const PAYMENT_ICON = { Cash: Money, Transfer: DeviceMobile, POS: CreditCard }

export default function ReportsPage() {
  const { state, todaySales, todayRevenue, totalOutstandingDebt, outstandingDebts } = usePOS()

  const txCount    = todaySales.length
  const avgSale    = txCount > 0 ? Math.round(todayRevenue / txCount) : 0

  // Top products today
  const productTotals = {}
  todaySales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productTotals[item.name]) productTotals[item.name] = { revenue: 0, qty: 0 }
      productTotals[item.name].revenue += item.lineTotal
      productTotals[item.name].qty     += item.qty
    })
  })
  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)

  const maxRevenue = topProducts.length > 0 ? topProducts[0][1].revenue : 1

  // Payment breakdown
  const paymentBreakdown = {}
  todaySales.forEach(s => {
    paymentBreakdown[s.paymentMethod] = (paymentBreakdown[s.paymentMethod] || 0) + s.total
  })

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-3 sm:p-5 space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-400">Today — {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Today's revenue",    value: `₦${todayRevenue.toLocaleString()}`, color: 'text-green-600'  },
          { label: 'Transactions',       value: txCount,                              color: 'text-blue-600'   },
          { label: 'Avg. sale value',    value: `₦${avgSale.toLocaleString()}`,       color: 'text-gray-800'   },
          { label: 'Low / out of stock', value: `${state.products.filter(p => p.stock <= p.lowStockThreshold).length}`, color: 'text-yellow-700' },
          { label: 'Outstanding debt',   value: `₦${totalOutstandingDebt.toLocaleString()}`, color: 'text-amber-600', sub: `${outstandingDebts.length} customer${outstandingDebts.length === 1 ? '' : 's'}` },
        ].map(m => (
          <div key={m.label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <div className="text-xs text-gray-400 mb-1">{m.label}</div>
            <div className={`text-2xl font-semibold ${m.color}`}>{m.value}</div>
            {m.sub && <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* Top products */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top products today</h2>
          {topProducts.length === 0
            ? <div className="text-center py-8 text-gray-300 text-sm">No sales yet today</div>
            : topProducts.map(([name, data], i) => (
              <div key={name} className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-gray-400 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-700 mb-1 truncate">{name}</div>
                  <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#ea580c] h-full rounded-full" style={{ width: `${Math.round((data.revenue / maxRevenue) * 100)}%` }} />
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#ea580c] w-20 text-right">₦{data.revenue.toLocaleString()}</span>
              </div>
            ))
          }
        </div>

        {/* Payment breakdown */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Payment methods</h2>
          {Object.keys(paymentBreakdown).length === 0
            ? <div className="text-center py-8 text-gray-300 text-sm">No sales yet today</div>
            : Object.entries(paymentBreakdown).map(([method, total]) => {
              const Icon = PAYMENT_ICON[method] || CreditCard
              return (
                <div key={method} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon size={16} weight="bold" className="text-gray-500" />
                    <span className="text-sm text-gray-700">{method}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">₦{total.toLocaleString()}</span>
                </div>
              )
            })
          }
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent transactions</h2>
        {todaySales.length === 0
          ? <div className="text-center py-8 text-gray-300 text-sm">No sales recorded today</div>
          : <div className="space-y-2">
              {todaySales.slice(0, 10).map(sale => (
                <div key={sale.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-gray-700">{sale.receiptNo}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {sale.items.length} item{sale.items.length > 1 ? 's' : ''} · {sale.paymentMethod}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-600">₦{sale.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
