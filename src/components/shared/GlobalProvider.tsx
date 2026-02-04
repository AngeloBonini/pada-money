'use client'

import React from 'react'
import { FinancialProvider } from '@/context/FinancialContext'
import { ProfileProvider } from '@/context/ProfileContext'

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <FinancialProvider>
        {children}
      </FinancialProvider>
    </ProfileProvider>
  )
}
