'use client'

import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: React.ComponentType<any>
  color: string
  trend: string
}

const colorClasses = {
  blue: 'text-blue-600 bg-blue-100',
  green: 'text-green-600 bg-green-100',
  purple: 'text-purple-600 bg-purple-100',
  red: 'text-red-600 bg-red-100',
  gray: 'text-gray-600 bg-gray-100',
  emerald: 'text-emerald-600 bg-emerald-100',
  indigo: 'text-indigo-600 bg-indigo-100',
}

export default function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend 
}: StatsCardProps) {
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:border-gray-200 transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        
        <div className={`p-3 rounded-lg ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className={`text-xs font-medium px-2 py-1 rounded-full ${
          trend.includes('+') 
            ? 'text-green-700 bg-green-100' 
            : trend.includes('-')
            ? 'text-red-700 bg-red-100'
            : 'text-gray-700 bg-gray-100'
        }`}>
          {trend}
        </div>
        
        <div className="text-xs text-gray-400">vs last month</div>
      </div>
    </motion.div>
  )
}